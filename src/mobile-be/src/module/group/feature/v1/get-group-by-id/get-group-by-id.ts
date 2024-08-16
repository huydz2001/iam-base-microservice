import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Logger, Param } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { Auth } from '../../../../../common/decorator/auth.decorator';
import { GroupDto } from '../../../dtos/group.dto';

// =================================== Command ==========================================
export class GetGroupById {
  id: string;

  constructor(item: Partial<GetGroupById> = {}) {
    Object.assign(this, item);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Groups')
@Controller({
  path: `/group`,
  version: '1',
})
export class GetGroupByIdController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('detail/:id')
  @Auth()
  async getGroupById(@Param('id') id: string): Promise<GroupDto> {
    const result = await this.queryBus.execute(
      new GetGroupById({
        id: id,
      }),
    );

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetGroupById)
export class GetGroupByIdHandler implements IQueryHandler<GetGroupById> {
  private logger = new Logger(GetGroupByIdHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(query: GetGroupById): Promise<GroupDto> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.GET_GROUP_BY_ID,
        payload: query,
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
