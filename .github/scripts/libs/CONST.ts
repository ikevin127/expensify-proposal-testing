const CONST = {
    LABELS: {
        HELP_WANTED: 'Help Wanted',
    },
    ACTIONS: {
        CREATED: 'created',
        EDIT: 'edited',
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
    OPENAI_POLL_RATE: 1500,
    OPENAI_POLL_TIMEOUT: 90000,
    OPENAI_THREAD_COMPLETED: 'completed',
} as const;

export default CONST;
