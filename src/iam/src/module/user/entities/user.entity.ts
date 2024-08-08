import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { EntityAuditBase } from '../../../../../building-blocks/databases/abstracts/entity_audit_base.abstract';
import { Permission } from '../../../module/permission/entities/permission.entity';
import { Token } from '../../auth/entities/token.entity';
import { Group } from '../../group/entities/group.entity';
import { Role } from '../enums/role.enum';
import { Profile } from './profile.entity';

@Entity({ name: 'users' })
@Index('idx_user_email', ['email'], { unique: true })
@Index('idx_user_phone', ['phone'], { unique: true })
export class User extends EntityAuditBase<string> {
  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ select: false, name: 'hash_pass' })
  hashPass: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: false, name: 'is_verify_email' })
  isEmailVerified: boolean;

  @ManyToMany(() => Permission, (p) => p.users)
  @JoinTable({
    name: 'users_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToOne(() => Profile, (p) => p.user)
  profile: Profile;

  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id',
  })
  @ManyToMany(() => Group, (g) => g.users, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  groups: Group[];

  @JoinColumn({
    name: 'login_token_id',
    referencedColumnName: 'id',
  })
  @OneToOne(() => Token, (t) => t.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  token: Token;

  constructor(item: Partial<User>) {
    super();
    Object.assign(this, item);
  }
}
