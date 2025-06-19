import {setFailed} from '@actions/core';
import {context, getOctokit} from '@actions/github';
import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import {format} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import CONST from './libs/CONST';
import OpenAIUtils from './libs/OpenAIUtils';
import {GitHubType} from './libs/OpenAIUtils';

type AssistantResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED;
    message: string;
    similarity?: number;
}

function transformToNumber(value: unknown): number {
    switch (typeof value) {
        case 'number':
            return value;
        case 'string':
            if (!isNaN(Number(value))) {
                return Number(value);
            } else {
                return 0;
            }
        default:
            return 0;
    }
}

function sanitizeJSONStringValues(inputString: string): string {
    function replacer(str: string): string {
        return (
            {
                '\\': '\\\\',
                '\t': '\\t',
                '\n': '\\n',
                '\r': '\\r',
                '\f': '\\f',
                '"': '\\"',
            }[str] ?? ''
        );
    }

    if (typeof inputString !== 'string') {
        throw new TypeError('Input must be of type String.');
    }

    try {
        const parsed = JSON.parse(inputString) as unknown;

        // Function to recursively sanitize string values in an object
        const sanitizeValues = (obj: unknown): unknown => {
            if (typeof obj === 'string') {
                return obj.replace(/\\|\t|\n|\r|\f|"/g, replacer);
            }
            if (Array.isArray(obj)) {
                return obj.map((item) => sanitizeValues(item));
            }
            if (obj && typeof obj === 'object') {
                const result: Record<string, unknown> = {};
                for (const key of Object.keys(obj)) {
                    result[key] = sanitizeValues((obj as Record<string, unknown>)[key]);
                }
                return result;
            }
            return obj;
        };

        return JSON.stringify(sanitizeValues(parsed));
    } catch (e) {
        throw new Error('Invalid JSON input.');
    }
};

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
}

function isCommentEditedEvent(payload: IssueCommentEvent): payload is IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.EDITED;
}

class ProposalPolicePrompt {
    static getPromptForNewProposalTemplateCheck(commentBody?: string): string {
        return `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${commentBody}`;
    }

    static getPromptForNewProposalDuplicateCheck(existingProposal?: string, newProposalBody?: string): string {
        return `I NEED HELP WITH CASE (3.), COMPARE THE FOLLOWING TWO PROPOSALS. ONLY CONSIDER THE FOLLOWING SECTIONS: (1) WHAT IS THE ROOT CAUSE OF THAT PROBLEM? (2) WHAT CHANGES DO YOU THINK WE SHOULD MAKE IN ORDER TO SOLVE THE PROBLEM? EXTRACT THESE SECTIONS FROM BOTH PROPOSALS AND RETURN A SIMILARITY PERCENTAGE (0-100) REPRESENTING HOW SIMILAR THESE TWO PROPOSALS ARE IN THOSE SECTIONS. \n\nProposal 1:\n${existingProposal}\n\nProposal 2:\n${newProposalBody}`;
    }

    static getPromptForEditedProposal(previousBody?: string, editedBody?: string): string {
        return `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${previousBody}.\n\nEdited comment content: ${editedBody}`;
    }
}

