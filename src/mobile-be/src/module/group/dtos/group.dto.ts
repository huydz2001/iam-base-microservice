export class GroupDto {
  id: string;
  name: string;
  desc: string;
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
