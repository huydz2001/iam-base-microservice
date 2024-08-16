import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';

// =================================== Caommand ==========================================
export class GetUserById {
  id: string;

  constructor(request: Partial<GetUserById> = {}) {
    Object.assign(this, request);
  }
}

export class GetUserByIdHandler {
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configData: ConfigData,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.GET_USER_BY_ID,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(query: GetUserById): Promise<any> {
    const { id } = query;
    let permissionIds = [];

    const existUser = await this.userRepository.findUserById(id);
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    const groups = await this.groupRepository.findGroupsByUserId(id);

    if (groups.length > 0) {
      const groupIds = groups.map((item) => item.id);
      const permissions =
        await this.permissionRepository.findByGroupIds(groupIds);

      permissionIds = permissions.map((item) => item.id);
    }

    const permissionsUser = await this.permissionRepository.findByUserId(id);

    console.log(permissionsUser);

    if (permissionsUser.length > 0) {
      permissionsUser.map((item) => {
        permissionIds.push(item.id);
      });
    }

    permissionIds = [...new Set(permissionIds)];
    console.log(permissionIds);

    const modules =
      await this.moduleRepository.findByPermissionsIds(permissionIds);

    console.log(modules);

    const groupsResp = groups.map((item) => {
      return {
        id: item.id,
        name: item.name,
        desc: item.desc,
      };
    });

    return {
      id: existUser.id,
      fullName: existUser.profile.fullName,
      userName: existUser.profile.userName,
      email: existUser.email,
      role: existUser.role,
      isVerifyEmail: existUser.isEmailVerified,
      permissions: modules,
      groups: groupsResp,
    };
  }
}
