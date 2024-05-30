import {context, getOctokit} from '@actions/github';
import InitOpenAI from 'openai';
import CONST from './libs/CONST';
import type {GitHubType} from './libs/OpenAIUtils';
import * as OpenAIUtils from './libs/OpenAIUtils';

// @ts-ignore - process is not imported
const OpenAI = new InitOpenAI({apiKey: process.env.OPENAI_API_KEY});

async function processIssueComment(octokit: InstanceType<typeof GitHubType>) {
    const payload = context.payload;
    console.log('processIssueComment - payload:', payload);
    // @ts-ignore - process is not imported
    const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    // check if the issue is open and the has labels
    if (payload.issue?.state !== 'open' && !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
        return;
    }

    if (!OPENAI_ASSISTANT_ID) {
        console.error('OPENAI_ASSISTANT_ID missing from the environment variables');
        return;
    }

    if (!payload.comment?.body.trim()) {
        return;
    }
    console.log('Action triggered for comment:', payload.comment?.body);

    // 1, check if comment is proposal and if proposal template is followed
    const content = `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${payload.comment?.body}`;

    console.log('Comment body content for assistant:', content);

    // create thread with first user message and run it
    const createAndRunResponse = await OpenAI.beta.threads.createAndRun({
        /* eslint-disable @typescript-eslint/naming-convention */
        assistant_id: OPENAI_ASSISTANT_ID ?? '',
        thread: {messages: [{role: 'user', content}]},
    });

    await OpenAIUtils.prompt({createAndRunResponse, payload, octokit});
}

// Main function to process the workflow event
async function run() {
    // @ts-expect-error - process is not imported
    const octokit: InstanceType<typeof GitHubType> = getOctokit(process.env.GITHUB_TOKEN);
    await processIssueComment(octokit);
}

run().catch((error) => {
    console.error(error);
    // @ts-ignore - process is not imported
    process.exit(1);
});
