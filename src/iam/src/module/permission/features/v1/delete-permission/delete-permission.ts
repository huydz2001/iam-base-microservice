import {
  Controller,
  Delete,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuth } from '../../../../../common/decorator/auth.decorator';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { PermissionDto } from '../../../../../module/permission/dtos/permission.dto';

// ==================================================command====================================================
export class DeletePermission {
  id: string;

  constructor(request: Partial<DeletePermission> = {}) {
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
export class DeletePermissionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete('delete/:id')
  @AdminAuth()
  public async deletePermission(
    @Param('id') id: string,
  ): Promise<PermissionDto> {
    const result = await this.commandBus.execute(
      new DeletePermission({
        id: id,
      }),
    );

    return result;
  }
}

//===================================================== Command handdler============================================================================
@CommandHandler(DeletePermission)
export class DeletePermissionHandler
  implements ICommandHandler<DeletePermission>
{
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionReposiotry: IPermissionRepository,
  ) {}

  async execute(command: DeletePermission): Promise<string> {
    const { id } = command;

    const existPermission = await this.permissionReposiotry.findById(id);
    console.log(existPermission);
    if (!existPermission) {
      throw new NotFoundException('Permission not found!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const permission =
      await this.permissionReposiotry.removePermision(existPermission);

    return id;
  }
}
