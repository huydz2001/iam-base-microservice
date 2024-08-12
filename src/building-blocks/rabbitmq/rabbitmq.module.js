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
exports.RabbitmqModule = void 0;
const common_1 = require("@nestjs/common");
const open_telemetry_module_1 = require("../openTelemetry/open-telemetry.module");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const configs_1 = __importDefault(require("../configs/configs"));
let RabbitmqModule = class RabbitmqModule {
};
exports.RabbitmqModule = RabbitmqModule;
exports.RabbitmqModule = RabbitmqModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            open_telemetry_module_1.OpenTelemetryModule.forRoot(),
            nestjs_rabbitmq_1.RabbitMQModule.forRoot(nestjs_rabbitmq_1.RabbitMQModule, {
                exchanges: [{ name: 'test', type: 'topic', options: { autoDelete: true } }],
                uri: configs_1.default.rabbitmq.uri,
                connectionInitOptions: { wait: false }
            })
        ],
        providers: [],
        exports: []
    })
], RabbitmqModule);
//# sourceMappingURL=rabbitmq.module.js.map