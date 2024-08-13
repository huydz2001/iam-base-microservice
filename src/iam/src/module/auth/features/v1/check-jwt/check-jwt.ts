import { Inject, Logger, UnauthorizedException } from '@nestjs/common';

import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { JwtDto } from 'building-blocks/passport/jwt-thirty.guard';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import jwt from 'jsonwebtoken';
import { Role } from 'building-blocks/constracts/identity-constract';

export class CheckTokenHandler {
  private logger = new Logger(CheckTokenHandler.name);
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.CHECK_JWT_TOKEN,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async checkValidateJWT(payload: JwtDto) {
    try {
      const decodeToken = jwt.verify(payload.accessToken, configs.jwt.secret);

      if (!decodeToken) {
        throw new UnauthorizedException('Invalid Token');
      }

      const exsitToken = await this.redisCacheService.getCache(
        `accessToken:${decodeToken['id']}`,
      );

      if (!exsitToken) {
        throw new UnauthorizedException('Invalid Token');
      }

      return exsitToken;
    } catch (err) {
      this.logger.error(err.message);
      return {
        messageResp: err.message,
      };
    }
  }

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.CHECK_ADMIN_GUARD,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async checkValidateAdmin(payload: JwtDto) {
    try {
      const decodeToken = jwt.verify(payload.accessToken, configs.jwt.secret);

      if (!decodeToken) {
        throw new UnauthorizedException('Invalid Token');
      }

      const exsitToken = await this.redisCacheService.getCache(
        `accessToken:${decodeToken['id']}`,
      );

      if (!exsitToken) {
        throw new UnauthorizedException('Invalid Token');
      }

      if (decodeToken['role'] != Role.ADMIN) {
        throw new UnauthorizedException('You have no permission');
      }

      return exsitToken;
    } catch (err) {
      this.logger.error(err.message);
      return {
        messageResp: err.message,
      };
    }
  }
}
