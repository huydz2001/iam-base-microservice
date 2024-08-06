import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permision } from '../../module/permission/entities/permission.entity';

export interface IPermissionRepository {
  createPermission(permission: Permision): Promise<Permision>;

  updatePermission(permission: Permision): Promise<void>;

  removePermision(permission: Permision): Promise<Permision>;
}

export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permision)
    private readonly permissionRepository: Repository<Permision>,
  ) {}

  async createPermission(permission: Permision): Promise<Permision> {
    return await this.permissionRepository.save(permission);
  }
  async updatePermission(permission: Permision): Promise<void> {
    await this.permissionRepository.update(permission.id, permission);
  }

  async removePermision(permission: Permision): Promise<Permision> {
    return await this.permissionRepository.remove(permission);
  }
}
