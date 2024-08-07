import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Modules } from '../../module/menu/entities/module.entity';

export interface IModuleRepository {
  createModule(module: Modules): Promise<Modules>;

  findById(id: string): Promise<Modules>;

  findModules(
    page: number,
    pageSize: number,
    orderBy: string,
    order: 'ASC' | 'DESC',
    searchTerm?: string,
  ): Promise<[Modules[], number]>;

  updateModule(module: Modules): Promise<void>;

  removeModule(module: Modules): Promise<Modules>;
}

export class ModuleRepository implements IModuleRepository {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}

  async findModules(
    page: number,
    pageSize: number,
    orderBy: string,
    order: 'ASC' | 'DESC',
    searchTerm?: string,
  ): Promise<[Modules[], number]> {
    console.log(page);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const modules = await this.moduleRepository.find({
      where: {
        parentId: IsNull(),
      },
      select: {
        id: true,
        desc: true,
        name: true,
        parentId: true,
      },
    });

    await Promise.all(
      modules.map(async (item) => {
        item.subModules = await this.moduleRepository.find({
          where: { parentId: item.id },
          relations: {
            permisions: true,
          },
          select: {
            id: true,
            name: true,
            desc: true,
            parentId: true,
            permisions: {
              id: true,
              type: true,
              desc: true,
              moduleId: true,
            },
          },
        });
      }),
    );

    return [modules, modules.length];
  }

  async createModule(module: Modules): Promise<Modules> {
    return await this.moduleRepository.save(module);
  }

  async findById(id: string): Promise<Modules> {
    return await this.moduleRepository.findOne({
      where: { id: id, isDeleted: false },
    });
  }

  async updateModule(module: Modules): Promise<void> {
    await this.moduleRepository.update(module.id, module);
  }

  async removeModule(module: Modules): Promise<Modules> {
    return await this.moduleRepository.remove(module);
  }
}
