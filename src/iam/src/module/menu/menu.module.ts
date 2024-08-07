import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { RabbitmqModule } from 'building-blocks/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modules } from '../menu/entities/module.entity';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import { Permission } from '../permission/entities/permission.entity';
import {
  CreateModuleController,
  CreateModuleHandler,
} from './features/v1/create-module/create-module';
import { Group } from '../group/entities/group.entity';
import {
  GetModulesController,
  GetModulesHandler,
} from './features/v1/get-module/get-module';

@Module({
  imports: [
    CqrsModule,
    RabbitmqModule.forRoot(),
    TypeOrmModule.forFeature([Permission, Modules, Group]),
  ],
  exports: [],
  providers: [
    CreateModuleHandler,
    GetModulesHandler,
    ConfigData,
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
    {
      provide: 'IModuleRepository',
      useClass: ModuleRepository,
    },
  ],
  controllers: [CreateModuleController, GetModulesController],
})
export class MenuModule {}
