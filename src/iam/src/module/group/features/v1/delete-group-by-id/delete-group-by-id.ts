import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import mapper from '../../../mapping';

export class DeleteGroupById {
  id: string;

  constructor(request: Partial<DeleteGroupById> = {}) {
    Object.assign(this, request);
  }
}

export class DeleteGroupByIdHandler {
  private logger = new Logger(DeleteGroupByIdHandler.name);
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.DEL_GROUP,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: DeleteGroupById): Promise<GroupDto> {
    try {
      const group = await this.groupRepository.findGroupById(command.id);

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const groupEntity = await this.groupRepository.removeGroup(group);
      groupEntity.id = command.id;

      const result = mapper.map<Group, GroupDto>(groupEntity, new GroupDto());

      return result;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
