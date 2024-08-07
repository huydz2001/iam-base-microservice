import { Module } from '@nestjs/common';
import { AuthRepository } from '../../data/repositories/auth.repository';
import { ProfileRepository } from '../../data/repositories/profile.repository';
import { UserRepository } from '../../data/repositories/user.repository';

@Module({
  imports: [],
  exports: [],
  providers: [
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IProfileRepository',
      useClass: ProfileRepository,
    },
  ],
})
export class AuthModule {}
