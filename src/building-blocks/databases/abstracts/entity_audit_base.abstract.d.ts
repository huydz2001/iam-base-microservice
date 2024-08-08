import { IAuditable } from '../interfaces/audit_table.interface';
import { EntityBase } from './entity_base.abstract';
export declare abstract class EntityAuditBase<T extends string> extends EntityBase<T> implements IAuditable {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isDeleted: boolean;
    deletedBy: string;
}
