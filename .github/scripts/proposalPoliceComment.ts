import {setFailed} from '@actions/core';
import {context, getOctokit} from '@actions/github';
import type {IssueCommentCreatedEvent, IssueCommentEditedEvent, IssueCommentEvent} from '@octokit/webhooks-types';
import {format} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import CONST from './libs/CONST';
import OpenAIUtils from './libs/OpenAIUtils';
import type {GitHubType} from './libs/OpenAIUtils';


function isCommentCreatedOrEditedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent | IssueCommentEditedEvent {
    return payload.action === CONST.ACTIONS.CREATED || payload.action === CONST.ACTIONS.EDIT;
}

function isCommentCreatedEvent(payload: IssueCommentEvent): payload is IssueCommentCreatedEvent {
    return payload.action === CONST.ACTIONS.CREATED;
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

    console.log('ProposalPolice™ Action triggered for comment:', payload.comment?.body);
    console.log('-> GitHub Action Type: ', payload.action?.toUpperCase());

    if (!isCommentCreatedOrEditedEvent(payload)) {
        console.error('Unsupported action type:', payload?.action);
        setFailed(new Error(`Unsupported action type ${payload?.action}`));
        return;
    }

    const prompt = isCommentCreatedEvent(payload)
        ? `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${payload.comment?.body}`
        : `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${payload.changes.body?.from}.\n\nEdited comment content: ${payload.comment?.body}`;

    const assistantResponse = await OpenAIUtils.prompt(prompt);
    console.log('assistantResponse: ', assistantResponse);
    
    // check if assistant response is either NO_ACTION or "NO_ACTION" strings
    // as sometimes the assistant response varies
    // @ts-ignore - process is not imported
    const isNoAction = assistantResponse.trim().replaceAll(' ', '_').replaceAll('"', '').toUpperCase() === CONST.NO_ACTION;

    // If assistant response is NO_ACTION, do nothing
    if (isNoAction) {
        console.log('Detected NO_ACTION for comment, returning early');
        return;
    }

    // if the assistant responded with no action but there's some context in the response
    if (assistantResponse.includes(`[${CONST.NO_ACTION}]`)) {
        // extract the text after [NO_ACTION] from assistantResponse since this is a
        // bot related action keyword
        const noActionContext = assistantResponse.split(`[${CONST.NO_ACTION}] `)?.[1]?.replace('"', '');
        console.log('[NO_ACTION] w/ context: ', noActionContext);
        return;
    }

    if (isCommentCreatedEvent(payload)) {
        const formattedResponse = assistantResponse
            // replace {user} from response template with @username
            // @ts-ignore - process is not imported
            .replaceAll('{user}', `@${payload.comment?.user.login}`)

            // replace {proposalLink} from response template with the link to the comment
            .replaceAll('{proposalLink}', payload.comment?.html_url)

            // remove any double quotes from the final comment because sometimes the assistant's
            // response contains double quotes / sometimes it doesn't
            .replaceAll('"', '');

        // Create a comment with the assistant's response
        console.log('ProposalPolice™ commenting on issue...');
        await octokit.issues.createComment({
            ...context.repo,
            /* eslint-disable @typescript-eslint/naming-convention */
            issue_number: payload.issue?.number ?? -1,
            body: formattedResponse,
        });
    } else {
        // edit comment if assistant detected substantial changes and if the comment was not edited already by the bot
        if (assistantResponse.includes('[EDIT_COMMENT]') && !payload.comment?.body.includes('Edited by **proposal-police**')) {
            // extract the text after [EDIT_COMMENT] from assistantResponse since this is a
            // bot related action keyword
            let extractedNotice = assistantResponse.split('[EDIT_COMMENT] ')?.[1]?.replace('"', '');
            extractedNotice = extractedNotice.replace('{updated_timestamp}', formattedDate);
            console.log('ProposalPolice™ editing issue comment...', payload.comment.id);
            await octokit.issues.updateComment({
                ...context.repo,
                /* eslint-disable @typescript-eslint/naming-convention */
                comment_id: payload.comment?.id ?? -1,
                body: `${extractedNotice}\n\n${payload.comment?.body}`,
            });
        }
    }
}

run().catch((error) => {
    console.error(error);
    // @ts-ignore - process is not imported
    process.exit(0); // Zero status ensures no failure notification
});
