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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var CONST_1 = require("./libs/CONST");
var OpenAIUtils_1 = require("./libs/OpenAIUtils");
function isCommentCreatedOrEditedEvent(payload) {
    return payload.action === CONST_1.default.ACTIONS.CREATED || payload.action === CONST_1.default.ACTIONS.EDIT;
}
function isCommentCreatedEvent(payload) {
    return payload.action === CONST_1.default.ACTIONS.CREATED;
}
// Main function to process the workflow event
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, payload, prompt, assistantResponse, isNoAction, noActionContext, formattedResponse, extractedNotice, date, formattedDate;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        return __generator(this, function (_1) {
            switch (_1.label) {
                case 0:
                    octokit = (0, github_1.getOctokit)(process.env.GITHUB_TOKEN);
                    // Verify this is running for an expected webhook event
                    if (github_1.context.eventName !== CONST_1.default.EVENTS.ISSUE_COMMENT) {
                        throw new Error('ProposalPolice™ only supports the issue_comment webhook event');
                    }
                    payload = github_1.context.payload;
                    // check if the issue is open and the has labels
                    if (((_a = payload.issue) === null || _a === void 0 ? void 0 : _a.state) !== 'open' && !((_b = payload.issue) === null || _b === void 0 ? void 0 : _b.labels.some(function (issueLabel) { return issueLabel.name === CONST_1.default.LABELS.HELP_WANTED; }))) {
                        return [2 /*return*/];
                    }
                    // Verify that the comment is not empty
                    if (!((_c = payload.comment) === null || _c === void 0 ? void 0 : _c.body.trim())) {
                        return [2 /*return*/];
                    }
                    console.log('ProposalPolice™ Action triggered for comment:', (_d = payload.comment) === null || _d === void 0 ? void 0 : _d.body);
                    console.log('-> GitHub Action Type: ', (_e = payload.action) === null || _e === void 0 ? void 0 : _e.toUpperCase());
                    if (!isCommentCreatedOrEditedEvent(payload)) {
                        console.error('Unsupported action type:', payload === null || payload === void 0 ? void 0 : payload.action);
                        (0, core_1.setFailed)(new Error("Unsupported action type ".concat(payload === null || payload === void 0 ? void 0 : payload.action)));
                        return [2 /*return*/];
                    }
                    prompt = isCommentCreatedEvent(payload)
                        ? "I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH \"".concat(CONST_1.default.NO_ACTION, "\" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ").concat((_f = payload.comment) === null || _f === void 0 ? void 0 : _f.body)
                        : "I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH \"".concat(CONST_1.default.NO_ACTION, "\" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ").concat((_g = payload.changes.body) === null || _g === void 0 ? void 0 : _g.from, ".\n\nEdited comment content: ").concat((_h = payload.comment) === null || _h === void 0 ? void 0 : _h.body);
                    return [4 /*yield*/, OpenAIUtils_1.default.prompt(prompt)];
                case 1:
                    assistantResponse = _1.sent();
                    isNoAction = assistantResponse.trim().replaceAll(' ', '_').replaceAll('"', '').toUpperCase() === CONST_1.default.NO_ACTION;
                    // If assistant response is NO_ACTION, do nothing
                    if (isNoAction) {
                        console.log('Detected NO_ACTION for comment, returning early');
                        return [2 /*return*/];
                    }
                    // if the assistant responded with no action but there's some context in the response
                    if (assistantResponse.includes("[".concat(CONST_1.default.NO_ACTION, "]"))) {
                        noActionContext = (_k = (_j = assistantResponse.split("[".concat(CONST_1.default.NO_ACTION, "] "))) === null || _j === void 0 ? void 0 : _j[1]) === null || _k === void 0 ? void 0 : _k.replace('"', '');
                        console.log('[NO_ACTION] w/ context: ', noActionContext);
                        return [2 /*return*/];
                    }
                    if (!isCommentCreatedEvent(payload)) return [3 /*break*/, 3];
                    formattedResponse = assistantResponse
                        // replace {user} from response template with @username
                        // @ts-ignore - process is not imported
                        .replaceAll('{user}', "@".concat((_l = payload.comment) === null || _l === void 0 ? void 0 : _l.user.login))
                        // replace {proposalLink} from response template with the link to the comment
                        .replaceAll('{proposalLink}', (_m = payload.comment) === null || _m === void 0 ? void 0 : _m.html_url)
                        // remove any double quotes from the final comment because sometimes the assistant's
                        // response contains double quotes / sometimes it doesn't
                        .replaceAll('"', '');
                    // Create a comment with the assistant's response
                    console.log('ProposalPolice™ commenting on issue...');
                    return [4 /*yield*/, octokit.issues.createComment(__assign(__assign({}, github_1.context.repo), { 
                            /* eslint-disable @typescript-eslint/naming-convention */
                            issue_number: (_p = (_o = payload.issue) === null || _o === void 0 ? void 0 : _o.number) !== null && _p !== void 0 ? _p : -1, body: formattedResponse }))];
                case 2:
                    _1.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(assistantResponse.includes('[EDIT_COMMENT]') && !((_q = payload.comment) === null || _q === void 0 ? void 0 : _q.body.includes('Edited by **proposal-police**')))) return [3 /*break*/, 5];
                    extractedNotice = (_s = (_r = assistantResponse.split('[EDIT_COMMENT] ')) === null || _r === void 0 ? void 0 : _r[1]) === null || _s === void 0 ? void 0 : _s.replace('"', '');
                    date = new Date((_u = (_t = payload.comment) === null || _t === void 0 ? void 0 : _t.updated_at) !== null && _u !== void 0 ? _u : '');
                    formattedDate = "".concat((_x = (_w = (_v = date.toISOString()) === null || _v === void 0 ? void 0 : _v.split('.')) === null || _w === void 0 ? void 0 : _w[0]) === null || _x === void 0 ? void 0 : _x.replace('T', ' '), " UTC");
                    extractedNotice = extractedNotice.replace('{updated_timestamp}', formattedDate);
                    console.log('ProposalPolice™ editing issue comment...', payload.comment.id);
                    return [4 /*yield*/, octokit.issues.updateComment(__assign(__assign({}, github_1.context.repo), { 
                            /* eslint-disable @typescript-eslint/naming-convention */
                            comment_id: (_z = (_y = payload.comment) === null || _y === void 0 ? void 0 : _y.id) !== null && _z !== void 0 ? _z : -1, body: "".concat(extractedNotice, "\n\n").concat((_0 = payload.comment) === null || _0 === void 0 ? void 0 : _0.body) }))];
                case 4:
                    _1.sent();
                    _1.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
run().catch(function (error) {
    console.error(error);
    // @ts-ignore - process is not imported
    process.exit(1);
});
