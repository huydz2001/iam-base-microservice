import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { RabbitmqModule } from 'building-blocks/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../permission/entities/permission.entity';
import { Modules } from '../menu/entities/module.entity';

import { ConfigData } from 'building-blocks/databases/config/config-data';
import {
  CreateUserController,
  CreateUserHandler,
} from './feature/v1/create-user/create-user';
import { GroupRepository } from '../../data/repositories/group.repository';
import { User } from './entities/user.entity';
import { Group } from '../group/entities/group.entity';
import { UserRepository } from '../../data/repositories/user.repository';
import { Profile } from './entities/profile.entity';
import { ProfileRepository } from '../../data/repositories/profile.repository';

@Module({
  imports: [
    CqrsModule,
    RabbitmqModule.forRoot(),
    TypeOrmModule.forFeature([Permission, User, Group, Modules, Profile]),
  ],
  exports: [],
  providers: [
    CreateUserHandler,
    ConfigData,
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
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
  controllers: [CreateUserController],
})
export class UserModule {}
