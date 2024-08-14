import { Controller, Get, Inject } from '@nestjs/common';
import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { Auth } from '../../../../../common/decorator/auth.decorator';
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
  @Auth()
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetModules): Promise<any[]> {
    const modulesEntity = await this.moduleRepository.findModules();

    return modulesEntity;
  }
}
