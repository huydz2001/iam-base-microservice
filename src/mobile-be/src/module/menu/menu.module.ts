import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import {
  GetModulesByGroupController,
  GetModulesByGroupHandler,
} from './feature/v1/get-modules-by-group/get-module-by-group';
import {
  GetModulesByUserController,
  GetModulesByUserHandler,
} from './feature/v1/get-modules-by-user/get-module-by-user';
import {
  GetModulesController,
  GetModulesHandler,
} from './feature/v1/get-modules/get-modules';
import { CheckJwtHandler } from '../auth/feature/v1/check-jwt/check-jwt';
import {
  CreateModuleController,
  CreateModuleHandler,
} from './feature/v1/create-module/create-module';
import {
  UpdateModuleController,
  UpdateModuleHandler,
} from './feature/v1/update-module/update-module';
import {
  DeleteModuleController,
  DeleteModuleHandler,
} from './feature/v1/delete-module/delete-module';
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
    GetModulesByGroupHandler,
    GetModulesByUserHandler,
    GetModulesHandler,
    CheckJwtHandler,
    CreateModuleHandler,
    UpdateModuleHandler,
    DeleteModuleHandler,
  ],
  controllers: [
    GetModulesByGroupController,
    GetModulesByUserController,
    GetModulesController,
    CreateModuleController,
    UpdateModuleController,
    DeleteModuleController,
  ],
})
export class MenuModule {}
