import {
  Controller,
  Delete,
  Inject,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import Joi from 'joi';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { GroupDto } from '../../../../../module/group/dtos/group-dto';
import { Group } from '../../../../../module/group/entities/group.entity';
import { UserDto } from '../../../../../module/user/dtos/user-dto';
import mapper from '../../../mapping';

export class DeleteGroupById {
  id: string;

  constructor(request: Partial<DeleteGroupById> = {}) {
    Object.assign(this, request);
  }
}

const deleteGroupValidations = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

@ApiBearerAuth()
@ApiTags('Groups')
@Controller({
  path: `/group`,
  version: '1',
})
export class DeleteGroupByIdController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('delete')
  @AdminAuth()
  public async deleteUserById(@Query('id') id: string): Promise<UserDto> {
    const group = await this.commandBus.execute(
      new DeleteGroupById({
        id: id,
      }),
    );

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }
}

@CommandHandler(DeleteGroupById)
export class DeleteGroupByIdHandler
  implements ICommandHandler<DeleteGroupById>
{
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
  ) {}

  async execute(command: DeleteGroupById): Promise<GroupDto> {
    await deleteGroupValidations.params.validateAsync(command);

    const user = await this.groupRepository.findGroupById(command.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const groupEntity = await this.groupRepository.removeGroup(user);

    const result = mapper.map<Group, GroupDto>(groupEntity, new GroupDto());

    return result;
  }
}
