import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { Modules } from '../menu/entities/module.entity';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import { GroupRepository } from '../../data/repositories/group.repository';
import { UserRepository } from '../../data/repositories/user.repository';
import { Group } from '../group/entities/group.entity';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../user/entities/user.entity';
import {
  CreateModuleController,
  CreateModuleHandler,
} from './features/v1/create-module/create-module';
import { GetModulesByGroupHandler } from './features/v1/get-module-by-group/get-module-by-group';
import { GetModulesByUserHandler } from './features/v1/get-module-by-user/get-module-by-user';
import { GetModulesHandler } from './features/v1/get-module/get-module';
import {
  UpdateModuleController,
  UpdateModuleHandler,
} from './features/v1/update-module/update-module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Permission, Modules, Group, User]),
  ],
  exports: [],
  providers: [
    CreateModuleHandler,
    GetModulesHandler,
    GetModulesByGroupHandler,
    GetModulesByUserHandler,
    UpdateModuleHandler,
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
      provide: 'IModuleRepository',
      useClass: ModuleRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  controllers: [CreateModuleController, UpdateModuleController],
})
export class MenuModule {}
