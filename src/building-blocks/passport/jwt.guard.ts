import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import configs from '../configs/configs';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers?.['authorization'];
    if (authorization) {
      const token = authorization.split(' ')[1];
      const payload: any = jwt.verify(token, configs.jwt.secret);

      if (!payload) {
        throw new UnauthorizedException('Access denied');
      }
      return super.canActivate(context) as Promise<boolean>;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
