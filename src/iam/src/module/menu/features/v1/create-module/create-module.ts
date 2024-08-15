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
import { TYPE_DESC } from '../../../../../module/permission/enums/type-action.enum';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Modules } from '../../../../../module/menu/entities/module.entity';
import mapper from '../../../../../module/menu/mapping';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { IPermissionRepository } from './../../../../../data/repositories/permission.repository';
import { DataSource, QueryRunner } from 'typeorm';

// =================================== Caommand ==========================================
export class CreateModule {
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
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateModule): Promise<ModuleDto> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const { name, parentId, desc, typePermissions } = command;
      const userId = HttpContext.request.user['id'].toString() ?? '99';

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

      const permisisons = [];
      if (typePermissions.length > 0) {
        typePermissions.forEach((item) => {
          let permission = new Permission({
            type: item,
            moduleId: module.id,
            desc: TYPE_DESC[`${item}`],
          });
          permission = this.configData.createData(permission, userId);
          permission.module = module;
          permisisons.push(permisisons);
        });
      }

      await this.permissionRepository.saveAllPermissions(permisisons);

      const result = mapper.map<Modules, ModuleDto>(module, new ModuleDto());

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw err;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
