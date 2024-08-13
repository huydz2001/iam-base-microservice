import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { JwtDto } from 'building-blocks/passport/jwt-thirty.guard';

@Injectable()
export class CheckJwtHandler {
  private logger = new Logger(CheckJwtHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async checkJwtGuard(command: JwtDto) {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.CHECK_JWT_TOKEN,
        payload: command,
        timeout: 10000,
      });
      if (resp?.data?.messageResp) {
        throw new BadRequestException(resp.data.messageResp);
      }

      this.logger.debug(resp);
      return resp?.data ?? null;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async checkAdminGuard(command: JwtDto) {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.CHECK_ADMIN_GUARD,
        payload: command,
        timeout: 10000,
      });
      if (resp?.data?.messageResp) {
        throw new BadRequestException(resp.data.messageResp);
      }

      this.logger.debug(resp);
      return resp?.data ?? null;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
