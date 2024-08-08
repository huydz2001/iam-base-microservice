"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordMatch = exports.encryptPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const encryptPassword = async (password) => {
    const encryptedPassword = await bcryptjs_1.default.hash(password, 8);
    return encryptedPassword;
};
exports.encryptPassword = encryptPassword;
const isPasswordMatch = async (password, userPassword) => {
    return bcryptjs_1.default.compare(password, userPassword);
};
exports.isPasswordMatch = isPasswordMatch;
//# sourceMappingURL=encryption.js.map