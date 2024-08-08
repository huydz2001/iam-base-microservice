import { OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
export declare class RedisOptions {
    host: string;
    port: number;
    password?: string;
    db?: number;
    constructor(partial?: Partial<RedisOptions>);
}
export declare class RedisCacheService implements OnModuleInit {
    private readonly options;
    private cacheClient;
    constructor(options: RedisOptions);
    onModuleInit(): Promise<void>;
    createConnection(options?: RedisOptions): Promise<Redis>;
    disconnect(): Promise<void>;
    setCacheExpried(key: string, value: string, expiredTime?: number): Promise<void>;
    setCache(key: string, value: string): Promise<void>;
    getCache(key: string): Promise<string | null>;
    delValue(key: string): Promise<number>;
    getcache(): Redis;
}
