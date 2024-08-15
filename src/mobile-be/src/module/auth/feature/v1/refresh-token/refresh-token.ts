import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { AuthDto } from '../../../dtos/auth.dto';

export class RefreshToken {
  refreshToken: string;

  constructor(request: Partial<RefreshToken> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Identities')
@Controller({
  path: `/identity`,
  version: '1',
})
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('refresh-token')
  public async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthDto> {
    const result = await this.commandBus.execute(
      new RefreshToken({ refreshToken: refreshToken }),
    );

    return result;
  }
}

@CommandHandler(RefreshToken)
export class RefreshTokenHandler implements ICommandHandler<RefreshToken> {
  private logger = new Logger(RefreshTokenHandler.name);
  constructor(
    private amqpConnection: AmqpConnection,
    private redisCacheService: RedisCacheService,
  ) {}

  async execute(command: RefreshToken): Promise<AuthDto> {
    try {
      const userId = await this.redisCacheService.getCache('userLogin');
      const existRedisRefresh = await this.redisCacheService.getCache(
        `refreshToken:${JSON.parse(userId)}`,
      );

      if (
        command.refreshToken !== JSON.parse(existRedisRefresh)?.token ||
        !userId
      ) {
        throw new BadRequestException(
          'The login session is expired. Please login again!',
        );
      }

      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.REFRESHTOKEN,
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
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    }
  }
}
