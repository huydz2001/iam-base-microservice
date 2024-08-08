import { EntityAuditBase } from '../abstracts/entity_audit_base.abstract';
export declare class ConfigData {
    createData<T extends EntityAuditBase<string>>(entity: T, userId: string): T;
    updateData<T extends EntityAuditBase<string>>(entity: T, userId: string): T;
    deleteData<T extends EntityAuditBase<string>>(entity: T, userId: string): T;
}
