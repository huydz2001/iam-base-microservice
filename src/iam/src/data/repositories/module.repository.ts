import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from '../../module/menu/entities/module.entity';
import { Repository } from 'typeorm';

export interface IModuleRepository {
  createModule(module: Modules): Promise<Modules>;

  findById(id: string): Promise<Modules>;

  updateModule(module: Modules): Promise<void>;

  removeModule(module: Modules): Promise<Modules>;
}

export class ModuleRepository implements IModuleRepository {
  constructor(
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
  ) {}

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
