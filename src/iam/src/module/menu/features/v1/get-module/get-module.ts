import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';

// =================================== Command ==========================================
export class GetModules {
  constructor(request: Partial<GetModules> = {}) {
    Object.assign(this, request);
  }
}

export class GetModulesHandler {
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.GET_MODULES,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(payload: GetModules): Promise<any[]> {
    const modulesEntity = await this.moduleRepository.findModules();
    return modulesEntity;
  }
}
