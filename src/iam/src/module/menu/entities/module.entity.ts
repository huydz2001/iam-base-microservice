import { EntityAuditBase } from 'building-blocks/databases/abstracts/entity_audit_base.abstract';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

@Entity({ name: 'modules' })
export class Modules extends EntityAuditBase<string> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc: string;

  @OneToMany(() => Permission, (p) => p.module, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  permisions: Permission[];

  @JoinColumn({
    name: 'parent_id',
    referencedColumnName: 'id',
  })
  @ManyToOne(() => Modules, (module) => module.subModules, {
    onDelete: 'CASCADE',
  })
  parent: Modules;

  @OneToMany(() => Modules, (module) => module.parent)
  subModules: Modules[];

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
