export class PermissonDto {
  id: string;
  type: number;
  desc: string;
}

export class SubmoduleDto {
  id: string;
  name: string;
  desc: string;
}

export class ModuleDto {
  id: string;
  name: string;
  desc: string;
  parentId: string;
  permissions: PermissonDto[];
  subModules: SubmoduleDto[];
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
