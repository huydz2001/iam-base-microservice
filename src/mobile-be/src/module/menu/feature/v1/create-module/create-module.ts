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
import {
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { HttpContext } from 'building-blocks/context/context';
import {
  handleRpcError,
  ReponseDto,
} from 'building-blocks/utils/handle-error-rpc';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Response } from 'express';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';

// =================================== Caommand ==========================================
export class CreateModule {
  userLoginId: string;
  name: string;
  desc: string;
  parentId: string;
  typePermissions: number[];

  constructor(item: Partial<CreateModule> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class CreateModuleRequestDto {
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
  parentId: string;

  @ApiProperty()
  @IsOptional()
  typePermisisons: number[];

  constructor(item: Partial<CreateModuleRequestDto> = {}) {
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
export class CreateModuleController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  @AdminAuth()
  async createModule(
    @Body() request: CreateModuleRequestDto,
    @Res() res: Response,
  ): Promise<ModuleDto> {
    const { name, desc, parentId, typePermisisons } = request;

    const result = await this.commandBus.execute(
      new CreateModule({
        name: name,
        desc: desc,
        parentId: parentId,
        typePermissions: typePermisisons,
      }),
    );

    res.status(HttpStatus.CREATED).send(result);

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(CreateModule)
export class CreateModuleHandler implements ICommandHandler<CreateModule> {
  private logger = new Logger(CreateModuleHandler.name);
  constructor(private amqpConnection: AmqpConnection) {}

  async execute(command: CreateModule): Promise<ModuleDto> {
    try {
      const userId = HttpContext.request.user?.['id'];
      const resp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.MOBILE_BE.CREATE_MODULE,
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
