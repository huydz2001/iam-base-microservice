import {
  Controller,
  Delete,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IsString } from 'class-validator';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Modules } from '../../../../../module/menu/entities/module.entity';
import mapper from '../../../../../module/menu/mapping';

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
  async deleteModule(@Param('id') id: string): Promise<void> {
    const result = await this.commandBus.execute(
      new DeleteModule({
        id: id,
      }),
    );

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(DeleteModule)
export class DeleteModuleHandler implements ICommandHandler<DeleteModule> {
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: DeleteModule): Promise<ModuleDto> {
    const { id } = command;

    const exsitModule = await this.moduleRepository.findById(id);

    if (!exsitModule) {
      throw new NotFoundException('Module not found');
    }

    const module = await this.moduleRepository.removeModule(exsitModule);
    module.id = id;

    const result = mapper.map<Modules, ModuleDto>(module, new ModuleDto());

    return result;
  }
}
