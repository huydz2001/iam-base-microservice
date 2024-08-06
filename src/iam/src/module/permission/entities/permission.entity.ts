import { TYPE_ACTION } from '../enums/type-action.enum';
import { Modules } from '../../menu/entities/module.entity';
import { EntityAuditBase } from 'building-blocks/databases/abstracts/entity_audit_base.abstract';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'permisions' })
@Index('idx_permission', ['moduleId'])
export class Permision extends EntityAuditBase<string> {
  @Column({
    type: 'enum',
    enum: TYPE_ACTION,
  })
  type: TYPE_ACTION;

  @Column()
  desc: string;

  @Column({
    name: 'module_id',
    nullable: true,
  })
  moduleId: string;

  @ManyToOne(() => Modules, (m) => m.permisions)
  @JoinColumn({
    name: 'module_id',
    referencedColumnName: 'id',
  })
  module: Modules;

  constructor(item: Partial<Permision>) {
    super();
    Object.assign(this, item);
  }
}
