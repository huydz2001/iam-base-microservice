import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Body,
  Controller,
  Injectable,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { IsString } from 'class-validator';
import { Auth } from '../../../../../common/decorator/auth.decorator';

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
  @Auth()
  public async logout(@Body() request: LogoutRequestDto) {
    // const result = await this.commandBus.execute(new Logout(request));

    // return result;

    return 'ok';
  }
}

@Injectable()
@CommandHandler(Logout)
export class LogoutHandler implements ICommandHandler<Logout> {
  private logger = new Logger(LogoutHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: Logout) {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.LOGOUT,
        payload: command,
        timeout: 10000,
      });

      if (resp?.data?.messageResp) {
        throw new BadRequestException(resp.data.messageResp);
      }

      return resp?.data ?? null;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
