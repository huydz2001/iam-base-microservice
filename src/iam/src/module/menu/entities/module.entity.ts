import { Group } from '../../group/entities/group.entity';
import { Permision } from '../../permission/entities/permission.entity';
import { EntityAuditBase } from 'building-blocks/databases/abstracts/entity_audit_base.abstract';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'modules' })
export class Modules extends EntityAuditBase<string> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc: string;

  @OneToMany(() => Permision, (p) => p.module)
  permisions: Permision[];

  @ManyToOne(() => Modules, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'parent_id',
    referencedColumnName: 'id',
  })
  subModules: Modules[];

  @ManyToMany(() => Group, (g) => g.modules)
  groups: Group[];

  @Column({
    nullable: true,
    name: 'parent_id',
  })
  parentId: string;

  constructor(item: Partial<Modules>) {
    super();
    Object.assign(this, item);
  }
}
