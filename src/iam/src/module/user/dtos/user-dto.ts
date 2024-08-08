import { Permission } from 'src/module/permission/entities/permission.entity';
import { Role } from '../enums/role.enum';
import { Profile } from '../entities/profile.entity';
import { Group } from '../../../module/group/entities/group.entity';
import { Token } from '../../../module/auth/entities/token.entity';

export class UserDto {
  id: number;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  role: Role;
  permissions: Permission[];
  profile: Profile;
  groups: Group[];
  token: Token;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedBy: string;

  constructor(item: Partial<UserDto> = {}) {
    Object.assign(this, item);
  }
}
