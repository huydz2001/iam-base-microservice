import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';

// =================================== Caommand ==========================================
export class GetModules {
  page = 1;
  pageSize = 10;
  orderBy = 'id';
  order: 'ASC' | 'DESC' = 'ASC';
  searchTerm?: string = null;

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
  async getModules(
    @Query('pageSize') pageSize: number = 10,
    @Query('page') page: number = 1,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('orderBy') orderBy: string = 'id',
    @Query('searchTerm') searchTerm?: string,
  ): Promise<any[]> {
    const result = await this.queryBus.execute(
      new GetModules({
        page: page,
        pageSize: pageSize,
        searchTerm: searchTerm,
        order: order,
        orderBy: orderBy,
      }),
    );

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

  async execute(command: GetModules): Promise<any[]> {
    const [modulesEntity, total] = await this.moduleRepository.findModules(
      command.page,
      command.pageSize,
      command.orderBy,
      command.order,
      command.searchTerm,
    );

    // if (usersEntity?.length == 0)
    //   return new PagedResult<UserDto[]>(null, total);

    return modulesEntity;
  }
}
