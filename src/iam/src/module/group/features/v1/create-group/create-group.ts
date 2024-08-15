import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import { TypePermissionCreateGroup } from '../../../../../module/group/enums/type-create-permission';
import mapper from '../../../../../module/group/mapping';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { User } from '../../../../../module/user/entities/user.entity';

export class CreateGroup {
  name: string;
  desc: string;
  type: string;
  userIds: string[];
  permissionIds: string[];

  constructor(item: Partial<CreateGroup> = {}) {
    Object.assign(this, item);
  }
}

// =====================================Command Handler =================================================
export class CreateGroupHandler {
  private logger = new Logger(CreateGroupHandler.name);
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
    routingKey: RoutingKey.MOBILE_BE.CREATE_GROUP,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: CreateGroup): Promise<GroupDto> {
    try {
      const { name, desc, userIds, permissionIds, type } = command;
      const userId = JSON.parse(
        await this.redisCacheService.getCache('userLogin'),
      );
      let users: User[] = [];
      let permissions: Permission[] = [];

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

      let group = new Group({
        name: name,
        desc: desc,
        users: users ?? [],
        permissions: permissions ?? [],
      });

      group = this.configData.createData(group, userId);

      await this.groupRepository.createGroup(group);

      const result = mapper.map<Group, GroupDto>(group, new GroupDto());

      return result;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
