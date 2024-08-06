import { Column, Entity } from 'typeorm';
import { IAuditable } from '../interfaces/audit_table.interface';
import { EntityBase } from './entity_base.abstract';

@Entity()
export abstract class EntityAuditBase<T extends string>
  extends EntityBase<T>
  implements IAuditable
{
  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'updated_by' })
  updatedBy: string;

  @Column({ name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ default: null, name: 'deleted_by' })
  deletedBy: string;
}
