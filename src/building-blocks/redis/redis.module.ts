import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisCacheService, RedisOptions } from './redis-cache.service';
import { RedisPubsubOptions, RedisPubsubService } from './redis-pubsub.service';

@Global()
@Module({
  imports: [],
  providers: [RedisCacheService, RedisPubsubService],
  exports: [RedisCacheService, RedisPubsubService]
})
export class RedisModule {
  constructor(
    private readonly redisCacheService: RedisCacheService,
    private readonly redisPubsubService: RedisPubsubService
  ) {}
  async onApplicationShutdown() {
    await Promise.all([this.redisPubsubService.disconnect(), this.redisCacheService.disconnect()]);
  }

  static forRoot(options?: RedisOptions, optionsPubsub?: RedisPubsubOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        RedisCacheService,
        RedisPubsubService,
        { provide: RedisOptions, useValue: options },
        { provide: RedisPubsubOptions, useValue: optionsPubsub }
      ]
    };
  }
}
