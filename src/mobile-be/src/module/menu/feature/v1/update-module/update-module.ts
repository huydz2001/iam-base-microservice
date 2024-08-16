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
import {
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString, isUUID, MaxLength } from 'class-validator';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { HttpContext } from 'building-blocks/context/context';

// =================================== Caommand ==========================================
export class UpdateModule {
  id: string;
  name: string;
  desc: string;
  parentId: string;
  typePermisisons: number[];

  constructor(item: Partial<UpdateModule> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class UpdateModuleRequestDto {
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
  typePermisisons: number[];

  @ApiProperty()
  parentId: string;

  constructor(item: Partial<UpdateModuleRequestDto> = {}) {
    Object.assign(this, item);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Modules')
@Controller({
  path: `/module`,
  version: '1',
})
export class UpdateModuleController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('update/:id')
  @AdminAuth()
  async updateModule(
    @Param('id') id: string,
    @Body() request: UpdateModuleRequestDto,
  ): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Id must be UUID');
    }

    const { name, desc, parentId, typePermisisons } = request;

    const result = await this.commandBus.execute(
      new UpdateModule({
        id: id,
        name: name,
        desc: desc,
        parentId: parentId,
        typePermisisons: typePermisisons,
      }),
    );

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(UpdateModule)
export class UpdateModuleHandler implements ICommandHandler<UpdateModule> {
  private logger = new Logger(UpdateModuleHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: UpdateModule): Promise<ModuleDto> {
    try {
      const userId = HttpContext.request.user?.['id'];

      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.UPDATE_MODULE,
        payload: { ...command, userIdLogin: userId },
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
