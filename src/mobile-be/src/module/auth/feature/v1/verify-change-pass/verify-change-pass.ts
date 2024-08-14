import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { IsNotEmpty, IsString } from 'class-validator';
import { Auth } from '../../../../../common/decorator/auth.decorator';

export class VerifyOtp {
  otp: string;
  userId: string;

  constructor(request: Partial<VerifyOtp> = {}) {
    Object.assign(this, request);
  }
}

export class VerifyOtpChangePassRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: `/identity`,
  version: '1',
})
export class VerifyOtpChangePassController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('verify-otp-change-pass')
  @Auth()
  public async createUser(
    @Body() request: VerifyOtpChangePassRequestDto,
  ): Promise<any> {
    const result = await this.commandBus.execute(new VerifyOtp(request));

    return result;
  }
}

@CommandHandler(VerifyOtp)
export class VerifyOtpChangePassHandler implements ICommandHandler<VerifyOtp> {
  private logger = new Logger(VerifyOtpChangePassHandler.name);
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly redisCacheService: RedisCacheService,
  ) {}
  async execute(command: VerifyOtp): Promise<any> {
    const data = await this.redisCacheService.getCache(
      `otp-change-pass:${command.userId}`,
    );

    if (data) {
      const result = JSON.parse(data);
      const { otp, ...dataChangePass } = result;

      if (otp !== command.otp) {
        throw new BadRequestException('Otp is not correct');
      }

      try {
        const resp = await this.amqpConnection.request<any>({
          exchange: configs.rabbitmq.exchange,
          routingKey: RoutingKey.MOBILE_BE.VERIFY_OTP_CHANGE_PASS,
          payload: dataChangePass,
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
    } else {
      throw new BadRequestException('Otp has been expired');
    }
  }
}
