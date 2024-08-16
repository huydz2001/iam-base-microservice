import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Logger } from '@nestjs/common';
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
export class GetModules {
  constructor(request: Partial<GetModules> = {}) {
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
export class GetModulesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @Auth()
  async getModules(): Promise<any[]> {
    const result = await this.queryBus.execute(new GetModules());
    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetModules)
export class GetModulesHandler implements ICommandHandler<GetModules> {
  private readonly logger = new Logger(GetModulesHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}
  async execute(query: GetModules): Promise<any[]> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.GET_MODULES,
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
