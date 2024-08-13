"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationExpired = getDurationExpired;
const moment_1 = __importDefault(require("moment"));
function getDurationExpired(exp) {
    const expiryDate = (0, moment_1.default)(exp);
    const now = (0, moment_1.default)();
    const duration = expiryDate.diff(now, 'seconds');
    return duration;
}
//# sourceMappingURL=get-duration-expired.js.map