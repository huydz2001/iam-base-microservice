import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';

// =================================== Caommand ==========================================
export class GetModulesByUser {
  id: string;

  constructor(request: Partial<GetModulesByUser> = {}) {
    Object.assign(this, request);
  }
}

// ====================================== Controller ============================================
@ApiBearerAuth()
@ApiTags('Modules')
@Controller({
  path: `/module`,
  version: '1',
})
export class GetModulesByUserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('get-by-user')
  async getModules(@Query('id') id: string): Promise<any[]> {
    const result = await this.queryBus.execute(new GetModulesByUser({ id }));

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetModulesByUser)
export class GetModulesByUserHandler
  implements ICommandHandler<GetModulesByUser>
{
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(query: GetModulesByUser): Promise<any[]> {
    const { id } = query;
    let permissionIds = [];

    const groups = await this.groupRepository.findGroupsByUserId(id);

    if (groups.length > 0) {
      const groupIds = groups.map((item) => item.id);
      const permissions =
        await this.permissionRepository.findByGroupIds(groupIds);

      permissionIds = permissions.map((item) => item.id);
    }

    const permissionsUser = await this.permissionRepository.findByUserId(id);

    console.log(permissionsUser);

    if (permissionsUser.length > 0) {
      permissionsUser.map((item) => {
        permissionIds.push(item.id);
      });
    }

    permissionIds = [...new Set(permissionIds)];
    console.log(permissionIds);

    const modules = this.moduleRepository.findByPermissionsIds(permissionIds);

    return modules;
  }
}
