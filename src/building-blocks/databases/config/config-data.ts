import { Injectable } from '@nestjs/common';
import { EntityAuditBase } from '../abstracts/entity_audit_base.abstract';

@Injectable()
export class ConfigData {
  createData<T extends EntityAuditBase<string>>(entity: T, userId: string) {
    entity.created_at = new Date();
    entity.modified_at = new Date();
    entity.deleted_by = null;
    entity.created_by = userId;
    entity.updated_by = userId;
    entity.is_deleted = false;
    return entity;
  }

  updateData<T extends EntityAuditBase<string>>(entity: T, userId: string) {
    entity.modified_at = new Date();
    entity.updated_by = userId;
    return entity;
  }

  deleteData<T extends EntityAuditBase<string>>(entity: T, userId: string) {
    entity.is_deleted = true;
    entity.deleted_by = userId;
    entity.modified_at = new Date();
    return entity;
  }
}
