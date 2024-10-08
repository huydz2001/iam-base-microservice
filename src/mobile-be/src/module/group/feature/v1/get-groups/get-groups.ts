import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Logger } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { Auth } from '../../../../../common/decorator/auth.decorator';

export class GroupResponse {
  id: string;
  name: string;
  desc: string;

  constructor(item: Partial<GroupResponse> = {}) {
    Object.assign(this, item);
  }
}

// =================================== Command ==========================================
export class GetGroups {
  constructor(item: Partial<GetGroups> = {}) {
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
export class GetGroupsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @Auth()
  async getGroups(): Promise<GroupResponse> {
    const result = await this.queryBus.execute(new GetGroups({}));

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetGroups)
export class GetGroupsHandler implements IQueryHandler<GetGroups> {
  private logger = new Logger(GetGroupsHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(query: GetGroups): Promise<GroupResponse> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.GET_GROUPS,
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
