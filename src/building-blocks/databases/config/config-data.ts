import { Injectable } from '@nestjs/common';
import { EntityAuditBase } from '../abstracts/entity_audit_base.abstract';

@Injectable()
export class ConfigData {
  createData<T extends EntityAuditBase<string>>(entity: T, userId: string) {
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    entity.deletedBy = null;
    entity.createdBy = userId;
    entity.updatedBy = userId;
    entity.isDeleted = false;
    return entity;
  }

  updateData<T extends EntityAuditBase<string>>(entity: T, userId: string) {
    entity.updatedAt = new Date();
    entity.updatedBy = userId;
    return entity;
  }

  deleteData<T extends EntityAuditBase<string>>(entity: T, userId: string) {
    entity.isDeleted = true;
    entity.deletedBy = userId;
    entity.updatedAt = new Date();
    return entity;
  }
}
