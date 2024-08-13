import { Role } from '../enums/role.enum';

export class UserDto {
  id: string;
  email: string;
  name: string;
  phone: string;
  isEmailVerified: boolean;
  role: Role;
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
