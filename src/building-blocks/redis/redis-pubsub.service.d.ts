import { OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
export declare class RedisPubsubOptions {
    host: string;
    port: number;
    password?: string;
    db?: number;
    constructor(partial?: Partial<RedisPubsubOptions>);
}
export declare class RedisPubsubService implements OnModuleInit {
    private readonly options;
    private cachePubsub;
    constructor(options: RedisPubsubOptions);
    onModuleInit(): Promise<void>;
    createConnection(options?: RedisPubsubOptions): Promise<Redis>;
    disconnect(): Promise<void>;
    publish(channel: string, message: string): Promise<void>;
    subscribe(channel: string, callback: (message: string) => void): Promise<void>;
    unsubscribe(channel: string): Promise<void>;
    getcache(): Redis;
}
