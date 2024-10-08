import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { getDurationExpired } from 'building-blocks/utils/get-duration-expired';

@Injectable()
export class HandleEventListener {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  @OnEvent(EVENT_AUTH.SAVE_TOKEN_REDIS)
  async saveTokenRedis(payload: any) {
    const { userId, token } = payload;

    const expiredAccess = getDurationExpired(token.access?.expires);

    const expiredRefresh = getDurationExpired(token.refresh?.expires);

    await Promise.all([
      this.redisCacheService.setCacheExpried(
        `accessToken:${userId}`,
        JSON.stringify(token.access),
        expiredAccess,
      ),

      this.redisCacheService.setCacheExpried(
        `refreshToken:${userId}`,
        JSON.stringify(token.refresh),
        expiredRefresh,
      ),
    ]);
  }

  @OnEvent(EVENT_AUTH.LOGOUT)
  async logout(payload: any) {
    await Promise.all([
      this.redisCacheService.delValue(`accessToken:${payload}`),
      this.redisCacheService.delValue(`refreshToken:${payload}`),
    ]);
  }

  @OnEvent(EVENT_AUTH.DEL_TOKEN_REDIS)
  async delTokenRedis(payload: any) {
    await Promise.all([
      this.redisCacheService.delValue(`accessToken:${payload}`),
      this.redisCacheService.delValue(`refreshToken:${payload}`),
    ]);
  }
}
