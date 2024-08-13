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
var CheckJwtHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckJwtHandler = void 0;
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const common_1 = require("@nestjs/common");
const configs_1 = __importDefault(require("building-blocks/configs/configs"));
const rabbitmq_constant_1 = require("building-blocks/constants/rabbitmq.constant");
let CheckJwtHandler = CheckJwtHandler_1 = class CheckJwtHandler {
    constructor(amqpConnection) {
        this.amqpConnection = amqpConnection;
        this.logger = new common_1.Logger(CheckJwtHandler_1.name);
    }
    async execute(command) {
        var _a, _b;
        try {
            const resp = await this.amqpConnection.request({
                exchange: configs_1.default.rabbitmq.exchange,
                routingKey: rabbitmq_constant_1.RoutingKey.MOBILE_BE.CHECK_JWT_TOKEN,
                payload: command,
                timeout: 10000,
            });
            if ((_a = resp === null || resp === void 0 ? void 0 : resp.data) === null || _a === void 0 ? void 0 : _a.messageResp) {
                throw new common_1.BadRequestException(resp.data.messageResp);
            }
            this.logger.debug(resp);
            return (_b = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _b !== void 0 ? _b : null;
        }
        catch (error) {
            this.logger.error(error.message);
            throw error;
        }
    }
};
exports.CheckJwtHandler = CheckJwtHandler;
exports.CheckJwtHandler = CheckJwtHandler = CheckJwtHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_rabbitmq_1.AmqpConnection])
], CheckJwtHandler);
//# sourceMappingURL=check-jwt.js.map