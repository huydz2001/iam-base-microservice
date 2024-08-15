import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRepository } from '../../data/repositories/permission.repository';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import { GroupRepository } from '../../data/repositories/group.repository';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { ProfileRepository } from '../../data/repositories/profile.repository';
import { UserRepository } from '../../data/repositories/user.repository';
import { Group } from '../group/entities/group.entity';
import { Modules } from '../menu/entities/module.entity';
import { Permission } from '../permission/entities/permission.entity';
import { Profile } from '../user/entities/profile.entity';
import { User } from '../user/entities/user.entity';
import { CreateGroupHandler } from './features/v1/create-group/create-group';
import { DeleteGroupByIdHandler } from './features/v1/delete-group-by-id/delete-group-by-id';
import { GetGroupByIdHandler } from './features/v1/get-group-by-id/get-group-by-id';
import { UpdateGroupHandler } from './features/v1/update-group/update-group';
import { GetGroupsHandler } from './features/v1/get-groups/get-groups';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Group, User, Profile, Modules]),
  ],
  exports: [],
  providers: [
    CreateGroupHandler,
    UpdateGroupHandler,
    DeleteGroupByIdHandler,
    GetGroupByIdHandler,
    GetGroupsHandler,
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
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
    {
      provide: 'IModuleRepository',
      useClass: ModuleRepository,
    },
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
  ],
  controllers: [],
})
export class GroupModule {}
