import {
  Body,
  ConflictException,
  Controller,
  Inject,
  NotFoundException,
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
import { HttpContext } from 'building-blocks/context/context';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
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
    const { name, desc, parentId } = request;

    const result = await this.commandBus.execute(
      new UpdateModule({
        id: id,
        name: name,
        desc: desc,
        parentId: parentId,
      }),
    );

    return result;
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
    const userId = HttpContext.request.user['id'].toString() ?? '99';

    let existModule = await this.moduleRepository.findById(id);
    if (!existModule) {
      throw new NotFoundException('Module not found!');
    }

    const moduleFilter = await this.moduleRepository.findByName(name);
    if (moduleFilter && moduleFilter.id !== id) {
      throw new ConflictException('Module has already exsit!');
    }

    existModule.name = name;
    existModule.desc = desc;
    existModule = this.configData.updateData(existModule, userId);

    let parentModule: Modules;

    if (parentId) {
      parentModule = await this.moduleRepository.findById(parentId);

      if (!parentModule) {
        throw new NotFoundException('Parent module not found');
      }
      existModule.parent = parentModule;
      this.moduleRepository.updateModule(existModule);
    } else {
      existModule.parentId = null;
      this.moduleRepository.updateModule(existModule);
    }

    const result = mapper.map<Modules, ModuleDto>(existModule, new ModuleDto());

    return result;
  }
}
