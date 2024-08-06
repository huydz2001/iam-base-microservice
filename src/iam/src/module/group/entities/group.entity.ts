import { Modules } from '../../menu/entities/module.entity';
import { User } from '../../user/entities/user.entity';
import { EntityAuditBase } from '../../../../../building-blocks/databases/abstracts/entity_audit_base.abstract';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity({ name: 'groups' })
export class Group extends EntityAuditBase<string> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc: string;

  @ManyToMany(() => Modules, (m) => m.groups)
  @JoinTable({
    name: 'groups_modules',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'module_id', referencedColumnName: 'id' },
  })
  modules: Modules[];

  @OneToMany(() => User, (u) => u.group, { nullable: true })
  users: User[];

  constructor(item: Partial<Group>) {
    super();
    Object.assign(this, item);
  }
}
