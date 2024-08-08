import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Modules } from '../../module/menu/entities/module.entity';

export interface IModuleRepository {
  createModule(module: Modules): Promise<Modules>;

  findById(id: string): Promise<Modules>;

  findByPermissionsIds(permisisonId: string[]): Promise<Modules[]>;

  findModules(): Promise<Modules[]>;

  updateModule(module: Modules): Promise<void>;

  removeModule(module: Modules): Promise<Modules>;
}

export class ModuleRepository implements IModuleRepository {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}

  async findByPermissionsIds(ids: string[]): Promise<Modules[]> {
    const modules = await this.moduleRepository.find({
      where: {
        parentId: IsNull(),
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    await Promise.all(
      modules.map(async (item) => {
        item.subModules = await this.moduleRepository.find({
          where: {
            parentId: item.id,
            permisions: {
              id: In(ids),
            },
          },
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

    return modules;
  }

  async findModules(): Promise<Modules[]> {
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

    return modules;
  }

  async createModule(module: Modules): Promise<Modules> {
    return await this.moduleRepository.save(module);
  }

  async findById(id: string): Promise<Modules> {
    return await this.moduleRepository.findOne({
      where: { id: id, isDeleted: false },
      relations: { permisions: true },
    });
  }

  async updateModule(module: Modules): Promise<void> {
    await this.moduleRepository.update(module.id, module);
  }

  async removeModule(module: Modules): Promise<Modules> {
    return await this.moduleRepository.remove(module);
  }
}
