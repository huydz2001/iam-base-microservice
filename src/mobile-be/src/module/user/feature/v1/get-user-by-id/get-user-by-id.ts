import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
} from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { isUUID } from 'class-validator';
import { Auth } from '../../../../../common/decorator/auth.decorator';

// =================================== Caommand ==========================================
export class GetUserById {
  id: string;

  constructor(request: Partial<GetUserById> = {}) {
    Object.assign(this, request);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: `/user`,
  version: '1',
})
export class GetUserByIdController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('detail/:id')
  @Auth()
  async getModules(@Param('id') id: string): Promise<any[]> {
    if (!isUUID(id)) {
      throw new BadRequestException('Id must be UUID');
    }
    const result = await this.queryBus.execute(new GetUserById({ id: id }));

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetUserById)
export class GetUserByIdHandler implements IQueryHandler<GetUserById> {
  private logger = new Logger(GetUserByIdHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(query: GetUserById): Promise<any[]> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.GET_USER_BY_ID,
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
