import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { Response } from 'express';
import { Role } from '../../../enums/role.enum';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';

export class CreateUser {
  email: string;
  password: string;
  name: string;
  permissionIds: string[];
  groupIds: string[];
  phone: string;
  role: Role;

  constructor(request: Partial<CreateUser> = {}) {
    Object.assign(this, request);
  }
}

export class CreateUserRequestDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  permissionIds: string[];

  @ApiProperty()
  groupIds: string[];

  constructor(request: Partial<CreateUserRequestDto> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: `/user`,
  version: '1',
})
export class CreateUserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  public async createUser(
    @Body() request: CreateUserRequestDto,
    @Res() res: Response,
  ): Promise<string> {
    const otp = await this.commandBus.execute(
      new CreateUser({
        email: request.email,
        phone: request.phone,
        permissionIds: request.permissionIds,
        groupIds: request.groupIds,
        password: request.password,
        name: request.name,
        role: request.role,
      }),
    );

    res.status(HttpStatus.CREATED).send({ otp: otp });

    return otp;
  }
}

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler<CreateUser> {
  private logger = new Logger(CreateUserHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}
  async execute(command: CreateUser): Promise<string> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.REGISTER,
        payload: command,
        timeout: 10000,
      });

      this.logger.debug(resp);

      if (resp?.data.message !== undefined) {
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
