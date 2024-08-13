import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { HttpContext } from 'building-blocks/context/context';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource, QueryRunner } from 'typeorm';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IProfileRepository } from '../../../../../data/repositories/profile.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { Group } from '../../../../../module/group/entities/group.entity';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { TYPE_ACTION } from '../../../../../module/permission/enums/type-action.enum';
import { Profile } from '../../../../../module/user/entities/profile.entity';
import { User } from '../../../../../module/user/entities/user.entity';
import mapper from '../../../../../module/user/mapping';
import { UserDto } from '../../../dtos/user-dto';
import { encryptPassword } from 'building-blocks/utils/encryption';

export class VerifyOtp {
  otp: string;
  email: string;

  constructor(request: Partial<VerifyOtp> = {}) {
    Object.assign(this, request);
  }
}

@Injectable()
export class VerifyOtpHandler {
  private logger = new Logger(VerifyOtpHandler.name);
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
    private readonly amqpConnection: AmqpConnection,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.VERIFY_OTP,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async execute(payload: any) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const { email, password, name, permissionIds, groupIds, phone, role } =
      payload;

    let groups: Group[];
    let permissions: Permission[];

    if (groupIds.length > 0) {
      groups = await this.groupRepository.findGroupByIds(groupIds);
    }

    permissions = await this.permissionRepository.findByType(TYPE_ACTION.VIEW);

    if (permissionIds.length > 0) {
      const permissionsFilter =
        await this.permissionRepository.findByIds(permissionIds);
      permissions = [...new Set([...permissions, ...permissionsFilter])];
    }

    await queryRunner.startTransaction();

    try {
      const userEntity = new User({
        email: email,
        phone: phone,
        hashPass: await encryptPassword(password),
        role: role,
        profile: null,
        permissions: permissions ?? [],
        groups: groups ?? [],
        isEmailVerified: true,
      });

      const userId = HttpContext.request?.user?.['id'] ?? '99';

      const newUserEntity = this.configData.createData(userEntity, userId);

      // Lưu user entity
      const createdUser = await queryRunner.manager.save(User, newUserEntity);

      const profileEntity = new Profile({
        id: createdUser.id,
        userName: null,
        fullName: name,
        dob: null,
        gender: null,
        image: null,
        user: createdUser,
      });

      const newProfileEntity = this.configData.createData(
        profileEntity,
        userId,
      );

      // Lưu profile entity
      await queryRunner.manager.save(Profile, newProfileEntity);

      // Commit transaction
      await queryRunner.commitTransaction();

      const result = mapper.map<User, UserDto>(createdUser, new UserDto());
      return result;
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
