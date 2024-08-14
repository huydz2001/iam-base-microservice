import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import {
  VerifyOtpChangePassController,
  VerifyOtpChangePassHandler,
} from '../auth/feature/v1/verify-change-pass/verify-change-pass';
import {
  CreateUserController,
  CreateUserHandler,
} from './feature/v1/create-user/create-user';
import {
  VerifyOtpController,
  VerifyOtpRegisterHandler,
} from './feature/v1/verify-otp/verify-otp-register';
import { CheckJwtHandler } from '../auth/feature/v1/check-jwt/check-jwt';
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
  providers: [
    CreateUserHandler,
    VerifyOtpRegisterHandler,
    ConfigData,
    VerifyOtpChangePassHandler,
    CheckJwtHandler,
  ],
  controllers: [
    CreateUserController,
    VerifyOtpController,
    VerifyOtpChangePassController,
  ],
})
export class UserModule {}
