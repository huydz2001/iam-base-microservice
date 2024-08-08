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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggersService = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = require("winston");
require("winston-daily-rotate-file");
let LoggersService = class LoggersService {
    constructor() {
        this.logger = (0, winston_1.createLogger)({
            format: winston_1.format === null || winston_1.format === void 0 ? void 0 : winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS' }), winston_1.format.printf(({ message, timestamp }) => {
                return `${timestamp}: ${message}`;
            })),
            transports: [
                new winston_1.transports.DailyRotateFile({
                    filename: 'logs/iam-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '100m',
                    maxFiles: '30d'
                })
            ]
        });
    }
    logRequestInfo(info) {
        const { method, originalUrl, ip, statusCode, delay } = info;
        this.logger.info(` ${method} ${originalUrl} ${ip} ${statusCode} ${delay}ms`);
    }
    logVerbose(message, payloadOpt) {
        this.logger.info(` ${message}${payloadOpt ? '\n' + JSON.stringify(payloadOpt) : ''}`);
    }
    logError(error, options) {
        var _a;
        const { message, stack, response } = error;
        this.logger.error(`==============\n${options || message}\n${stack}\n${((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.message) || response}`);
    }
    logErrorTitle(title) {
        this.logger.error(`==============Error: ${title}`);
    }
};
exports.LoggersService = LoggersService;
exports.LoggersService = LoggersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggersService);
//# sourceMappingURL=logger.service.js.map