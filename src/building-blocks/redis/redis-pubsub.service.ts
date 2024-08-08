import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import asyncRetry from 'async-retry';
import { Redis } from 'ioredis';
import configs from '../configs/configs';

export class RedisPubsubOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;

  constructor(partial?: Partial<RedisPubsubOptions>) {
    Object.assign(this, partial);
  }
}

@Injectable()
export class RedisPubsubService implements OnModuleInit {
  private cachePubsub: Redis;

  constructor(@Inject(RedisPubsubOptions) private readonly options: RedisPubsubOptions) {}

  async onModuleInit(): Promise<void> {
    this.createConnection(this.options);
  }

  async createConnection(options?: RedisPubsubOptions): Promise<Redis> {
    if (!this.cachePubsub) {
      try {
        await asyncRetry(
          async () => {
            this.cachePubsub = new Redis({
              host: options?.host ?? configs.redis.host,
              port: options?.port ?? configs.redis.port
            });

            // Xử lý sự kiện lỗi
            this.cachePubsub.on('error', (error) => {
              Logger.error(`Error occurred on connection redis pubsub: ${error}`);
              this.disconnect();
              this.createConnection();
            });

            // Xử lý sự kiện kết nối thành công
            this.cachePubsub.on('connect', () => {
              Logger.log('Connected to Redis Pubsub');
            });

            // Kiểm tra kết nối
            await this.cachePubsub.ping();
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
        throw new Error('Redis pubsub connection failed!');
      }
    }

    return this.cachePubsub;
  }

  async disconnect(): Promise<void> {
    if (this.cachePubsub) {
      try {
        await this.cachePubsub.quit();
        Logger.log('Redis pubsub connection closed gracefully');
      } catch (error) {
        Logger.error('Failed to close Redis pubsub connection');
      }
    }
  }

  // Các phương thức cache

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.cachePubsub.publish(channel, message);
      Logger.log(`Message published to ${channel}: ${message}`);
    } catch (error) {
      Logger.error(`Failed to publish message to ${channel}`, error);
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      this.cachePubsub.on('message', (channelName, message) => {
        if (channelName === channel) {
          callback(message);
        }
      });

      await this.cachePubsub.subscribe(channel);
      Logger.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      Logger.error(`Failed to subscribe to ${channel}`, error);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.cachePubsub.unsubscribe(channel);
      Logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      Logger.error(`Failed to unsubscribe from ${channel}`, error);
    }
  }
  getcache() {
    return this.cachePubsub;
  }
}
