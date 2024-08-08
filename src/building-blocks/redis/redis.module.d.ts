import { DynamicModule } from '@nestjs/common';
import { RedisCacheService, RedisOptions } from './redis-cache.service';
import { RedisPubsubOptions, RedisPubsubService } from './redis-pubsub.service';
export declare class RedisModule {
    private readonly redisCacheService;
    private readonly redisPubsubService;
    constructor(redisCacheService: RedisCacheService, redisPubsubService: RedisPubsubService);
    onApplicationShutdown(): Promise<void>;
    static forRoot(options?: RedisOptions, optionsPubsub?: RedisPubsubOptions): DynamicModule;
}
