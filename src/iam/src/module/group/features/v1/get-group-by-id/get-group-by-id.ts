import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';

export class GetGroupById {
  id: string;

  constructor(item: Partial<GetGroupById> = {}) {
    Object.assign(this, item);
  }
}

// =====================================Command Handler =================================================
export class GetGroupByIdHandler {
  private logger = new Logger(GetGroupByIdHandler.name);
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.GET_GROUP_BY_ID,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: GetGroupById): Promise<any> {
    try {
      const { id } = command;

      console.log(id);
      const group = await this.groupRepository.findGroupById(id);
      console.log(group);

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      return group;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
