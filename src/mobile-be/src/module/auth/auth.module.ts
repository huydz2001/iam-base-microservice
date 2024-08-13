import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CheckJwtHandler } from './feature/v1/check-jwt/check-jwt';
import { LoginController, LoginHandler } from './feature/v1/login/login';
import { LogoutController, LogoutHandler } from './feature/v1/logout/logout';
import configs from 'building-blocks/configs/configs';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
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
  exports: [LoginHandler, LogoutHandler, CheckJwtHandler],
  providers: [LoginHandler, LogoutHandler, CheckJwtHandler],
  controllers: [LoginController, LogoutController],
})
export class AuthModule {}
