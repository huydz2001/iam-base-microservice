import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { Modules } from '../menu/entities/module.entity';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import { GroupRepository } from '../../data/repositories/group.repository';
import { Group } from '../group/entities/group.entity';
import { Permission } from '../permission/entities/permission.entity';
import {
  CreateModuleController,
  CreateModuleHandler,
} from './features/v1/create-module/create-module';
import {
  GetModulesByGroupController,
  GetModulesByGroupHandler,
} from './features/v1/get-module-by-group/get-module-by-group';
import {
  GetModulesByUserController,
  GetModulesByUserHandler,
} from './features/v1/get-module-by-user/get-module-by-user';
import {
  GetModulesController,
  GetModulesHandler,
} from './features/v1/get-module/get-module';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Permission, Modules, Group])],
  exports: [],
  providers: [
    CreateModuleHandler,
    GetModulesHandler,
    GetModulesByGroupHandler,
    GetModulesByUserHandler,
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
  ],
  controllers: [
    GetModulesByUserController,
    CreateModuleController,
    GetModulesController,
    GetModulesByGroupController,
  ],
})
export class MenuModule {}
