import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../module/permission/entities/permission.entity';

export interface IPermissionRepository {
  createPermission(permission: Permission): Promise<Permission>;

  updatePermission(permission: Permission): Promise<void>;

  removePermision(permission: Permission): Promise<Permission>;
}

export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async createPermission(permission: Permission): Promise<Permission> {
    return await this.permissionRepository.save(permission);
  }
  async updatePermission(permission: Permission): Promise<void> {
    await this.permissionRepository.update(permission.id, permission);
  }

  async removePermision(permission: Permission): Promise<Permission> {
    return await this.permissionRepository.remove(permission);
  }
}
