import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { GroupDto } from '../../../../../module/group/dtos/group.dto';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { TypePermissionCreateGroup } from '../../../enums/type-permission-create-group';

// =================================== Command ==========================================
export class CreateGroup {
  name: string;
  desc: string;
  type: string;
  userIds: string[];
  permissionIds: string[];

  constructor(item: Partial<CreateGroup> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class CreateGroupRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  desc: string;

  @ApiProperty()
  @IsOptional()
  userIds: string[];

  @ApiProperty({ description: 'Type ' })
  @IsString()
  type: TypePermissionCreateGroup;

  @ApiProperty()
  @IsOptional()
  permissionIds: string[];

  constructor(item: Partial<CreateGroupRequestDto> = {}) {
    Object.assign(this, item);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Groups')
@Controller({
  path: `/group`,
  version: '1',
})
export class CreateGroupController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  @AdminAuth()
  async createModule(
    @Body() request: CreateGroupRequestDto,
  ): Promise<GroupDto> {
    const { name, desc, userIds, permissionIds, type } = request;

    const result = await this.commandBus.execute(
      new CreateGroup({
        name: name,
        desc: desc,
        type: type,
        userIds: userIds,
        permissionIds: permissionIds,
      }),
    );

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(CreateGroup)
export class CreateGroupHandler implements ICommandHandler<CreateGroup> {
  private logger = new Logger(CreateGroupHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: CreateGroup): Promise<GroupDto> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.CREATE_GROUP,
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
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}
