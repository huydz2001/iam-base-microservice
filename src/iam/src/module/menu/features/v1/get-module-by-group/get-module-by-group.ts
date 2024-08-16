import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';

// =================================== Caommand ==========================================
export class GetModulesByGroup {
  id: string;

  constructor(request: Partial<GetModulesByGroup> = {}) {
    Object.assign(this, request);
  }
}

export class GetModulesByGroupHandler {
  private logger = new Logger(GetModulesByGroupHandler.name);
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    private readonly configData: ConfigData,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.GET_MODULE_BY_GROUP,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(query: GetModulesByGroup): Promise<any[]> {
    const { id } = query;

    try {
      const existGroup = await this.groupRepository.findGroupById(id);
      if (!existGroup) {
        throw new NotFoundException('Group not found');
      }

      const permissions = await this.permissionRepository.findByGroupId(id);

      const permissionIds = permissions.map((item) => {
        return item.id;
      });
      const modules = this.moduleRepository.findByPermissionsIds(permissionIds);

      return modules;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
