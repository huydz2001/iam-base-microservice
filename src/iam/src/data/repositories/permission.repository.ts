import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../module/permission/entities/permission.entity';

export interface IPermissionRepository {
  createPermission(permission: Permission): Promise<Permission>;

  findByUserId(id: string): Promise<Permission[]>;

  findByGroupId(id: string): Promise<Permission[]>;

  findByIds(ids: string[]): Promise<Permission[]>;

  findAll(): Promise<Permission[]>;

  updatePermission(permission: Permission): Promise<void>;

  removePermision(permission: Permission): Promise<Permission>;
}

export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findByUserId(id: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: {
        users: {
          id: id,
        },
        isDeleted: false,
      },
      relations: {
        users: true,
      },
      select: {
        id: true,
        users: {
          id: true,
        },
      },
    });
  }

  async findByGroupId(id: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: {
        groups: {
          id: id,
        },
        isDeleted: false,
      },
      relations: {
        groups: true,
      },
      select: {
        id: true,
        moduleId: true,
      },
    });
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { isDeleted: false },
      relations: { groups: true, users: true, module: true },
    });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { id: In(ids) },
      relations: {
        groups: true,
        users: true,
        module: true,
      },
    });
  }

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
