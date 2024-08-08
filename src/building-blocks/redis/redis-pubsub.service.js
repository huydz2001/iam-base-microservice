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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisPubsubService = exports.RedisPubsubOptions = void 0;
const common_1 = require("@nestjs/common");
const async_retry_1 = __importDefault(require("async-retry"));
const ioredis_1 = require("ioredis");
const configs_1 = __importDefault(require("../configs/configs"));
class RedisPubsubOptions {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.RedisPubsubOptions = RedisPubsubOptions;
let RedisPubsubService = class RedisPubsubService {
    constructor(options) {
        this.options = options;
    }
    async onModuleInit() {
        this.createConnection(this.options);
    }
    async createConnection(options) {
        if (!this.cachePubsub) {
            try {
                await (0, async_retry_1.default)(async () => {
                    var _a, _b;
                    this.cachePubsub = new ioredis_1.Redis({
                        host: (_a = options === null || options === void 0 ? void 0 : options.host) !== null && _a !== void 0 ? _a : configs_1.default.redis.host,
                        port: (_b = options === null || options === void 0 ? void 0 : options.port) !== null && _b !== void 0 ? _b : configs_1.default.redis.port
                    });
                    this.cachePubsub.on('error', (error) => {
                        common_1.Logger.error(`Error occurred on connection redis pubsub: ${error}`);
                        this.disconnect();
                        this.createConnection();
                    });
                    this.cachePubsub.on('connect', () => {
                        common_1.Logger.log('Connected to Redis Pubsub');
                    });
                    await this.cachePubsub.ping();
                }, {
                    retries: configs_1.default.retry.count,
                    factor: configs_1.default.retry.factor,
                    minTimeout: configs_1.default.retry.minTimeout,
                    maxTimeout: configs_1.default.retry.maxTimeout
                });
            }
            catch (error) {
                common_1.Logger.error(error.message);
                throw new Error('Redis pubsub connection failed!');
            }
        }
        return this.cachePubsub;
    }
    async disconnect() {
        if (this.cachePubsub) {
            try {
                await this.cachePubsub.quit();
                common_1.Logger.log('Redis pubsub connection closed gracefully');
            }
            catch (error) {
                common_1.Logger.error('Failed to close Redis pubsub connection');
            }
        }
    }
    async publish(channel, message) {
        try {
            await this.cachePubsub.publish(channel, message);
            common_1.Logger.log(`Message published to ${channel}: ${message}`);
        }
        catch (error) {
            common_1.Logger.error(`Failed to publish message to ${channel}`, error);
        }
    }
    async subscribe(channel, callback) {
        try {
            this.cachePubsub.on('message', (channelName, message) => {
                if (channelName === channel) {
                    callback(message);
                }
            });
            await this.cachePubsub.subscribe(channel);
            common_1.Logger.log(`Subscribed to channel: ${channel}`);
        }
        catch (error) {
            common_1.Logger.error(`Failed to subscribe to ${channel}`, error);
        }
    }
    async unsubscribe(channel) {
        try {
            await this.cachePubsub.unsubscribe(channel);
            common_1.Logger.log(`Unsubscribed from channel: ${channel}`);
        }
        catch (error) {
            common_1.Logger.error(`Failed to unsubscribe from ${channel}`, error);
        }
    }
    getcache() {
        return this.cachePubsub;
    }
};
exports.RedisPubsubService = RedisPubsubService;
exports.RedisPubsubService = RedisPubsubService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(RedisPubsubOptions)),
    __metadata("design:paramtypes", [RedisPubsubOptions])
], RedisPubsubService);
//# sourceMappingURL=redis-pubsub.service.js.map