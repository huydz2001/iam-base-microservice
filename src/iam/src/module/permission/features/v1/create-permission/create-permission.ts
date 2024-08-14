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
import { IsOptional } from 'class-validator';
import { Response } from 'express';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { PermissionDto } from '../../../../../module/permission/dtos/permission.dto';
import mapper from '../../../../../module/permission/mapping';
import { TYPE_ACTION } from '../../../../permission/enums/type-action.enum';
import { Permission } from '../../../entities/permission.entity';

// ==================================================command====================================================
export class CreatePermission {
  type: TYPE_ACTION;
  moduleId: string;
  desc: string;

  constructor(request: Partial<CreatePermission> = {}) {
    Object.assign(this, request);
  }
}

// =================================================requestDto==================================================
export class CreatePermissionRequestDto {
  @ApiProperty()
  type: TYPE_ACTION;

  @ApiPropertyOptional()
  @IsOptional()
  desc: string;

  @ApiProperty()
  moduleId: string;

  constructor(request: Partial<CreatePermissionRequestDto> = {}) {
    Object.assign(this, request);
  }
}

// ================================================Controller=====================================================
@ApiBearerAuth()
@ApiTags('Permissions')
@Controller({
  path: `/permission`,
  version: '1',
})
export class CreatePermissionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  @AdminAuth()
  public async createPermission(
    @Body() request: CreatePermissionRequestDto,
    @Res() res: Response,
  ): Promise<PermissionDto> {
    const { type, moduleId, desc } = request;

    const result = await this.commandBus.execute(
      new CreatePermission({
        type: type,
        desc: desc,
        moduleId: moduleId,
      }),
    );

    res.status(HttpStatus.CREATED).send(result);

    return result;
  }
}

//===================================================== Command handdler============================================================================
@CommandHandler(CreatePermission)
export class CreatePermissionHandler
  implements ICommandHandler<CreatePermission>
{
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionReposiotry: IPermissionRepository,
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: CreatePermission): Promise<PermissionDto> {
    const { moduleId, type, desc } = command;

    const module = await this.moduleRepository.findById(moduleId);
    if (!module) {
      throw new NotFoundException('Module not found!');
    }

    let permission = new Permission({
      type: type,
      moduleId: moduleId,
      desc: desc,
    });

    const userId = HttpContext.request?.user?.['id'];

    permission = this.configData.createData(permission, userId);
    permission.module = module;
    await this.permissionReposiotry.createPermission(permission);

    const result = mapper.map<Permission, PermissionDto>(
      permission,
      new PermissionDto(),
    );

    return result;
  }
}
