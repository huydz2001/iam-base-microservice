import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitmqModule } from 'building-blocks/rabbitmq/rabbitmq.module';
import { PermissionRepository } from '../../data/repositories/permission.repository';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import { GroupRepository } from '../../data/repositories/group.repository';
import { UserRepository } from '../../data/repositories/user.repository';
import { Group } from '../group/entities/group.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../user/entities/user.entity';
import {
  CreateGroupController,
  CreateGroupHandler,
} from './features/v1/create-group/create-group';
import { Profile } from '../user/entities/profile.entity';
import { Modules } from '../menu/entities/module.entity';
import {
  UpdateGroupController,
  UpdateGroupHandler,
} from './features/v1/update-group/update-group';
import {
  DeleteGroupByIdController,
  DeleteGroupByIdHandler,
} from './features/v1/delete-group-by-id/delete-group-by-id';
import {
  GetGroupByIdController,
  GetGroupByIdHandler,
} from './features/v1/get-group-by-id/get-group-by-id';

@Module({
  imports: [
    CqrsModule,
    RabbitmqModule.forRoot(),
    TypeOrmModule.forFeature([Permission, Group, User, Profile, Modules]),
  ],
  exports: [],
  providers: [
    CreateGroupHandler,
    UpdateGroupHandler,
    DeleteGroupByIdHandler,
    GetGroupByIdHandler,
    ConfigData,
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
    {
      provide: 'IGroupRepository',
      useClass: GroupRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  controllers: [
    CreateGroupController,
    UpdateGroupController,
    DeleteGroupByIdController,
    GetGroupByIdController,
  ],
})
export class GroupModule {}
