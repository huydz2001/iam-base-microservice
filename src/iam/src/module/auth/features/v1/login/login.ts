import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { isPasswordMatch } from 'building-blocks/utils/encryption';

import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import configs from 'building-blocks/configs/configs';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { AuthDto } from '../../../../auth/dtos/auth.dto';
import { GenerateToken } from '../generate-token/generate-token';

export class Login {
  email: string;
  password: string;

  constructor(request: Partial<Login> = {}) {
    Object.assign(this, request);
  }
}

export class LoginHandler {
  private logger = new Logger(LoginHandler.name);
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly commandBus: CommandBus,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.LOGIN,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async login(command: Login): Promise<AuthDto> {
    try {
      const user = await this.userRepository.findUserByEmail(command.email);

      if (
        !user ||
        !(await isPasswordMatch(command.password, user.hashPass as string))
      ) {
        throw new BadRequestException('Incorrect email or password');
      }

      const token = await this.commandBus.execute(
        new GenerateToken({ userId: user.id, role: user.role }),
      );

      const payloadSaveToken = { userId: user.id, token: token };

      this.eventEmitter.emit(EVENT_AUTH.SAVE_TOKEN_REDIS, payloadSaveToken);

      return token;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
