import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Logger, Param, Put } from '@nestjs/common';
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
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { GroupDto } from '../../../dtos/group.dto';
import { TypePermissionCreateGroup } from '../../../enums/type-permission-create-group';

// =================================== Command ==========================================
export class UpdateGroup {
  id: string;
  name: string;
  desc: string;
  type: string;
  userIds: string[];
  permissionIds: string[];

  constructor(item: Partial<UpdateGroup> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class UpdateGroupRequestDto {
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

  constructor(item: Partial<UpdateGroupRequestDto> = {}) {
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
export class UpdateGroupController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('update/:id')
  @AdminAuth()
  async updateGroup(
    @Param('id') id: string,
    @Body() request: UpdateGroupRequestDto,
  ): Promise<GroupDto> {
    const { name, desc, userIds, permissionIds, type } = request;

    const result = await this.commandBus.execute(
      new UpdateGroup({
        id: id,
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
@CommandHandler(UpdateGroup)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroup> {
  private logger = new Logger(UpdateGroupHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: UpdateGroup): Promise<GroupDto> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.UPDATE_GROUP,
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
