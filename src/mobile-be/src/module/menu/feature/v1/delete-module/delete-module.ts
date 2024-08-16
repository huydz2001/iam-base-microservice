import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Delete, Logger, Param } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { IsString, IsUUID } from 'class-validator';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';

// =================================== Caommand ==========================================
export class DeleteModule {
  id: string;

  constructor(item: Partial<DeleteModule> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class DeleteModuleRequestDto {
  @ApiProperty()
  @IsString()
  id: string;

  constructor(item: Partial<DeleteModuleRequestDto> = {}) {
    Object.assign(this, item);
  }
}

export class DeleteModuleDto {
  @IsUUID()
  id: string;
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Modules')
@Controller({
  path: `/module`,
  version: '1',
})
export class DeleteModuleController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('delete/:id')
  @AdminAuth()
  async deleteModule(@Param('id') request: DeleteModuleDto): Promise<void> {
    const result = await this.commandBus.execute(
      new DeleteModule({
        id: request.id,
      }),
    );

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(DeleteModule)
export class DeleteModuleHandler implements ICommandHandler<DeleteModule> {
  private logger = new Logger(DeleteModuleHandler.name);
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async execute(command: DeleteModule): Promise<ModuleDto> {
    try {
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.DEL_MODULE,
        payload: { ...command },
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
