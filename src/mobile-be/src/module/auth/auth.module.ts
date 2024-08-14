import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import {
  ChangePassController,
  ChangePassHandler,
} from './feature/v1/change-password/change-password';
import { CheckJwtHandler } from './feature/v1/check-jwt/check-jwt';
import { LoginController, LoginHandler } from './feature/v1/login/login';
import { LogoutController, LogoutHandler } from './feature/v1/logout/logout';
@Module({
  imports: [
    CqrsModule,
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
  exports: [LoginHandler, LogoutHandler, CheckJwtHandler, ChangePassHandler],
  providers: [LoginHandler, LogoutHandler, CheckJwtHandler, ChangePassHandler],
  controllers: [LoginController, LogoutController, ChangePassController],
})
export class AuthModule {}
