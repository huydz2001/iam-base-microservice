"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitModule = void 0;
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const common_1 = require("@nestjs/common");
const configs_1 = __importDefault(require("../configs/configs"));
let RabbitModule = class RabbitModule {
};
exports.RabbitModule = RabbitModule;
exports.RabbitModule = RabbitModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [],
        imports: [
            nestjs_rabbitmq_1.RabbitMQModule.forRoot(nestjs_rabbitmq_1.RabbitMQModule, {
                exchanges: [
                    {
                        name: configs_1.default.rabbitmq.exchange,
                        type: 'topic'
                    }
                ],
                uri: configs_1.default.rabbitmq.uri,
                connectionInitOptions: { wait: false },
                enableControllerDiscovery: true
            }),
            RabbitModule
        ],
        providers: [],
        exports: [nestjs_rabbitmq_1.RabbitMQModule]
    })
], RabbitModule);
//# sourceMappingURL=rabbitmq.module.js.map