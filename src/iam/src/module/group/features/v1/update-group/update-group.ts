import {
  Body,
  ConflictException,
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
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import { TypePermissionCreateGroup } from '../../../../../module/group/enums/type-create-permission';
import mapper from '../../../../../module/group/mapping';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { User } from '../../../../../module/user/entities/user.entity';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';

// =================================== Command ==========================================
export class UpdateGroup {
  id: string;
  name: string;
  desc: string;
  type: string;
  userIds: string[];
  permissionIds: string[];

  constructor(item: Partial<UpdateGroup> = {}) {
    Object.assign(this, item);
  }
}

// ======================================Request Dto ================================================
export class UpdateGroupRequestDto {
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

  constructor(item: Partial<UpdateGroupRequestDto> = {}) {
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
export class UpdateGroupController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('update/:id')
  @AdminAuth()
  async createModule(
    @Param('id') id: string,
    @Body() request: UpdateGroupRequestDto,
    @Res() res: Response,
  ): Promise<ModuleDto> {
    const { name, desc, userIds, permissionIds, type } = request;

    const result = await this.commandBus.execute(
      new UpdateGroup({
        id: id,
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
@CommandHandler(UpdateGroup)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroup> {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: UpdateGroup): Promise<GroupDto> {
    const { id, name, desc, userIds, permissionIds, type } = command;
    const userId = HttpContext.request.user?.['id'].toString();
    let users: User[] = [];
    let permissions: Permission[] = [];

    let existGroup = await this.groupRepository.findGroupById(id);
    if (!existGroup) {
      throw new NotFoundException('Group not found!');
    }

    const existGroupName = await this.groupRepository.findGroupByName(name);
    if (existGroupName.id !== id) {
      throw new ConflictException('Group name has already exist');
    }

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

    existGroup.name = name;
    existGroup.desc = desc;
    existGroup.permissions = permissions ?? [];
    existGroup.users = users ?? [];

    existGroup = this.configData.updateData(existGroup, userId);

    await this.groupRepository.updateGroup(existGroup);

    const result = mapper.map<Group, GroupDto>(existGroup, new GroupDto());

    return result;
  }
}
