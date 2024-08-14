import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { isPasswordMatch } from 'building-blocks/utils/encryption';

import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';

export class ChangePassword {
  userId: string;
  oldPass: string;
  newPass: string;

  constructor(request: Partial<ChangePassword> = {}) {
    Object.assign(this, request);
  }
}

export class ChangePassHandler {
  private logger = new Logger(ChangePassHandler.name);
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly commandBus: CommandBus,
    private readonly eventEmitter: EventEmitter2,
    private readonly amqpConnection: AmqpConnection,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.CHANGE_PASS,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async changePass(payload: ChangePassword) {
    try {
      const { userId, oldPass } = payload;
      const user = await this.userRepository.findUserById(userId);

      if (!user || !(await isPasswordMatch(oldPass, user.hashPass as string))) {
        throw new BadRequestException('Current password is incorrect');
      }

      const message = { name: user.profile.fullName, email: user.email };

      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.AUTH.CHANGE_PASS,
        payload: message,
        timeout: 10000,
      });

      this.logger.debug(resp);

      if (resp?.message !== undefined) {
        const response = new ReponseDto({
          name: resp?.name,
          message: resp?.message,
        });
        handleRpcError(response);
      } else {
        const result = { ...payload, otp: resp.data };
        await this.redisCacheService.setCacheExpried(
          `otp-change-pass:${user.id}`,
          JSON.stringify(result),
          60,
        );
        return resp?.data ?? null;
      }
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
