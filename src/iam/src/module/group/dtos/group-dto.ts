import { User } from '../../../module/user/entities/user.entity';
import { Permission } from '../../../module/permission/entities/permission.entity';

export class GroupDto {
  id: string;
  name: string;
  desc: string;
  users: User[];
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedBy: string;

  constructor(item: Partial<GroupDto> = {}) {
    Object.assign(this, item);
  }
}
