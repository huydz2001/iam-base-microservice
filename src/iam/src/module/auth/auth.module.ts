import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRepository } from '../../data/repositories/auth.repository';
import { ProfileRepository } from '../../data/repositories/profile.repository';
import { UserRepository } from '../../data/repositories/user.repository';
import { Profile } from '../user/entities/profile.entity';
import { User } from '../user/entities/user.entity';
import { Token } from './entities/token.entity';
import { HandleEventListener } from './features/v1/event-listener/event-listener';
import { GenerateTokenHandler } from './features/v1/generate-token/generate-token';
import { LoginHandler } from './features/v1/login/login';
import { LogoutHandler } from './features/v1/logout/logout';
import {
  RefreshTokenController,
  RefreshTokenHandler,
} from './features/v1/refresh-token/refresh-token';
import { ValidateTokenHandler } from './features/v1/validate-token/validate-token';
import { CheckTokenHandler } from './features/v1/check-jwt/check-jwt';
import { ChangePassHandler } from './features/v1/change-pass/change-pass';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import { VerifyOtpChangePassHandler } from './features/v1/verify-change-pass/verify-change-pass';
import { ConfigData } from 'building-blocks/databases/config/config-data';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User, Token, Profile]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: configs.rabbitmq.exchange,
          type: 'topic',
          options: { autoDelete: true },
        },
      ],
      uri: configs.rabbitmq.uri,
      connectionInitOptions: { wait: false },
    }),
  ],
  exports: [ChangePassHandler, VerifyOtpChangePassHandler],
  providers: [
    ValidateTokenHandler,
    RefreshTokenHandler,
    LoginHandler,
    LogoutHandler,
    GenerateTokenHandler,
    HandleEventListener,
    CheckTokenHandler,
    ChangePassHandler,
    VerifyOtpChangePassHandler,
    ConfigData,
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
  ],
  controllers: [RefreshTokenController],
})
export class AuthModule {}
