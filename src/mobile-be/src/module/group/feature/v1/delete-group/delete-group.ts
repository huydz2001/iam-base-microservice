import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Controller,
  Delete,
  Logger,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { GroupDto } from '../../../../../module/group/dtos/group.dto';
import { isUUID } from 'class-validator';

export class DeleteGroupById {
  id: string;

  constructor(request: Partial<DeleteGroupById> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Groups')
@Controller({
  path: `/group`,
  version: '1',
})
export class DeleteGroupByIdController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('delete')
  @AdminAuth()
  public async deleteGroupById(@Query('id') id: string): Promise<GroupDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Id must be UUID');
    }

    const group = await this.commandBus.execute(
      new DeleteGroupById({
        id: id,
      }),
    );

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }
}

@CommandHandler(DeleteGroupById)
export class DeleteGroupByIdHandler
  implements ICommandHandler<DeleteGroupById>
{
  private readonly logger = new Logger(DeleteGroupByIdHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: DeleteGroupById): Promise<GroupDto> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.DEL_GROUP,
        payload: command,
        timeout: 10000,
      });

      if (resp?.data?.message !== undefined) {
        const response = new ReponseDto({
          name: resp?.data.name,
          message: resp?.data.message,
        });
        handleRpcError(response);
      } else {
        return resp?.data ?? null;
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
