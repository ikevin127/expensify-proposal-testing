"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@actions/core");
var github_1 = require("@actions/github");
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var CONST_1 = require("./libs/CONST");
var OpenAIUtils_1 = require("./libs/OpenAIUtils");
function transformToNumber(value) {
    switch (typeof value) {
        case 'number':
            return value;
        case 'string':
            if (!isNaN(Number(value))) {
                return Number(value);
            }
            else {
                return 0;
            }
        default:
            return 0;
    }
}
function sanitizeJSONStringValues(inputString) {
    function replacer(str) {
        var _a;
        return ((_a = {
            '\\': '\\\\',
            '\t': '\\t',
            '\n': '\\n',
            '\r': '\\r',
            '\f': '\\f',
            '"': '\\"',
        }[str]) !== null && _a !== void 0 ? _a : '');
    }
    if (typeof inputString !== 'string') {
        throw new TypeError('Input must be of type String.');
    }
    try {
        var parsed = JSON.parse(inputString);
        // Function to recursively sanitize string values in an object
        var sanitizeValues_1 = function (obj) {
            if (typeof obj === 'string') {
                return obj.replace(/\\|\t|\n|\r|\f|"/g, replacer);
            }
            if (Array.isArray(obj)) {
                return obj.map(function (item) { return sanitizeValues_1(item); });
            }
            if (obj && typeof obj === 'object') {
                var result = {};
                for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
                    var key = _a[_i];
                    result[key] = sanitizeValues_1(obj[key]);
                }
                return result;
            }
            return obj;
        };
        return JSON.stringify(sanitizeValues_1(parsed));
    }
    catch (e) {
        throw new Error('Invalid JSON input.');
    }
}
;
function isCommentCreatedEvent(payload) {
    return payload.action === CONST_1.default.ACTIONS.CREATED;
}
function isCommentEditedEvent(payload) {
    return payload.action === CONST_1.default.ACTIONS.EDITED;
}
var ProposalPoliceTemplates = /** @class */ (function () {
    function ProposalPoliceTemplates() {
    }
    ProposalPoliceTemplates.getPromptForNewProposalTemplateCheck = function (commentBody) {
        return "I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH \"".concat(CONST_1.default.NO_ACTION, "\" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ").concat(commentBody);
    };
    ProposalPoliceTemplates.getPromptForNewProposalDuplicateCheck = function (existingProposal, newProposalBody) {
        return "I NEED HELP WITH CASE (3.), COMPARE THE FOLLOWING TWO PROPOSALS. ONLY CONSIDER THE FOLLOWING SECTIONS: (1) WHAT IS THE ROOT CAUSE OF THAT PROBLEM? (2) WHAT CHANGES DO YOU THINK WE SHOULD MAKE IN ORDER TO SOLVE THE PROBLEM? EXTRACT THESE SECTIONS FROM BOTH PROPOSALS AND RETURN A SIMILARITY PERCENTAGE (0-100) REPRESENTING HOW SIMILAR THESE TWO PROPOSALS ARE IN THOSE SECTIONS. \n\nProposal 1:\n".concat(existingProposal, "\n\nProposal 2:\n").concat(newProposalBody);
    };
    ProposalPoliceTemplates.getPromptForEditedProposal = function (previousBody, editedBody) {
        return "I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH \"".concat(CONST_1.default.NO_ACTION, "\" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ").concat(previousBody, ".\n\nEdited comment content: ").concat(editedBody);
    };
    ProposalPoliceTemplates.getDuplicateCheckWithdrawMessage = function () {
        return '#### 🚫 Duplicated proposal withdrawn by 🤖 ProposalPolice.';
    };
    ProposalPoliceTemplates.getDuplicateCheckNoticeMessage = function (proposalAuthor) {
        return "\u26A0\uFE0F @".concat(proposalAuthor, " Your proposal is a duplicate of an already existing proposal and has been automatically withdrawn to prevent spam. Please review the existing proposals before submitting a new one.");
    };
    return ProposalPoliceTemplates;
}());
// Main function to process the workflow event
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var now, zonedDate, formattedDate, octokit, payload, prompt, assistantResponse, parsedAssistantResponse, _a, _b, action, _c, message, isNoAction, isActionEdit, isActionRequired, issueNumber, commentID, newProposalCreatedAt_1, newProposalBody, newProposalAuthor, commentsResponse, previousProposals, isDuplicate, _i, previousProposals_1, previousProposal, isNotAProposal, isAuthorBot, duplicateCheckPrompt, duplicateCheckResponse, similarityPercentage, parsedDuplicateCheckResponse, _d, similarity, duplicateCheckWithdrawMessage, duplicateCheckNoticeMessage, formattedResponse, formattedResponse;
        var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        return __generator(this, function (_2) {
            switch (_2.label) {
                case 0:
                    now = Date.now();
                    zonedDate = (0, date_fns_tz_1.utcToZonedTime)(now, 'UTC');
                    formattedDate = (0, date_fns_1.format)(zonedDate, "yyyy-MM-dd HH:mm:ss 'UTC'");
                    octokit = (0, github_1.getOctokit)(process.env.GITHUB_TOKEN);
                    // Verify this is running for an expected webhook event
                    if (github_1.context.eventName !== CONST_1.default.EVENTS.ISSUE_COMMENT) {
                        throw new Error('ProposalPolice™ only supports the issue_comment webhook event');
                    }
                    payload = github_1.context.payload;
                    // check if the issue is open and the has labels
                    if (((_e = payload.issue) === null || _e === void 0 ? void 0 : _e.state) === CONST_1.default.LABELS.OPEN && !((_f = payload.issue) === null || _f === void 0 ? void 0 : _f.labels.some(function (issueLabel) { return issueLabel.name === CONST_1.default.LABELS.HELP_WANTED; }))) {
                        console.log('Issue is not open or does not have the "Help Wanted" label, skipping checks.');
                        return [2 /*return*/];
                    }
                    // Verify that the comment is not empty and contains the case sensitive `Proposal` keyword
                    if (!((_g = payload.comment) === null || _g === void 0 ? void 0 : _g.body.trim()) || !payload.comment.body.includes(CONST_1.default.PROPOSAL_KEYWORD)) {
                        console.log('Comment body is either empty or does not contain the keyword "Proposal"', (_h = payload.comment) === null || _h === void 0 ? void 0 : _h.body);
                        return [2 /*return*/];
                    }
                    // If event is `edited` and comment was already edited by the bot, return early
                    if (isCommentEditedEvent(payload) && ((_j = payload.comment) === null || _j === void 0 ? void 0 : _j.body.trim().includes('Edited by **proposal-police**'))) {
                        console.log('Comment was already edited by proposal-police once.\n', (_k = payload.comment) === null || _k === void 0 ? void 0 : _k.body);
                        return [2 /*return*/];
                    }
                    console.log('ProposalPolice™ Action triggered for comment:', (_l = payload.comment) === null || _l === void 0 ? void 0 : _l.body);
                    console.log('-> GitHub Action Type: ', (_m = payload.action) === null || _m === void 0 ? void 0 : _m.toUpperCase());
                    if (!isCommentCreatedEvent(payload) && !isCommentEditedEvent(payload)) {
                        console.error('Unsupported action type:', payload === null || payload === void 0 ? void 0 : payload.action);
                        (0, core_1.setFailed)(new Error("Unsupported action type ".concat(payload === null || payload === void 0 ? void 0 : payload.action)));
                        return [2 /*return*/];
                    }
                    prompt = isCommentCreatedEvent(payload)
                        ? ProposalPoliceTemplates.getPromptForNewProposalTemplateCheck((_o = payload.comment) === null || _o === void 0 ? void 0 : _o.body)
                        : ProposalPoliceTemplates.getPromptForEditedProposal((_p = payload.changes.body) === null || _p === void 0 ? void 0 : _p.from, (_q = payload.comment) === null || _q === void 0 ? void 0 : _q.body);
                    return [4 /*yield*/, OpenAIUtils_1.default.prompt(prompt)];
                case 1:
                    assistantResponse = _2.sent();
                    parsedAssistantResponse = JSON.parse(sanitizeJSONStringValues(assistantResponse));
                    console.log('parsedAssistantResponse: ', parsedAssistantResponse);
                    _a = parsedAssistantResponse !== null && parsedAssistantResponse !== void 0 ? parsedAssistantResponse : {}, _b = _a.action, action = _b === void 0 ? "" : _b, _c = _a.message, message = _c === void 0 ? "" : _c;
                    isNoAction = action.trim() === CONST_1.default.NO_ACTION;
                    isActionEdit = action.trim() === CONST_1.default.ACTION_EDIT;
                    isActionRequired = action.trim() === CONST_1.default.ACTION_REQUIRED;
                    issueNumber = (_s = (_r = payload.issue) === null || _r === void 0 ? void 0 : _r.number) !== null && _s !== void 0 ? _s : -1;
                    commentID = (_u = (_t = payload.comment) === null || _t === void 0 ? void 0 : _t.id) !== null && _u !== void 0 ? _u : -1;
                    if (!isCommentCreatedEvent(payload)) return [3 /*break*/, 9];
                    console.log('Running DUPLICATE PROPOSAL DETECTION Check');
                    newProposalCreatedAt_1 = new Date(payload.comment.created_at).getTime();
                    newProposalBody = payload.comment.body;
                    newProposalAuthor = payload.comment.user.login;
                    // Fetch all comments in the issue
                    console.log('Get comments for issue #', issueNumber);
                    return [4 /*yield*/, octokit.issues.listComments(__assign(__assign({}, github_1.context.repo), { issue_number: issueNumber, per_page: 100 }))];
                case 2:
                    commentsResponse = _2.sent();
                    console.log('commentsResponse', commentsResponse);
                    previousProposals = (_v = commentsResponse === null || commentsResponse === void 0 ? void 0 : commentsResponse.data) === null || _v === void 0 ? void 0 : _v.filter(function (comment) {
                        return new Date(comment.created_at).getTime() < newProposalCreatedAt_1 &&
                            comment.body &&
                            comment.body.includes(CONST_1.default.PROPOSAL_KEYWORD);
                    });
                    isDuplicate = false;
                    _i = 0, previousProposals_1 = previousProposals;
                    _2.label = 3;
                case 3:
                    if (!(_i < previousProposals_1.length)) return [3 /*break*/, 6];
                    previousProposal = previousProposals_1[_i];
                    isNotAProposal = !previousProposal.body || !previousProposal.body.includes(CONST_1.default.PROPOSAL_KEYWORD);
                    isAuthorBot = ((_w = previousProposal.user) === null || _w === void 0 ? void 0 : _w.login) === CONST_1.default.LABELS.GITHUB_ACTIONS || ((_x = previousProposal.user) === null || _x === void 0 ? void 0 : _x.type) === CONST_1.default.LABELS.BOT;
                    // Skip prompting if comment is empty / not a proposal / author is GH bot
                    if (isNotAProposal || isAuthorBot)
                        return [3 /*break*/, 5];
                    duplicateCheckPrompt = ProposalPoliceTemplates.getPromptForNewProposalDuplicateCheck(previousProposal.body, newProposalBody);
                    return [4 /*yield*/, OpenAIUtils_1.default.prompt(duplicateCheckPrompt)];
                case 4:
                    duplicateCheckResponse = _2.sent();
                    similarityPercentage = 0;
                    try {
                        parsedDuplicateCheckResponse = JSON.parse(sanitizeJSONStringValues(duplicateCheckResponse));
                        console.log('parsedDuplicateCheckResponse: ', parsedDuplicateCheckResponse);
                        _d = (parsedDuplicateCheckResponse !== null && parsedDuplicateCheckResponse !== void 0 ? parsedDuplicateCheckResponse : {}).similarity, similarity = _d === void 0 ? 0 : _d;
                        similarityPercentage = transformToNumber(similarity);
                    }
                    catch (e) {
                        console.error('Failed to parse AI similarity response:', duplicateCheckResponse);
                    }
                    if (similarityPercentage >= 90) {
                        console.log("Found duplicate with ".concat(similarityPercentage, "% similarity."));
                        isDuplicate = true;
                        return [3 /*break*/, 6];
                    }
                    _2.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!isDuplicate) return [3 /*break*/, 9];
                    duplicateCheckWithdrawMessage = ProposalPoliceTemplates.getDuplicateCheckWithdrawMessage();
                    duplicateCheckNoticeMessage = ProposalPoliceTemplates.getDuplicateCheckNoticeMessage(newProposalAuthor);
                    // If a duplicate proposal is detected, update the comment to withdraw it
                    console.log('ProposalPolice™ withdrawing duplicated proposal...');
                    return [4 /*yield*/, octokit.issues.updateComment(__assign(__assign({}, github_1.context.repo), { comment_id: commentID, body: duplicateCheckWithdrawMessage }))];
                case 7:
                    _2.sent();
                    // Post a comment to notify the user about the withdrawn duplicated proposal
                    console.log('ProposalPolice™ notifying contributor of withdrawn proposal...');
                    return [4 /*yield*/, octokit.issues.createComment(__assign(__assign({}, github_1.context.repo), { issue_number: issueNumber, body: duplicateCheckNoticeMessage }))];
                case 8:
                    _2.sent();
                    return [2 /*return*/];
                case 9:
                    // If assistant response is NO_ACTION and there's no message, do nothing
                    if (isNoAction && !message) {
                        console.log('Detected NO_ACTION for comment, returning early.');
                        return [2 /*return*/];
                    }
                    if (!(isCommentCreatedEvent(payload) && isActionRequired)) return [3 /*break*/, 11];
                    console.log('payload.comment?.url', (_y = payload.comment) === null || _y === void 0 ? void 0 : _y.url);
                    console.log('payload.comment?.html_url', (_z = payload.comment) === null || _z === void 0 ? void 0 : _z.html_url);
                    formattedResponse = message
                        // replace {user} from response template with GH @username
                        // @ts-ignore - replaceAll exists
                        .replaceAll('{user}', "@".concat((_0 = payload.comment) === null || _0 === void 0 ? void 0 : _0.user.login));
                    // Create a comment with the assistant's response
                    console.log('ProposalPolice™ commenting on issue...');
                    return [4 /*yield*/, octokit.issues.createComment(__assign(__assign({}, github_1.context.repo), { issue_number: issueNumber, body: formattedResponse }))];
                case 10:
                    _2.sent();
                    return [3 /*break*/, 13];
                case 11:
                    if (!isActionEdit) return [3 /*break*/, 13];
                    formattedResponse = message.replace('{updated_timestamp}', formattedDate);
                    console.log('ProposalPolice™ editing issue comment...', payload.comment.id);
                    return [4 /*yield*/, octokit.issues.updateComment(__assign(__assign({}, github_1.context.repo), { comment_id: commentID, body: "".concat(formattedResponse, "\n\n").concat((_1 = payload.comment) === null || _1 === void 0 ? void 0 : _1.body) }))];
                case 12:
                    _2.sent();
                    _2.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
run().catch(function (error) {
    console.error(error);
    // @ts-ignore - process is not imported
    process.exit(0); // Zero status ensures no failure notification
});
