import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource, QueryRunner } from 'typeorm';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IProfileRepository } from '../../../../../data/repositories/profile.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import mapper from '../../../../../module/user/mapping';
import { UserDto } from '../../../../../module/user/dtos/user-dto';
import { Group } from '../../../../group/entities/group.entity';
import { Permission } from '../../../../permission/entities/permission.entity';
import { Profile } from '../../../entities/profile.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class UpdateUserHandler {
  private logger = new Logger(UpdateUserHandler.name);
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
    private readonly redisCacheSevice: RedisCacheService,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.UPDATE,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async execute(payload: any) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const { userId, name, permissionIds, groupIds, role, userLoginId } =
      payload;

    let groups: Group[];
    let permissions: Permission[];
    try {
      let existUser = await this.userRepository.findUserById(userId);
      if (!existUser) {
        throw new NotFoundException('User not found');
      }

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
      } else {
        permissions = [];
      }

      existUser.groups = groups;
      existUser.permissions = permissions;
      existUser.role = role;

      await queryRunner.startTransaction();
      existUser = this.configData.createData(existUser, userLoginId);

      // Lưu user entity
      const createdUser = await queryRunner.manager.save(User, existUser);

      let existProfile = await this.profileRepository.findByUserId(userId);
      if (!existProfile) {
        throw new NotFoundException('Profile not found');
      }
      existProfile.fullName = name;

      existProfile = this.configData.createData(existProfile, userLoginId);

      // Lưu profile entity
      await queryRunner.manager.save(Profile, existProfile);

      // Commit transaction
      await queryRunner.commitTransaction();

      const result = mapper.map<User, UserDto>(createdUser, new UserDto());
      result.name = name;
      result.phone = existUser.phone;
      result.email = existUser.email;
      result.role = role;

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
