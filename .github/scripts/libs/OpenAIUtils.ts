import CONST from './CONST';
import OpenAI from 'openai';
import type {Octokit} from '@octokit/core';
// @ts-ignore
import type {PaginateInterface} from '@octokit/plugin-paginate-rest';
import type {MessageContent, TextContentBlock} from 'openai/resources/beta/threads/index';
// @ts-ignore
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';

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
        // 1. Create a thread
        const thread = await this.openAI.beta.threads.create({
            messages: [{role: CONST.OPENAI_ROLES.USER, content: userMessage}],
        });

        // 2. Create a run on the thread
        let run = await this.openAI.beta.threads.runs.create(thread.id, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assistant_id: this.assistantID,
        });

        // 3. Poll for completion
        let response = '';
        let count = 0;
        while (!response && count < MAX_POLL_COUNT) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            run = await this.openAI.beta.threads.runs.retrieve(run.id, {thread_id: thread.id});
            if (run.status !== CONST.OPENAI_THREAD_COMPLETED) {
                count++;
                await new Promise((resolve) => {
                    setTimeout(resolve, CONST.OPENAI_POLL_RATE);
                });
                continue;
            }

            // @ts-ignore - list is array type
            for await (const message of this.openAI.beta.threads.messages.list(thread.id)) {
                if (message.role !== CONST.OPENAI_ROLES.ASSISTANT) {
                    continue;
                };
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
