"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("./CONST");
var openai_1 = require("openai");
var node_fetch_1 = require("node-fetch");
if (!globalThis.fetch) {
    globalThis.fetch = node_fetch_1.default;
}
var MAX_POLL_COUNT = Math.floor(CONST_1.default.OPENAI_POLL_TIMEOUT / CONST_1.default.OPENAI_POLL_RATE);
var OpenAIUtils = /** @class */ (function () {
    function OpenAIUtils() {
    }
    OpenAIUtils.init = function (apiKey, assistantID) {
        // @ts-ignore - process is not imported
        var key = apiKey !== null && apiKey !== void 0 ? apiKey : process.env.OPENAI_API_KEY;
        if (!key) {
            throw new Error('Could not initialize OpenAI: No key provided.');
        }
        this.ai = new openai_1.default({ apiKey: key });
        // @ts-ignore - process is not imported
        this.assistantID = assistantID !== null && assistantID !== void 0 ? assistantID : process.env.OPENAI_ASSISTANT_ID;
    };
    Object.defineProperty(OpenAIUtils, "openAI", {
        get: function () {
            if (!this.ai) {
                this.init();
            }
            return this.ai;
        },
        enumerable: false,
        configurable: true
    });
    OpenAIUtils.prompt = function (userMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var threadRun, response, count, _a, _b, _c, message, e_1_1;
            var _this = this;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.openAI.beta.threads.createAndRun({
                            /* eslint-disable @typescript-eslint/naming-convention */
                            assistant_id: this.assistantID,
                            thread: { messages: [{ role: CONST_1.default.OPENAI_ROLES.USER, content: userMessage }] },
                        })];
                    case 1:
                        threadRun = _g.sent();
                        response = '';
                        count = 0;
                        _g.label = 2;
                    case 2:
                        if (!(!response && count < MAX_POLL_COUNT)) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.openAI.beta.threads.runs.retrieve(threadRun.thread_id, { thread_id: threadRun.id })];
                    case 3:
                        // await thread run completion
                        threadRun = _g.sent();
                        if (!(threadRun.status !== CONST_1.default.OPENAI_THREAD_COMPLETED)) return [3 /*break*/, 5];
                        count++;
                        // @ts-ignore - Promise exists
                        return [4 /*yield*/, new Promise(function (resolve) {
                                setTimeout(resolve, CONST_1.default.OPENAI_POLL_RATE);
                            })];
                    case 4:
                        // @ts-ignore - Promise exists
                        _g.sent();
                        return [3 /*break*/, 2];
                    case 5:
                        _g.trys.push([5, 10, 11, 16]);
                        _a = true, _b = (e_1 = void 0, __asyncValues(this.openAI.beta.threads.messages.list(threadRun.thread_id)));
                        _g.label = 6;
                    case 6: return [4 /*yield*/, _b.next()];
                    case 7:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 9];
                        _f = _c.value;
                        _a = false;
                        message = _f;
                        if (message.role !== CONST_1.default.OPENAI_ROLES.ASSISTANT) {
                            return [3 /*break*/, 8];
                        }
                        console.log('message.content:', message.content);
                        response += message.content
                            .map(function (contentBlock) { return _this.isTextContentBlock(contentBlock) && contentBlock.text.value; })
                            .join('\n')
                            .trim();
                        console.log('Parsed assistant response:', response);
                        _g.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _g.trys.push([11, , 14, 15]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _e.call(_b)];
                    case 12:
                        _g.sent();
                        _g.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16:
                        if (!response) {
                            throw new Error('Assistant response is empty or had no text content. This is unexpected.');
                        }
                        return [3 /*break*/, 2];
                    case 17: return [2 /*return*/, response];
                }
            });
        });
    };
    OpenAIUtils.isTextContentBlock = function (contentBlock) {
        return (contentBlock === null || contentBlock === void 0 ? void 0 : contentBlock.type) === 'text';
    };
    return OpenAIUtils;
}());
exports.default = OpenAIUtils;
