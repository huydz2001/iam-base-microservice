import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { AuthDto } from '../../../dtos/auth.dto';
import { TokenType } from '../../../enums/token-type.enum';
import { GenerateToken } from '../generate-token/generate-token';
import { ValidateToken } from '../validate-token/validate-token';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_AUTH } from 'building-blocks/constants/event.constant';

@Injectable()
export class RefreshTokenHandler {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private evenEmitter: EventEmitter2,
    private readonly commandBus: CommandBus,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.REFRESHTOKEN,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(payload: any): Promise<AuthDto> {
    try {
      const refreshTokenData = await this.commandBus.execute(
        new ValidateToken({
          token: payload.refreshToken,
          type: TokenType.REFRESH,
        }),
      );
      const { userId } = refreshTokenData;

      const user = await this.userRepository.findUserById(userId);

      await this.authRepository.removeToken(refreshTokenData);

      this.evenEmitter.emit(EVENT_AUTH.DEL_TOKEN_REDIS, userId);

      const token = await this.commandBus.execute(
        new GenerateToken({ userId: userId, role: user.role }),
      );

      this.evenEmitter.emit(EVENT_AUTH.SAVE_TOKEN_REDIS, { userId, token });

      return token;
    } catch (error) {
      throw new UnauthorizedException('Please authenticate');
    }
  }
}
