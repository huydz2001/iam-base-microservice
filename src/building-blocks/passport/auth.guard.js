"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const configs_1 = __importDefault(require("../configs/configs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const identity_constract_1 = require("../constracts/identity-constract");
let AdminGuard = class AdminGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor() {
        super();
    }
    async canActivate(context) {
        var _a;
        const request = context.switchToHttp().getRequest();
        const token = (_a = request.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new common_1.ForbiddenException(`You don't have permission`);
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, configs_1.default.jwt.secret);
            request.user = payload;
            if ((payload === null || payload === void 0 ? void 0 : payload['role']) !== identity_constract_1.Role.ADMIN) {
                throw new common_1.UnauthorizedException('Access dined!');
            }
            return super.canActivate(context);
        }
        catch (error) {
            common_1.Logger.error(error.message);
            throw new common_1.UnauthorizedException(error.message);
        }
    }
    handleRequest(err, user) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AdminGuard);
//# sourceMappingURL=auth.guard.js.map