// Main function to process the workflow event
async function run() {
    // Capture the timestamp immediately at the start of the run
    const now = Date.now();
    const zonedDate = utcToZonedTime(now, 'UTC');
    const formattedDate = format(zonedDate, "yyyy-MM-dd HH:mm:ss 'UTC'");

    // @ts-ignore - process is not imported
    const octokit: InstanceType<typeof GitHubType> = getOctokit(process.env.GITHUB_TOKEN);
    // Verify this is running for an expected webhook event
    if (context.eventName !== CONST.EVENTS.ISSUE_COMMENT) {
        throw new Error('ProposalPolice™ only supports the issue_comment webhook event');
    }

    const payload = context.payload as IssueCommentEvent;

    // check if the issue is open and the has labels
    if (payload.issue?.state !== 'open' && !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
        return;
    }

    // Verify that the comment is not empty and contains the case sensitive `Proposal` keyword
    if (!payload.comment?.body.trim() || !payload.comment.body.includes(CONST.PROPOSAL_KEYWORD)) {
        console.log('Comment body is either empty or does not contain the keyword "Proposal"', payload.comment?.body);
        return;
    }

    // If event is `edited` and comment was already edited by the bot, return early
    if (isCommentEditedEvent(payload) && payload.comment?.body.trim().includes('Edited by **proposal-police**')) {
        console.log('Comment was already edited by proposal-police once.\n', payload.comment?.body);
        return;
    }

    console.log('ProposalPolice™ Action triggered for comment:', payload.comment?.body);
    console.log('-> GitHub Action Type: ', payload.action?.toUpperCase());

    if (!isCommentCreatedEvent(payload) && !isCommentEditedEvent(payload)) {
        console.error('Unsupported action type:', payload?.action);
        setFailed(new Error(`Unsupported action type ${payload?.action}`));
        return;
    }

    const prompt = isCommentCreatedEvent(payload)
        ? ProposalPolicePrompt.getPromptForNewProposalTemplateCheck(payload.comment?.body) 
        : ProposalPolicePrompt.getPromptForEditedProposal(payload.changes.body?.from, payload.comment?.body);

    const assistantResponse = await OpenAIUtils.prompt(prompt);
    const parsedAssistantResponse: AssistantResponse = JSON.parse(sanitizeJSONStringValues(assistantResponse));
    console.log('parsedAssistantResponse: ', parsedAssistantResponse);

    // fallback to empty strings to avoid crashing in case parsing fails and we fallback to empty object
    const {action = "", message = ""} = parsedAssistantResponse ?? {};
    const isNoAction = action.trim() === CONST.NO_ACTION;
    const isActionEdit = action.trim() === CONST.ACTION_EDIT;
    const isActionRequired = action.trim() === CONST.ACTION_REQUIRED;

    const issueNumber = payload.issue?.number ?? -1;
    const commentID = payload.comment?.id ?? -1;

    // DUPLICATE PROPOSAL DETECTION
    if (isCommentCreatedEvent(payload)) {
        console.log('DUPLICATE PROPOSAL DETECTION Check Initialized');
        const newProposalCreatedAt = new Date(payload.comment.created_at).getTime();
        const newProposalBody = payload.comment.body;
        const newProposalAuthor = payload.comment.user.login;
        // Fetch all comments in the issue
        console.log('Get issue comments payload for issue #', issueNumber);
        const commentsResponse = await octokit.issues.listComments({
            ...context.repo,
            issue_number: issueNumber,
            per_page: 100,
        });
        console.log('commentsResponse', commentsResponse);
        // Find previous proposals
        const previousProposals = commentsResponse?.data?.filter((comment: any) =>
            new Date(comment.created_at).getTime() < newProposalCreatedAt &&
            comment.body &&
            comment.body.includes(CONST.PROPOSAL_KEYWORD)
        );

        let isDuplicate = false;
        for (const previousProposal of previousProposals) {
            const duplicateCheckPrompt = ProposalPolicePrompt.getPromptForNewProposalDuplicateCheck(previousProposal.body, newProposalBody);
            const duplicateCheckResponse = await OpenAIUtils.prompt(duplicateCheckPrompt);
            let similarityPercentage = 0;
            try {
                const parsedDuplicateCheckResponse = JSON.parse(sanitizeJSONStringValues(duplicateCheckResponse));
                console.log('parsedDuplicateCheckResponse: ', parsedDuplicateCheckResponse);
                const {similarity = 0} = parsedDuplicateCheckResponse ?? {};
                similarityPercentage = transformToNumber(similarity);
            } catch (e) {
                console.error('Failed to parse AI similarity response:', duplicateCheckResponse);
            }

            if (similarityPercentage >= 90) {
                console.log(`Found duplicate with %${similarityPercentage} similarity.`);
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate) {
            const duplicateCheckWithdrawMessage = '#### 🚫 Duplicated proposal withdrawn by ProposalPolice.';
            const duplicateCheckNoticeMessage = `🚫 {user} Your proposal is a duplicate of an already existing proposal and has been automatically withdrawn to prevent spam. Please review the existing proposals before submitting a new one.`.replace('{user}', `@${newProposalAuthor}`);
            // If a duplicate proposal is detected, update the comment to withdraw it
            console.log('ProposalPolice™ withdrawing duplicated proposal...');
            await octokit.issues.updateComment({
                ...context.repo,
                comment_id: commentID,
                body: duplicateCheckWithdrawMessage,
            });
            // Post a comment to notify the user about the withdrawn duplicated proposal
            console.log('ProposalPolice™ notifying contributor of withdrawn proposal...');
            await octokit.issues.createComment({
                ...context.repo,
                issue_number: issueNumber,
                body: duplicateCheckNoticeMessage,
            });
            return;
        }
    }

    // If assistant response is NO_ACTION and there's no message, do nothing
    if (isNoAction && !message) {
        console.log('Detected NO_ACTION for comment, returning early.');
        return;
    }

    if (isCommentCreatedEvent(payload) && isActionRequired) {
        console.log('payload.comment?.url', payload.comment?.url);
        console.log('payload.comment?.html_url', payload.comment?.html_url);
        const formattedResponse = message
            // replace {user} from response template with GH @username
            // @ts-ignore - replaceAll exists
            .replaceAll('{user}', `@${payload.comment?.user.login}`);

        // Create a comment with the assistant's response
        console.log('ProposalPolice™ commenting on issue...');
        await octokit.issues.createComment({
            ...context.repo,
            issue_number: issueNumber,
            body: formattedResponse,
        });
    // edit comment if assistant detected substantial changes
    } else if (isActionEdit) {
        const formattedResponse = message.replace('{updated_timestamp}', formattedDate);
        console.log('ProposalPolice™ editing issue comment...', payload.comment.id);
        await octokit.issues.updateComment({
            ...context.repo,
            comment_id: commentID,
            body: `${formattedResponse}\n\n${payload.comment?.body}`,
        });
    }
}

run().catch((error) => {
    console.error(error);
    // @ts-ignore - process is not imported
    process.exit(0); // Zero status ensures no failure notification
});
