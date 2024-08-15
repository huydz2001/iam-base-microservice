import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import { CheckJwtHandler } from '../auth/feature/v1/check-jwt/check-jwt';
import {
  CreateGroupController,
  CreateGroupHandler,
} from './feature/v1/create-group/create-group';
import {
  DeleteGroupByIdController,
  DeleteGroupByIdHandler,
} from './feature/v1/delete-group/delete-group';
import {
  GetGroupByIdController,
  GetGroupByIdHandler,
} from './feature/v1/get-group-by-id/get-group-by-id';
import {
  UpdateGroupController,
  UpdateGroupHandler,
} from './feature/v1/update-group/update-group';
import {
  GetGroupsController,
  GetGroupsHandler,
} from './feature/v1/get-groups/get-groups';
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
    CreateGroupHandler,
    CheckJwtHandler,
    DeleteGroupByIdHandler,
    UpdateGroupHandler,
    GetGroupByIdHandler,
    GetGroupsHandler,
  ],
  controllers: [
    CreateGroupController,
    UpdateGroupController,
    DeleteGroupByIdController,
    GetGroupByIdController,
    GetGroupsController,
  ],
})
export class GroupModule {}
