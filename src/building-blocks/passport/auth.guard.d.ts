import { ExecutionContext } from '@nestjs/common';
declare const AdminGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class AdminGuard extends AdminGuard_base {
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
    handleRequest(err: any, user: any): any;
}
export {};
