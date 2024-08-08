"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../loggers/logger.service");
const rxjs_1 = require("rxjs");
let LoggerInterceptor = class LoggerInterceptor {
    constructor() {
        this.loggerService = new logger_service_1.LoggersService();
        this.logger = new common_1.Logger('HTTP');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const now = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(() => {
            var _a;
            const response = context.switchToHttp().getResponse();
            const delay = Date.now() - now;
            let ip = ((_a = request.headers) === null || _a === void 0 ? void 0 : _a['x-forwarded-for']) || request.ip;
            if (Array.isArray(ip)) {
                ip = ip.join(' ');
            }
            `${method} ${url} ${response.statusCode} - ${ip} +${delay}ms`;
            this.loggerService.logVerbose(`==========TEST============`);
        }));
    }
};
exports.LoggerInterceptor = LoggerInterceptor;
exports.LoggerInterceptor = LoggerInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggerInterceptor);
//# sourceMappingURL=logger.interceptor.js.map