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
export class GetModulesByUser {
  id: string;

  constructor(request: Partial<GetModulesByUser> = {}) {
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
export class GetModulesByUserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('get-by-user')
  @Auth()
  async getModules(@Query('id') id: string): Promise<any[]> {
    const result = await this.queryBus.execute(new GetModulesByUser({ id }));

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetModulesByUser)
export class GetModulesByUserHandler
  implements ICommandHandler<GetModulesByUser>
{
  private logger = new Logger(GetModulesByUserHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(query: GetModulesByUser): Promise<any[]> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.GET_MODULE_BY_USER,
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
