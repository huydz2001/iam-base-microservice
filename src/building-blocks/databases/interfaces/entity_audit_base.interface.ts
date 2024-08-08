import { IAuditable } from './audit_table.interface';
import { IEntityBase } from './entity_base.iterface';

export interface IEntityAuditBase<T> extends IEntityBase<T>, IAuditable {}
