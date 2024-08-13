import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import {
  CreateUserController,
  CreateUserHandler,
} from './feature/v1/create-user/create-user';
import {
  VerifyOtpController,
  VerifyOtpHandler,
} from './feature/v1/verify-otp/verify-otp';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
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
  exports: [],
  providers: [CreateUserHandler, VerifyOtpHandler, ConfigData],
  controllers: [CreateUserController, VerifyOtpController],
})
export class UserModule {}
