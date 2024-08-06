import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
export declare class HttpContext {
    static request: Request;
    static response: Response;
    static headers: IncomingHttpHeaders;
}
export declare class HttpContextMiddleware implements NestMiddleware {
    use(req: any, res: any, next: (error?: Error | any) => void): void;
}
