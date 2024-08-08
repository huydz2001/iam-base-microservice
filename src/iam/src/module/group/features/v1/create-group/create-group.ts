import {
  Body,
  Controller,
  HttpStatus,
  Inject,
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
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import mapper from '../../../../../module/group/mapping';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { User } from '../../../../../module/user/entities/user.entity';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { TypePermissionCreateGroup } from '../../../../../module/group/enums/type-create-permission';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';

// =================================== Command ==========================================
export class CreateGroup {
  name: string;
  desc: string;
  type: string;
  userIds: string[];
  permissionIds: string[];

  constructor(item: Partial<CreateGroup> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class CreateGroupRequestDto {
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
  userIds: string[];

  @ApiProperty({ description: 'Type ' })
  @IsString()
  type: TypePermissionCreateGroup;

  @ApiProperty()
  @IsOptional()
  permissionIds: string[];

  constructor(item: Partial<CreateGroupRequestDto> = {}) {
    Object.assign(this, item);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Groups')
@Controller({
  path: `/group`,
  version: '1',
})
export class CreateGroupController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  @AdminAuth()
  async createModule(
    @Body() request: CreateGroupRequestDto,
    @Res() res: Response,
  ): Promise<ModuleDto> {
    const { name, desc, userIds, permissionIds, type } = request;

    const result = await this.commandBus.execute(
      new CreateGroup({
        name: name,
        desc: desc,
        type: type,
        userIds: userIds,
        permissionIds: permissionIds,
      }),
    );

    res.status(HttpStatus.CREATED).send(result);

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(CreateGroup)
export class CreateGroupHandler implements ICommandHandler<CreateGroup> {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: CreateGroup): Promise<GroupDto> {
    const { name, desc, userIds, permissionIds, type } = command;
    const userId = HttpContext.request.user?.['id'].toString() ?? '99';
    let users: User[] = [];
    let permissions: Permission[] = [];

    if (userIds.length > 0) {
      users = await this.userRepository.findUserByIds(userIds);
    }

    if (type === TypePermissionCreateGroup.ALL) {
      permissions = await this.permissionRepository.findAll();
    } else {
      if (permissionIds.length > 0) {
        permissions = await this.permissionRepository.findByIds(permissionIds);
      }
    }

    let group = new Group({
      name: name,
      desc: desc,
      users: users ?? [],
      permissions: permissions ?? [],
    });

    group = this.configData.createData(group, userId);

    await this.groupRepository.createGroup(group);

    const result = mapper.map<Group, GroupDto>(group, new GroupDto());

    return result;
  }
}
