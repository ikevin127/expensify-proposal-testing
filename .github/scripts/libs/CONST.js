"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST = {
    LABELS: {
        OPEN: 'open',
        BOT: 'Bot',
        GITHUB_ACTIONS: 'github-actions',
        HELP_WANTED: 'Help Wanted',
    },
    ACTIONS: {
        CREATED: 'created',
        EDITED: 'edited',
    },
    EVENTS: {
        ISSUE_COMMENT: 'issue_comment',
    },
    OPENAI_ROLES: {
        USER: 'user',
        ASSISTANT: 'assistant',
    },
    PROPOSAL_KEYWORD: 'Proposal',
    NO_ACTION: 'NO_ACTION',
    ACTION_EDIT: 'ACTION_EDIT',
    ACTION_REQUIRED: 'ACTION_REQUIRED',
    ACTION_HIDE_DUPLICATE: 'ACTION_HIDE_DUPLICATE',
    OPENAI_POLL_RATE: 1500,
    OPENAI_POLL_TIMEOUT: 90000,
    OPENAI_THREAD_COMPLETED: 'completed',
};
exports.default = CONST;
