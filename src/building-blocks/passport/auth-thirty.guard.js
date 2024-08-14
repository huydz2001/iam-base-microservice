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
var AdminThirtyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminThirtyGuard = exports.JwtDto = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const redis_cache_service_1 = require("../redis/redis-cache.service");
const check_jwt_1 = require("./../../mobile-be/src/module/auth/feature/v1/check-jwt/check-jwt");
class JwtDto {
    constructor(item) {
        Object.assign(this, item);
    }
}
exports.JwtDto = JwtDto;
let AdminThirtyGuard = AdminThirtyGuard_1 = class AdminThirtyGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(redisCacheService, checkJwtHandler) {
        super();
        this.redisCacheService = redisCacheService;
        this.checkJwtHandler = checkJwtHandler;
        this.logger = new common_1.Logger(AdminThirtyGuard_1.name);
    }
    async canActivate(context) {
        var _a;
        const request = context.switchToHttp().getRequest();
        const authorization = (_a = request.headers) === null || _a === void 0 ? void 0 : _a['authorization'];
        if (authorization) {
            const token = authorization.split(' ')[1];
            try {
                const resp = await this.checkJwtHandler.checkAdminGuard({ accessToken: token });
                if (!resp) {
                    throw new common_1.UnauthorizedException('Access denied: Invalid token payload');
                }
                return super.canActivate(context);
            }
            catch (err) {
                this.logger.error(err);
                throw err;
            }
        }
        return super.canActivate(context);
    }
    handleRequest(err, user) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException('Invalid Token');
        }
        return user;
    }
};
exports.AdminThirtyGuard = AdminThirtyGuard;
exports.AdminThirtyGuard = AdminThirtyGuard = AdminThirtyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_cache_service_1.RedisCacheService,
        check_jwt_1.CheckJwtHandler])
], AdminThirtyGuard);
//# sourceMappingURL=auth-thirty.guard.js.map