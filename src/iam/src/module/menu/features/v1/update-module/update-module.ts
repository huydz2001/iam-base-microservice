import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Put,
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
export class UpdateModule {
  id: string;
  name: string;
  desc: string;
  parentId: string;

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
  @IsString()
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
  async createModule(
    @Param('id') id: string,
    @Body() request: UpdateModuleRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const { name, desc, parentId } = request;

    await this.commandBus.execute(
      new UpdateModule({
        id: id,
        name: name,
        desc: desc,
        parentId: parentId,
      }),
    );

    res.status(HttpStatus.NO_CONTENT).send(null);
  }
}

// =====================================Command Handler =================================================
@CommandHandler(UpdateModule)
export class UpdateModuleHandler implements ICommandHandler<UpdateModule> {
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: UpdateModule): Promise<ModuleDto> {
    const { id, name, parentId, desc } = command;
    const userId = HttpContext.headers['userId'].toString();

    const existModule = await this.moduleRepository.findById(id);
    if (!existModule) {
      throw new NotFoundException('Module not found!');
    }

    const existParentModule = await this.moduleRepository.findById(
      existModule.parentId,
    );

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
      parentModule.subModules.push(module);
      existParentModule.subModules = existParentModule.subModules.filter(
        (item) => item.id !== id,
      );
      Promise.all([
        await this.moduleRepository.updateModule(module),
        await this.moduleRepository.updateModule(parentModule),
        await this.moduleRepository.updateModule(existParentModule),
      ]);
    } else {
      module = this.configData.updateData(module, userId);
      module.parentId = null;
      existParentModule.subModules = existParentModule.subModules.filter(
        (item) => item.id !== id,
      );
      this.moduleRepository.updateModule(module);
    }

    const result = mapper.map<Modules, ModuleDto>(module, new ModuleDto());

    return result;
  }
}
