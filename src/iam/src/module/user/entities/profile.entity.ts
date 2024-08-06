import { EntityAuditBase } from '../../../../../building-blocks/databases/abstracts/entity_audit_base.abstract';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profiles' })
@Index('idx_profile_userName', ['userName'], { unique: true })
export class Profile extends EntityAuditBase<string> {
  @Column({ nullable: true, name: 'user_name' })
  userName: string;

  @Column({ nullable: true, name: 'full_name' })
  fullName: string;

  @Column({ type: 'int', nullable: true })
  gender: number;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ nullable: true })
  image: string;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @OneToOne(() => User, (u) => u.profile, { onDelete: 'CASCADE' })
  user: User;

  constructor(item: Partial<Profile>) {
    super();
    Object.assign(this, item);
  }
}
