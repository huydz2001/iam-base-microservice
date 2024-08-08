import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { RabbitmqModule } from 'building-blocks/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Modules } from '../menu/entities/module.entity';
import {
  CreatePermissionController,
  CreatePermissionHandler,
} from './features/v1/create-permission/create-permission';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { Group } from '../group/entities/group.entity';
import { User } from '../user/entities/user.entity';
import { Profile } from '../user/entities/profile.entity';

@Module({
  imports: [
    CqrsModule,
    RabbitmqModule.forRoot(),
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
