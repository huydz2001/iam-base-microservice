import { Controller, Get, Inject } from '@nestjs/common';
import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';

// =================================== Caommand ==========================================
export class GetModules {
  constructor(request: Partial<GetModules> = {}) {
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
export class GetModulesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('get')
  async getModules(): Promise<any[]> {
    const result = await this.queryBus.execute(new GetModules());

    return result;
  }
}

// =====================================Command Handler =================================================
@QueryHandler(GetModules)
export class GetModulesHandler implements ICommandHandler<GetModules> {
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  async execute(query: GetModules): Promise<any[]> {
    const modulesEntity = await this.moduleRepository.findModules();

    // if (usersEntity?.length == 0)
    //   return new PagedResult<UserDto[]>(null, total);

    return modulesEntity;
  }
}
