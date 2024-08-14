import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import configs from '../configs/configs';
import jwt from 'jsonwebtoken';
import { Role } from '../constracts/identity-constract';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException(`You don't have permission`);
    }

    try {
      const payload = jwt.verify(token, configs.jwt.secret);
      request.user = payload;
      if (payload?.['role'] !== Role.ADMIN) {
        throw new UnauthorizedException('Access dined!');
      }

      return super.canActivate(context) as Promise<boolean>;
    } catch (error) {
      Logger.error(error.message);
      throw new UnauthorizedException(error.message);
    }
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
