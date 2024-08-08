import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import asyncRetry from 'async-retry';
import { Redis } from 'ioredis';
import configs from '../configs/configs';

export class RedisOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;

  constructor(partial?: Partial<RedisOptions>) {
    Object.assign(this, partial);
  }
}

@Injectable()
export class RedisCacheService implements OnModuleInit {
  private cacheClient: Redis;

  constructor(@Inject(RedisOptions) private readonly options: RedisOptions) {}

  async onModuleInit(): Promise<void> {
    this.createConnection(this.options);
  }

  async createConnection(options?: RedisOptions): Promise<Redis> {
    if (!this.cacheClient) {
      try {
        await asyncRetry(
          async () => {
            this.cacheClient = new Redis({
              host: options?.host ?? configs.redis.host,
              port: options?.port ?? configs.redis.port
            });

            // Xử lý sự kiện lỗi
            this.cacheClient.on('error', (error) => {
              Logger.error(`Error occurred on connection redis: ${error}`);
              this.disconnect();
              this.createConnection();
            });

            // Xử lý sự kiện kết nối thành công
            this.cacheClient.on('connect', () => {
              Logger.log('Connected to Redis');
            });

            // Kiểm tra kết nối
            await this.cacheClient.ping();
          },
          {
            retries: configs.retry.count,
            factor: configs.retry.factor,
            minTimeout: configs.retry.minTimeout,
            maxTimeout: configs.retry.maxTimeout
          }
        );
      } catch (error) {
        Logger.error(error.message);
        throw new Error('Redis connection failed!');
      }
    }

    return this.cacheClient;
  }

  async disconnect(): Promise<void> {
    if (this.cacheClient) {
      try {
        await this.cacheClient.quit();
        Logger.log('Redis connection closed gracefully');
      } catch (error) {
        Logger.error('Failed to close Redis connection');
      }
    }
  }

  // Các phương thức cache

  async setCacheExpried(key: string, value: string, expiredTime?: number): Promise<void> {
    await this.cacheClient.set(key, value).then(() => this.cacheClient.expire(key, expiredTime));
  }

  async setCache(key: string, value: string): Promise<void> {
    await this.cacheClient.set(key, value);
  }

  async getCache(key: string): Promise<string | null> {
    return this.cacheClient.get(key);
  }

  async delValue(key: string): Promise<number> {
    return await this.cacheClient.del(key);
  }

  getcache() {
    return this.cacheClient;
  }
}
