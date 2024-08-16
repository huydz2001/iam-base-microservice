import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRepository } from '../../data/repositories/module.repository';
import { PermissionRepository } from '../../data/repositories/permission.repository';
import { Modules } from '../menu/entities/module.entity';
import { Permission } from '../permission/entities/permission.entity';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import configs from 'building-blocks/configs/configs';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { GroupRepository } from '../../data/repositories/group.repository';
import { ProfileRepository } from '../../data/repositories/profile.repository';
import { UserRepository } from '../../data/repositories/user.repository';
import { VerifyOtpChangePassHandler } from '../auth/features/v1/verify-change-pass/verify-change-pass';
import { Group } from '../group/entities/group.entity';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { CreateUserHandler } from './feature/v1/create-user/create-user';
import { VerifyOtpRegisterHandler } from './feature/v1/verify-otp/verify-otp-register';
import { GetUserByIdHandler } from './feature/v1/get-user-by-id/get-user-by-id';
import { UpdateUserHandler } from './feature/v1/update-user/update-user';
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Permission, User, Group, Modules, Profile]),
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
  exports: [
    CreateUserHandler,
    VerifyOtpRegisterHandler,
    VerifyOtpChangePassHandler,
  ],
  providers: [
    CreateUserHandler,
    VerifyOtpRegisterHandler,
    VerifyOtpChangePassHandler,
    GetUserByIdHandler,
    UpdateUserHandler,
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
  controllers: [],
})
export class UserModule {}
