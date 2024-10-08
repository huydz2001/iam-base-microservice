import { Permission } from '../../../../../iam/src/module/permission/entities/permission.entity';
import { Modules } from '../../../../../iam/src/module/menu/entities/module.entity';

export class ModuleDto {
  id: string;
  name: string;
  desc: string;
  parentId: string;
  permissions: Permission[];
  subModules: Modules[];
  parent: Modules;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedBy: string;

  constructor(item: Partial<ModuleDto> = {}) {
    Object.assign(this, item);
  }
}
