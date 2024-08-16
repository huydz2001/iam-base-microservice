import { ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisCacheService } from '../redis/redis-cache.service';
import { CheckJwtHandler } from './../../mobile-be/src/module/auth/feature/v1/check-jwt/check-jwt';

export class JwtDto {
  accessToken: string;

  constructor(item: Partial<JwtDto>) {
    Object.assign(this, item);
  }
}

@Injectable()
export class AdminThirtyGuard extends AuthGuard('jwt') {
  private logger = new Logger(AdminThirtyGuard.name);
  constructor(
    private readonly redisCacheService: RedisCacheService,
    private readonly checkJwtHandler: CheckJwtHandler
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers?.['authorization'];
    if (authorization) {
      const token = authorization.split(' ')[1];
      try {
        const resp = await this.checkJwtHandler.checkAdminGuard({ accessToken: token });

        if (!resp) {
          throw new ForbiddenException('Access denied');
        }
        return super.canActivate(context) as Promise<boolean>;
      } catch (err) {
        this.logger.error(err);
        throw err;
      }
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new ForbiddenException('Access denied');
    }
    return user;
  }
}
