import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  NotFoundException,
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
import { HttpContext } from 'building-blocks/context/context';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Response } from 'express';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Modules } from '../../../../../module/menu/entities/module.entity';
import mapper from '../../../../../module/menu/mapping';

// =================================== Caommand ==========================================
export class CreateModule {
  name: string;
  desc: string;
  parentId: string;

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
  async createModule(
    @Body() request: CreateModuleRequestDto,
    @Res() res: Response,
  ): Promise<ModuleDto> {
    const { name, desc, parentId } = request;

    const result = await this.commandBus.execute(
      new CreateModule({
        name: name,
        desc: desc,
        parentId: parentId,
      }),
    );

    res.status(HttpStatus.CREATED).send(result);

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(CreateModule)
export class CreateModuleHandler implements ICommandHandler<CreateModule> {
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: CreateModule): Promise<ModuleDto> {
    const { name, parentId, desc } = command;
    const userId = HttpContext.headers['userId']?.toString() ?? '99';

    let parentModule: Modules;

    let module = new Modules({
      name: name,
      desc: desc,
      parentId: parentId,
    });

    if (parentId) {
      parentModule = await this.moduleRepository.findById(parentId);

      if (!parentModule) {
        throw new NotFoundException('Parent module not found');
      }

      module = this.configData.createData(module, userId);
      module.parent = parentModule;

      await this.moduleRepository.createModule(module);
    } else {
      module = this.configData.createData(module, userId);
      module.subModules = [];
      this.moduleRepository.createModule(module);
    }

    const result = mapper.map<Modules, ModuleDto>(module, new ModuleDto());

    return result;
  }
}
