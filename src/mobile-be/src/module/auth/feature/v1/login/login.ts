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

export class Login {
  email: string;
  password: string;

  constructor(request: Partial<Login> = {}) {
    Object.assign(this, request);
  }
}

export class LoginRequestDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  constructor(request: Partial<LoginRequestDto> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Identities')
@Controller({
  path: `/identity`,
  version: '1',
})
export class LoginController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  public async login(@Body() request: LoginRequestDto) {
    const result = await this.commandBus.execute(new Login(request));

    return result;
  }
}

@Injectable()
@CommandHandler(Login)
export class LoginHandler implements ICommandHandler<Login> {
  private logger = new Logger(LoginHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: Login) {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.LOGIN,
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
