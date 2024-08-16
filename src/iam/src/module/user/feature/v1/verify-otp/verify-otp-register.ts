import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { encryptPassword } from 'building-blocks/utils/encryption';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource, QueryRunner } from 'typeorm';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { Group } from '../../../../group/entities/group.entity';
import { Permission } from '../../../../permission/entities/permission.entity';
import { Profile } from '../../../entities/profile.entity';
import { User } from '../../../entities/user.entity';
import mapper from '../../../../../module/group/mapping';
import { UserDto } from '../../../../../module/user/dtos/user-dto';

export class VerifyOtp {
  otp: string;
  email: string;

  constructor(request: Partial<VerifyOtp> = {}) {
    Object.assign(this, request);
  }
}

@Injectable()
export class VerifyOtpRegisterHandler {
  private logger = new Logger(VerifyOtpRegisterHandler.name);
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
    private readonly redisCacheSevice: RedisCacheService,
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

    const {
      email,
      password,
      name,
      permissionIds,
      groupIds,
      phone,
      role,
      userLogin,
    } = payload;

    let groups: Group[];
    let permissions: Permission[];
    try {
      if (groupIds.length > 0) {
        groups = await this.groupRepository.findGroupByIds(groupIds);
      }

      if (permissionIds.length > 0) {
        permissions = await this.permissionRepository.findByIds(permissionIds);

        const permissionsByGroups =
          await this.permissionRepository.findByGroupIds(groupIds);

        const permissionsIdByGroups = permissionsByGroups.map(
          (item) => item.id,
        );

        const permissionsIdsResult = permissionIds.filter(
          (item: string) => !permissionsIdByGroups.includes(item),
        );

        permissions =
          await this.permissionRepository.findByIds(permissionsIdsResult);
      }

      await queryRunner.startTransaction();
      const hashPass = await encryptPassword(password);
      console.log(permissions);

      const userEntity = new User({
        email: email,
        phone: phone,
        hashPass: hashPass,
        role: role,
        profile: null,
        permissions: permissions ?? [],
        groups: groups ?? [],
        isEmailVerified: true,
      });

      const newUserEntity = this.configData.createData(userEntity, userLogin);

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
        userLogin,
      );

      // Lưu profile entity
      await queryRunner.manager.save(Profile, newProfileEntity);

      // Commit transaction
      await queryRunner.commitTransaction();

      const result = mapper.map<User, UserDto>(createdUser, new UserDto());
      return result;
    } catch (error) {
      // Rollback transaction in case of error
      this.logger.error(error.message);
      await queryRunner.rollbackTransaction();
      return error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
