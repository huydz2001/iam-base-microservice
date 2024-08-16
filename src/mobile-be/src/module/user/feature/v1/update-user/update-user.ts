import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { HttpContext } from 'building-blocks/context/context';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { isUUID } from 'class-validator';
import { Auth } from '../../../../../common/decorator/auth.decorator';
import { Role } from '../../../enums/role.enum';

export class UpdateUser {
  userId: string;
  name: string;
  permissionIds: string[];
  groupIds: string[];
  role: Role;

  constructor(request: Partial<UpdateUser> = {}) {
    Object.assign(this, request);
  }
}

export class UpdateUserRequestDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  permissionIds: string[];

  @ApiProperty()
  groupIds: string[];

  constructor(request: Partial<UpdateUserRequestDto> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: `/user`,
  version: '1',
})
export class UpdateUserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('update/:id')
  @Auth()
  public async createUser(
    @Param('id') id: string,
    @Body() request: UpdateUserRequestDto,
  ): Promise<string> {
    if (!isUUID(id)) {
      throw new BadRequestException('Id must be UUID');
    }

    const resp = await this.commandBus.execute(
      new UpdateUser({
        userId: id,
        permissionIds: request.permissionIds,
        groupIds: request.groupIds,
        name: request.name,
        role: request.role,
      }),
    );

    return resp;
  }
}

@CommandHandler(UpdateUser)
export class UpdateUserHandler implements ICommandHandler<UpdateUser> {
  private logger = new Logger(UpdateUserHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}
  async execute(command: UpdateUser): Promise<string> {
    try {
      const userLoginId = HttpContext.request.user?.['id'];
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.UPDATE,
        payload: { ...command, userLoginId: userLoginId },
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
