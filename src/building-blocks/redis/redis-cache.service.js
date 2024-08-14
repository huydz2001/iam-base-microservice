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
exports.RedisCacheService = exports.RedisOptions = void 0;
const common_1 = require("@nestjs/common");
const async_retry_1 = __importDefault(require("async-retry"));
const ioredis_1 = require("ioredis");
const configs_1 = __importDefault(require("../configs/configs"));
class RedisOptions {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.RedisOptions = RedisOptions;
let RedisCacheService = class RedisCacheService {
    constructor(options) {
        this.options = options;
    }
    async onModuleInit() {
        this.createConnection(this.options);
    }
    async createConnection(options) {
        if (!this.cacheClient) {
            try {
                await (0, async_retry_1.default)(async () => {
                    var _a, _b;
                    this.cacheClient = new ioredis_1.Redis({
                        host: (_a = options === null || options === void 0 ? void 0 : options.host) !== null && _a !== void 0 ? _a : configs_1.default.redis.host,
                        port: (_b = options === null || options === void 0 ? void 0 : options.port) !== null && _b !== void 0 ? _b : configs_1.default.redis.port
                    });
                    this.cacheClient.on('error', (error) => {
                        common_1.Logger.error(`Error occurred on connection redis: ${error}`);
                        this.disconnect();
                        this.createConnection();
                    });
                    this.cacheClient.on('connect', () => {
                        common_1.Logger.log('Connected to Redis');
                    });
                    await this.cacheClient.ping();
                }, {
                    retries: configs_1.default.retry.count,
                    factor: configs_1.default.retry.factor,
                    minTimeout: configs_1.default.retry.minTimeout,
                    maxTimeout: configs_1.default.retry.maxTimeout
                });
            }
            catch (error) {
                common_1.Logger.error(error.message);
                throw new Error('Redis connection failed!');
            }
        }
        return this.cacheClient;
    }
    async disconnect() {
        if (this.cacheClient) {
            try {
                await this.cacheClient.quit();
                common_1.Logger.log('Redis connection closed gracefully');
            }
            catch (error) {
                common_1.Logger.error('Failed to close Redis connection');
            }
        }
    }
    async setCacheExpried(key, value, expiredTime) {
        await this.cacheClient.set(key, value).then(() => this.cacheClient.expire(key, expiredTime));
    }
    async setCache(key, value) {
        await this.cacheClient.set(key, value);
    }
    async getCache(key) {
        return this.cacheClient.get(key);
    }
    async delValue(key) {
        return await this.cacheClient.del(key);
    }
    getCacheClient() {
        return this.cacheClient;
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(RedisOptions)),
    __metadata("design:paramtypes", [RedisOptions])
], RedisCacheService);
//# sourceMappingURL=redis-cache.service.js.map