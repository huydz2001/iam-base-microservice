import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { Group } from '../group/entities/group.entity';
import { Modules } from '../menu/entities/module.entity';
import { Profile } from '../user/entities/profile.entity';
import { User } from '../user/entities/user.entity';
import { Permission } from './entities/permission.entity';
import {
  CreatePermissionController,
  CreatePermissionHandler,
} from './features/v1/create-permission/create-permission';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Permission, Modules, Group, User, Profile]),
  ],
  exports: [],
  providers: [
    CreatePermissionHandler,
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
  controllers: [CreatePermissionController],
})
export class PermissionModule {}
