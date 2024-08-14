import { EntityAuditBase } from 'building-blocks/databases/abstracts/entity_audit_base.abstract';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Group } from '../../../module/group/entities/group.entity';
import { User } from '../../../module/user/entities/user.entity';
import { Modules } from '../../menu/entities/module.entity';
import { TYPE_ACTION } from '../enums/type-action.enum';

@Entity({ name: 'permisions' })
@Index('idx_permission', ['moduleId'])
export class Permission extends EntityAuditBase<string> {
  @Column({
    type: 'enum',
    enum: TYPE_ACTION,
  })
  type: TYPE_ACTION;

  @Column()
  desc: string;

  @ManyToMany(() => Group, (g) => g.permissions, { onDelete: 'CASCADE' })
  groups: Group[];

  @ManyToMany(() => User, (u) => u.permissions)
  users: User[];

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

  constructor(item: Partial<Permission>) {
    super();
    Object.assign(this, item);
  }
}
