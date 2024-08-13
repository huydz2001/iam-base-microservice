import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { getDurationExpired } from './../../../../../../../building-blocks/utils/get-duration-expired';

@Injectable()
export class HandleEventListener {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  @OnEvent(EVENT_AUTH.SAVE_TOKEN_REDIS)
  async saveTokenRedis(payload: any) {
    const { userId, token } = payload;

    const expiredAccess = getDurationExpired(token.access?.expires);

    const expiredRefresh = getDurationExpired(token.refresh?.expires);

    Promise.all([
      await this.redisCacheService.setCacheExpried(
        `accessToken:${userId}`,
        JSON.stringify(token.access),
        expiredAccess,
      ),

      await this.redisCacheService.setCacheExpried(
        `refreshToken:${userId}`,
        JSON.stringify(token.refresh),
        expiredRefresh,
      ),
    ]);
  }

  @OnEvent(EVENT_AUTH.LOGOUT)
  async logout(payload: any) {
    Promise.all([
      await this.redisCacheService.delValue(`accessToken:${payload}`),
      await this.redisCacheService.delValue(`refreshToken:${payload}`),
    ]);
  }
}
