import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { Auth } from '../../../../../common/decorator/auth.decorator';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import mapper from '../../../../../module/group/mapping';

// =================================== Command ==========================================
export class GetGroupById {
  id: string;

  constructor(item: Partial<GetGroupById> = {}) {
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
export class GetGroupByIdController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/:id')
  @Auth()
  async createModule(@Param('id') id: string): Promise<GroupDto> {
    const result = await this.commandBus.execute(
      new GetGroupById({
        id: id,
      }),
    );

    return result;
  }
}

// =====================================Command Handler =================================================
@CommandHandler(GetGroupById)
export class GetGroupByIdHandler implements ICommandHandler<GetGroupById> {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(command: GetGroupById): Promise<GroupDto> {
    const { id } = command;

    const group = await this.groupRepository.findGroupById(id);

    const result = mapper.map<Group, GroupDto>(group, new GroupDto());

    return result;
  }
}
