import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import configs from 'building-blocks/configs/configs';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { TokenType } from '../../../enums/token-type.enum';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { IUserRepository } from '../../../../../data/repositories/user.repository';

export class Logout {
  accessToken: string;

  constructor(request: Partial<Logout> = {}) {
    Object.assign(this, request);
  }
}

@Injectable()
export class LogoutHandler {
  private logger = new Logger(LogoutHandler.name);
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private redisCacheService: RedisCacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.LOGOUT,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async logout(command: Logout) {
    try {
      const token = await this.authRepository.findToken(
        command.accessToken,
        TokenType.ACCESS,
      );

      if (!token) {
        throw new NotFoundException('Token not found');
      }

      const tokenEntity = await this.authRepository.removeToken(token);

      this.eventEmitter.emit(EVENT_AUTH.LOGOUT, tokenEntity.userId);

      return tokenEntity?.userId;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
