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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
            let status;
            let message;
            const errRespData = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
            if (errRespData) {
                message =
                    ((_c = (_b = errRespData === null || errRespData === void 0 ? void 0 : errRespData.errors) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) ||
                        (errRespData === null || errRespData === void 0 ? void 0 : errRespData.message) ||
                        'Lỗi hệ thống, vui lòng thử lại.';
                status = (errRespData === null || errRespData === void 0 ? void 0 : errRespData.status) || common_1.HttpStatus.BAD_REQUEST;
            }
            else {
                message =
                    ((_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.message) === 'Bad Request' ||
                        ((_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.message) === 'Internal Server Error'
                        ? 'Lỗi hệ thống, vui lòng thử lại.'
                        : ((_f = error === null || error === void 0 ? void 0 : error.response) === null || _f === void 0 ? void 0 : _f.message) === 'Unauthorized'
                            ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.'
                            : ((_g = error === null || error === void 0 ? void 0 : error.response) === null || _g === void 0 ? void 0 : _g.message) || (error === null || error === void 0 ? void 0 : error.message);
                status =
                    (error === null || error === void 0 ? void 0 : error.status) ||
                        ((_h = error === null || error === void 0 ? void 0 : error.response) === null || _h === void 0 ? void 0 : _h.status) ||
                        ((_j = error === null || error === void 0 ? void 0 : error.response) === null || _j === void 0 ? void 0 : _j.statusCode) ||
                        common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            }
            this.logger.error(`${method} ${url} ${status} - ${ip} +${delay}ms`, {
                message
            });
            this.loggerService.logError(error, `${method} ${url} ${status} - ${ip} +${delay}ms`);
            switch (status) {
                case common_1.HttpStatus.BAD_REQUEST:
                    return (0, rxjs_1.throwError)(() => new common_1.BadRequestException(message));
                case common_1.HttpStatus.UNAUTHORIZED:
                    return (0, rxjs_1.throwError)(() => new common_1.UnauthorizedException(message));
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