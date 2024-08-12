import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';

// =================================== Caommand ==========================================
export class GetModulesByGroup {
  id: string;

  constructor(request: Partial<GetModulesByGroup> = {}) {
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
export class GetModulesByGroupController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('get-by-group')
  async getModules(@Query('id') id: string): Promise<any[]> {
    const result = await this.queryBus.execute(new GetModulesByGroup({ id }));

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetModulesByGroup)
export class GetModulesByGroupHandler
  implements ICommandHandler<GetModulesByGroup>
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

  async execute(query: GetModulesByGroup): Promise<any[]> {
    const { id } = query;
    const permissions = await this.permissionRepository.findByGroupId(id);

    const permissionIds = permissions.map((item) => {
      return item.id;
    });
    const modules = this.moduleRepository.findByPermissionsIds(permissionIds);

    return modules;
  }
}
