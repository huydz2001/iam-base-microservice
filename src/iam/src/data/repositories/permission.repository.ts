import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../../module/permission/entities/permission.entity';
import { TYPE_ACTION } from '../../module/permission/enums/type-action.enum';

export interface IPermissionRepository {
  createPermission(permission: Permission): Promise<Permission>;

  saveAllPermissions(permissions: Permission[]): Promise<Permission[]>;

  findByUserId(id: string): Promise<Permission[]>;

  findByModuleId(id: string): Promise<Permission[]>;

  findByGroupId(id: string): Promise<Permission[]>;

  findByTypesAndModuleId(
    types: number[],
    moduleId: string,
  ): Promise<Permission[]>;

  findByGroupIds(ids: string[]): Promise<Permission[]>;

  findByIds(ids: string[]): Promise<Permission[]>;

  findByTypeAndModuleId(
    moduleId: string,
    type: TYPE_ACTION,
  ): Promise<Permission>;

  findById(id: string): Promise<Permission>;

  findAll(): Promise<Permission[]>;

  findByType(type: TYPE_ACTION): Promise<Permission[]>;

  updatePermission(permission: Permission): Promise<void>;

  removePermision(permission: Permission): Promise<Permission>;
}

export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findByTypesAndModuleId(
    types: number[],
    moduleId: string,
  ): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: {
        type: In(types),
        moduleId: moduleId,
      },
      relations: {
        module: true,
      },
    });
  }

  async findByModuleId(id: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: {
        moduleId: id,
      },
    });
  }

  async saveAllPermissions(permissions: Permission[]): Promise<Permission[]> {
    return await this.permissionRepository.save(permissions);
  }

  async findByTypeAndModuleId(
    moduleId: string,
    type: TYPE_ACTION,
  ): Promise<Permission> {
    return await this.permissionRepository.findOne({
      where: {
        moduleId: moduleId,
        type: type,
      },
    });
  }

  async findById(id: string): Promise<Permission> {
    return await this.permissionRepository.findOne({ where: { id: id } });
  }

  async findByType(type: TYPE_ACTION): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: {
        isDeleted: false,
        type: type,
      },
      relations: {
        groups: true,
        users: true,
        module: true,
      },
    });
  }

  async findByGroupIds(ids: string[]): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: {
        groups: {
          id: In(ids),
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
