"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const logger_service_1 = require("../loggers/logger.service");
let ErrorsInterceptor = class ErrorsInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
        this.loggerService = new logger_service_1.LoggersService();
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const now = Date.now();
        return next.handle().pipe((0, rxjs_1.catchError)((error) => {
            var _a, _b;
            const delay = Date.now() - now;
            let ip;
            if (request && request.headers && request.headers['x-forwarded-for']) {
                ip = request.headers['x-forwarded-for'];
            }
            else {
                ip = request.ip;
            }
            if (Array.isArray(ip)) {
                ip = ip.join(' ');
            }
            const message = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.message;
            const status = (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.statusCode;
            this.logger.error(`${method} ${url} ${status} - ${ip} +${delay}ms`, {
                message
            });
            this.loggerService.logError(error, `${method} ${url} ${status} - ${ip} +${delay}ms`);
            switch (status) {
                case common_1.HttpStatus.BAD_REQUEST:
                    return (0, rxjs_1.throwError)(() => new common_1.BadRequestException(message));
                case common_1.HttpStatus.UNAUTHORIZED:
                    return (0, rxjs_1.throwError)(() => new common_1.UnauthorizedException(message));
                case common_1.HttpStatus.CONFLICT:
                    return (0, rxjs_1.throwError)(() => new common_1.ConflictException(message));
                case common_1.HttpStatus.FORBIDDEN:
                    return (0, rxjs_1.throwError)(() => new common_1.ForbiddenException(message));
                case common_1.HttpStatus.NOT_FOUND:
                    return (0, rxjs_1.throwError)(() => new common_1.NotFoundException(message));
                case common_1.HttpStatus.NOT_ACCEPTABLE:
                    return (0, rxjs_1.throwError)(() => new common_1.NotAcceptableException(message));
                case common_1.HttpStatus.INTERNAL_SERVER_ERROR:
                    return (0, rxjs_1.throwError)(() => new common_1.InternalServerErrorException(message));
                default:
                    return (0, rxjs_1.throwError)(() => new common_1.InternalServerErrorException(message));
            }
        }));
    }
};
exports.ErrorsInterceptor = ErrorsInterceptor;
exports.ErrorsInterceptor = ErrorsInterceptor = __decorate([
    (0, common_1.Injectable)()
], ErrorsInterceptor);
//# sourceMappingURL=error.interceptor.js.map