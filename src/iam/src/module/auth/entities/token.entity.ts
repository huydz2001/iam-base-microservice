import { EntityBase } from '../../../../../building-blocks/databases/abstracts/entity_base.abstract';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TokenType } from '../enums/token-type.enum';

@Entity({ name: 'tokens' })
@Index('idx_loginToken_uId', ['userId'], { unique: true })
@Index('idx_loginToken_accessToken', ['accessToken'])
@Index('idx_loginToken_refreshToken', ['refreshToken'])
export class Token extends EntityBase<string> {
  @Column({ unique: true, name: 'user_id' })
  userId: string;

  @Column({ name: 'access_Token' })
  accessToken: string;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @Column()
  type: TokenType;

  @Column()
  expires: Date;

  @Column()
  blacklisted: boolean;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @OneToOne(() => User, (u) => u.token, { onDelete: 'CASCADE' })
  user: User;

  constructor(item: Partial<Token>) {
    super();
    Object.assign(this, item);
    this.createdAt = item?.createdAt ?? new Date();
  }
}
