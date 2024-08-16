import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';

// =================================== Caommand ==========================================
export class GetModulesByUser {
  id: string;

  constructor(request: Partial<GetModulesByUser> = {}) {
    Object.assign(this, request);
  }
}

export class GetModulesByUserHandler {
  private logger = new Logger(GetModulesByUserHandler.name);
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
    routingKey: RoutingKey.MOBILE_BE.GET_MODULE_BY_USER,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(query: GetModulesByUser): Promise<any[]> {
    const { id } = query;
    let permissionIds = [];

    try {
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

      const modules = this.moduleRepository.findByPermissionsIds(permissionIds);

      return modules;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
