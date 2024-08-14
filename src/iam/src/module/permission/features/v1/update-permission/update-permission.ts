import {
  Body,
  Controller,
  Inject,
  NotFoundException,
  Param,
  Post,
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
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { PermissionDto } from '../../../../../module/permission/dtos/permission.dto';
import mapper from '../../../../../module/permission/mapping';
import { TYPE_ACTION } from '../../../../permission/enums/type-action.enum';
import { Permission } from '../../../entities/permission.entity';

// ==================================================command====================================================
export class UpdatePermission {
  type: TYPE_ACTION;
  moduleId: string;
  desc: string;

  constructor(request: Partial<UpdatePermission> = {}) {
    Object.assign(this, request);
  }
}

// =================================================requestDto==================================================
export class UdpatePermissionRequestDto {
  @ApiProperty()
  type: TYPE_ACTION;

  @ApiPropertyOptional()
  @IsOptional()
  desc: string;

  @ApiProperty()
  moduleId: string;

  constructor(request: Partial<UdpatePermissionRequestDto> = {}) {
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
export class UpdatePermissionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('update/:id')
  @AdminAuth()
  public async updatePermission(
    @Param('id') id: string,
    @Body() request: UdpatePermissionRequestDto,
  ): Promise<PermissionDto> {
    const { type, moduleId, desc } = request;

    const result = await this.commandBus.execute(
      new UpdatePermission({
        type: type,
        desc: desc,
        moduleId: moduleId,
      }),
    );

    return result;
  }
}

//===================================================== Command handdler============================================================================
@CommandHandler(UpdatePermission)
export class UpdatePermissionHandler
  implements ICommandHandler<UpdatePermission>
{
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionReposiotry: IPermissionRepository,
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: UpdatePermission): Promise<PermissionDto> {
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

    // await this.rabbitmqPublisher.publishMessage(
    //   new PermissionCreated(permission),
    // );

    const result = mapper.map<Permission, PermissionDto>(
      permission,
      new PermissionDto(),
    );

    return result;
  }
}
