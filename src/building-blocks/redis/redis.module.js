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
var RedisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const redis_cache_service_1 = require("./redis-cache.service");
const redis_pubsub_service_1 = require("./redis-pubsub.service");
let RedisModule = RedisModule_1 = class RedisModule {
    constructor(redisCacheService, redisPubsubService) {
        this.redisCacheService = redisCacheService;
        this.redisPubsubService = redisPubsubService;
    }
    async onApplicationShutdown() {
        await Promise.all([this.redisPubsubService.disconnect(), this.redisCacheService.disconnect()]);
    }
    static forRoot(options, optionsPubsub) {
        return {
            module: RedisModule_1,
            providers: [
                redis_cache_service_1.RedisCacheService,
                redis_pubsub_service_1.RedisPubsubService,
                { provide: redis_cache_service_1.RedisOptions, useValue: options },
                { provide: redis_pubsub_service_1.RedisPubsubOptions, useValue: optionsPubsub }
            ]
        };
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        providers: [redis_cache_service_1.RedisCacheService, redis_pubsub_service_1.RedisPubsubService],
        exports: [redis_cache_service_1.RedisCacheService, redis_pubsub_service_1.RedisPubsubService]
    }),
    __metadata("design:paramtypes", [redis_cache_service_1.RedisCacheService,
        redis_pubsub_service_1.RedisPubsubService])
], RedisModule);
//# sourceMappingURL=redis.module.js.map