import CONST from './CONST';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import type {Octokit} from '@octokit/core';
// @ts-ignore
import type {PaginateInterface} from '@octokit/plugin-paginate-rest';
import type {MessageContent, TextContentBlock} from 'openai/resources/beta/threads/index';
// @ts-ignore
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';

if (!globalThis.fetch) {
    globalThis.fetch = fetch as any;
}

const MAX_POLL_COUNT = Math.floor(CONST.OPENAI_POLL_TIMEOUT / CONST.OPENAI_POLL_RATE);

class OpenAIUtils {
    private static ai: OpenAI;

    private static assistantID: string;

    static init(apiKey?: string, assistantID?: string) {
        // @ts-ignore - process is not imported
        const key = apiKey ?? process.env.OPENAI_API_KEY;
        if (!key) {
            throw new Error('Could not initialize OpenAI: No key provided.');
        }
        this.ai = new OpenAI({apiKey: key});
        // @ts-ignore - process is not imported
        this.assistantID = assistantID ?? process.env.OPENAI_ASSISTANT_ID;
    }

    static get openAI() {
        if (!this.ai) {
            this.init();
        }
        return this.ai;
    }

    static async prompt(userMessage: string) {
        // start a thread run
        let threadRun = await this.openAI.beta.threads.createAndRun({
            /* eslint-disable @typescript-eslint/naming-convention */
            assistant_id: this.assistantID,
            thread: {messages: [{role: CONST.OPENAI_ROLES.USER, content: userMessage}]},
        });

        // poll for run completion
        let response = '';
        let count = 0;
        while (!response && count < MAX_POLL_COUNT) {
            // await thread run completion
            threadRun = await this.openAI.beta.threads.runs.retrieve(threadRun.thread_id, {thread_id: threadRun.id});
            if (threadRun.status !== CONST.OPENAI_THREAD_COMPLETED) {
                count++;
                // @ts-ignore - Promise exists
                await new Promise((resolve) => {
                    setTimeout(resolve, CONST.OPENAI_POLL_RATE);
                });
                continue;
            }

            // @ts-ignore - list does return array
            for await (const message of this.openAI.beta.threads.messages.list(threadRun.thread_id)) {
                if (message.role !== CONST.OPENAI_ROLES.ASSISTANT) {
                    continue;
                }
                console.log('message.content:', message.content);
                response += message.content
                    .map((contentBlock) => this.isTextContentBlock(contentBlock) && contentBlock.text.value)
                    .join('\n')
                    .trim();
                console.log('Parsed assistant response:', response);
            }

            if (!response) {
                throw new Error('Assistant response is empty or had no text content. This is unexpected.');
            }
        }
        return response;
    }

    static isTextContentBlock(contentBlock: MessageContent): contentBlock is TextContentBlock {
        return contentBlock?.type === 'text';
    }
}

type Constructor<T> = new (...args: any[]) => T;

export declare const GitHubType: (new (...args: unknown[]) => Record<string, unknown>) & {
    new (...args: unknown[]): Record<string, unknown>;
    plugins: unknown[];
} & typeof Octokit &
    Constructor<
        RestEndpointMethods & {
            paginate: PaginateInterface;
        }
    >;

export default OpenAIUtils;
