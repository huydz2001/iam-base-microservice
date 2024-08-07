import { Modules } from '../../../module/menu/entities/module.entity';
import { TYPE_ACTION } from '../enums/type-action.enum';

export class PermissionDto {
  type: TYPE_ACTION;
  desc: string;
  moduleId: string;
  module: Modules;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedBy: string;

  constructor(item: Partial<PermissionDto> = {}) {
    Object.assign(this, item);
  }
}
