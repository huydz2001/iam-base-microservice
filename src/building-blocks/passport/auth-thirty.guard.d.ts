import { ExecutionContext } from '@nestjs/common';
import { RedisCacheService } from '../redis/redis-cache.service';
import { CheckJwtHandler } from './../../mobile-be/src/module/auth/feature/v1/check-jwt/check-jwt';
export declare class JwtDto {
    accessToken: string;
    constructor(item: Partial<JwtDto>);
}
declare const AdminThirtyGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class AdminThirtyGuard extends AdminThirtyGuard_base {
    private readonly redisCacheService;
    private readonly checkJwtHandler;
    private logger;
    constructor(redisCacheService: RedisCacheService, checkJwtHandler: CheckJwtHandler);
    canActivate(context: ExecutionContext): Promise<boolean>;
    handleRequest(err: any, user: any): any;
}
export {};
