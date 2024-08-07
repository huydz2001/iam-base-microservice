import { EntityAuditBase } from 'building-blocks/databases/abstracts/entity_audit_base.abstract';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';
import { User } from '../../user/entities/user.entity';
@Entity({ name: 'groups' })
@Index('idx_group_name', ['name'])
export class Group extends EntityAuditBase<string> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  desc: string;

  @ManyToMany(() => Permission, (p) => p.groups)
  @JoinTable({
    name: 'groups_permissions',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, (u) => u.group, { nullable: true })
  users: User[];

  constructor(item: Partial<Group>) {
    super();
    Object.assign(this, item);
  }
}
