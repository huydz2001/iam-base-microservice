import { NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';

export class HttpContext {
  static request: Request;
  static response: Response;
  static headers: IncomingHttpHeaders;
}

// Get request, response, headers
export class HttpContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: Error | any) => void) {
    HttpContext.request = req;

    HttpContext.response = res;

    HttpContext.headers = req.headers;

    next();
  }
}
