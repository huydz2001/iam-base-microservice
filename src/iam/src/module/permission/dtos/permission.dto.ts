import { TYPE_ACTION } from '../enums/type-action.enum';

export class PermissionDto {
  id: string;
  type: TYPE_ACTION;
  desc: string;
  moduleId: string;
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
