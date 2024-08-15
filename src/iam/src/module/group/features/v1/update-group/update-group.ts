import {
  ConflictException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import { TypePermissionCreateGroup } from '../../../../../module/group/enums/type-create-permission';
import mapper from '../../../../../module/group/mapping';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { User } from '../../../../../module/user/entities/user.entity';
import configs from 'building-blocks/configs/configs';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';

export class UpdateGroup {
  id: string;
  name: string;
  desc: string;
  type: string;
  userIds: string[];
  permissionIds: string[];
  userLoginId: string;

  constructor(item: Partial<UpdateGroup> = {}) {
    Object.assign(this, item);
  }
}

export class UpdateGroupHandler {
  private logger = new Logger(UpdateGroupHandler.name);
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configData: ConfigData,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.UPDATE_GROUP,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: UpdateGroup): Promise<GroupDto> {
    try {
      const { id, name, desc, userIds, permissionIds, type, userLoginId } =
        command;

      let users: User[] = [];
      let permissions: Permission[] = [];

      let existGroup = await this.groupRepository.findGroupById(id);
      if (!existGroup) {
        throw new NotFoundException('Group not found!');
      }

      const existGroupName = await this.groupRepository.findGroupByName(name);
      if (existGroupName && existGroupName.id !== id) {
        throw new ConflictException('Group name has already exist');
      }

      if (userIds.length > 0) {
        users = await this.userRepository.findUserByIds(userIds);
      }

      if (type === TypePermissionCreateGroup.ALL) {
        permissions = await this.permissionRepository.findAll();
      } else {
        if (permissionIds.length > 0) {
          permissions =
            await this.permissionRepository.findByIds(permissionIds);
        }
      }

      existGroup.name = name;
      existGroup.desc = desc;
      existGroup.permissions = permissions ?? [];
      existGroup.users = users ?? [];

      existGroup = this.configData.updateData(existGroup, userLoginId);

      await this.groupRepository.updateGroup(existGroup);

      const result = mapper.map<Group, GroupDto>(existGroup, new GroupDto());

      return result;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
