import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import configs from 'building-blocks/configs/configs';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource } from 'typeorm';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { GenerateToken } from '../generate-token/generate-token';
import { encryptPassword } from 'building-blocks/utils/encryption';

export class VerifyOtp {
  otp: string;
  userId: string;

  constructor(request: Partial<VerifyOtp> = {}) {
    Object.assign(this, request);
  }
}

@Injectable()
export class VerifyOtpChangePassHandler {
  private logger = new Logger(VerifyOtpChangePassHandler.name);
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
    private readonly amqpConnection: AmqpConnection,
    private readonly redisCacheService: RedisCacheService,
    private readonly commandBus: CommandBus,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.VERIFY_OTP_CHANGE_PASS,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async verifyOtpChangePass(payload: any) {
    try {
      const { userId, newPass } = payload;

      const passHash = await encryptPassword(newPass);

      await this.userRepository.updatePass(userId, passHash);

      const user = await this.userRepository.findUserById(userId);

      this.eventEmitter.emit(EVENT_AUTH.DEL_TOKEN_REDIS, userId);

      const token = await this.commandBus.execute(
        new GenerateToken({ userId: userId, role: user.role }),
      );

      const payloadSaveToken = { userId: userId, token: token };

      this.eventEmitter.emit(EVENT_AUTH.SAVE_TOKEN_REDIS, payloadSaveToken);

      return token;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
