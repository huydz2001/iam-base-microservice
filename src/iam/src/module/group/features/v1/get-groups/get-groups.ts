import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';

// =====================================Command Handler =================================================
export class GetGroupsHandler {
  private logger = new Logger(GetGroupsHandler.name);
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.GET_GROUPS,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: any): Promise<any> {
    try {
      console.log(command);
      const groups = await this.groupRepository.findAll();

      return groups;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
