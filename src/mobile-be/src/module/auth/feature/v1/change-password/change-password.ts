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

export class ChangePassword {
  userId: string;
  oldPass: string;
  newPass: string;

  constructor(request: Partial<ChangePassword> = {}) {
    Object.assign(this, request);
  }
}

export class ChangePasswordRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  oldPass: string;

  @ApiProperty()
  @IsString()
  newPass: string;

  constructor(request: Partial<ChangePasswordRequestDto> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Identities')
@Controller({
  path: `/identity`,
  version: '1',
})
export class ChangePassController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('change-password')
  @Auth()
  @HttpCode(200)
  public async changePass(@Body() request: ChangePasswordRequestDto) {
    console.log(request);
    const result = await this.commandBus.execute(
      new ChangePasswordRequestDto(request),
    );

    return result;
  }
}

@Injectable()
@CommandHandler(ChangePasswordRequestDto)
export class ChangePassHandler
  implements ICommandHandler<ChangePasswordRequestDto>
{
  private logger = new Logger(ChangePassHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: ChangePasswordRequestDto) {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.CHANGE_PASS,
        payload: command,
        timeout: 10000,
      });

      this.logger.debug(resp);

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
