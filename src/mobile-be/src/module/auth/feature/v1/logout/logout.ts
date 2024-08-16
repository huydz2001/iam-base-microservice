import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Body,
  Controller,
  HttpCode,
  Injectable,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { IsString } from 'class-validator';
import { Auth } from '../../../../../common/decorator/auth.decorator';
import { HttpContext } from 'building-blocks/context/context';

export class Logout {
  accessToken: string;

  constructor(request: Partial<Logout> = {}) {
    Object.assign(this, request);
  }
}

export class LogoutRequestDto {
  @ApiProperty()
  @IsString()
  accessToken: string;

  constructor(request: Partial<LogoutRequestDto> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Identities')
@Controller({
  path: `/identity`,
  version: '1',
})
export class LogoutController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('logout')
  @HttpCode(200)
  @Auth()
  public async logout(@Body() request: LogoutRequestDto) {
    const result = await this.commandBus.execute(new Logout(request));
    return result;
  }
}

@Injectable()
@CommandHandler(Logout)
export class LogoutHandler implements ICommandHandler<Logout> {
  private logger = new Logger(LogoutHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: Logout) {
    try {
      const userId = HttpContext.request.user?.['id'];
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.LOGOUT,
        payload: { ...command, userId: userId },
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
