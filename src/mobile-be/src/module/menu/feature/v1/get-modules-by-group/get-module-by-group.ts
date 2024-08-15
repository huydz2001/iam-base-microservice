import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { Auth } from '../../../../../common/decorator/auth.decorator';

// =================================== Caommand ==========================================
export class GetModulesByGroup {
  id: string;

  constructor(request: Partial<GetModulesByGroup> = {}) {
    Object.assign(this, request);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Modules')
@Controller({
  path: `/module`,
  version: '1',
})
export class GetModulesByGroupController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('get-by-group')
  @Auth()
  async getModules(@Query('id') id: string): Promise<any[]> {
    const result = await this.queryBus.execute(new GetModulesByGroup({ id }));

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetModulesByGroup)
export class GetModulesByGroupHandler
  implements ICommandHandler<GetModulesByGroup>
{
  private readonly logger = new Logger(GetModulesByGroupHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(query: GetModulesByGroup): Promise<any[]> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.GET_MODULE_BY_GROUP,
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
