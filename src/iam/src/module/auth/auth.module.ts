import { Module } from '@nestjs/common';
import { AuthRepository } from '../../data/repositories/auth.repository';
import { ProfileRepository } from '../../data/repositories/profile.repository';
import { UserRepository } from '../../data/repositories/user.repository';
import {
  RefreshTokenController,
  RefreshTokenHandler,
} from './features/v1/refresh-token/refresh-token';
import { LoginController, LoginHandler } from './features/v1/login/login';
import { LogoutController, LogoutHandler } from './features/v1/logout/logout';
import { ValidateTokenHandler } from './features/v1/validate-token/validate-token';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Token } from './entities/token.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { Profile } from '../user/entities/profile.entity';
import { GenerateTokenHandler } from './features/v1/generate-token/generate-token';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, Token, Profile])],
  exports: [],
  providers: [
    ValidateTokenHandler,
    RefreshTokenHandler,
    LoginHandler,
    LogoutHandler,
    GenerateTokenHandler,
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
  controllers: [RefreshTokenController, LoginController, LogoutController],
})
export class AuthModule {}
