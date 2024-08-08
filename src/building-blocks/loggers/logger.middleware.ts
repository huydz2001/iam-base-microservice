import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggersService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new LoggersService();
  constructor() {}
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const { statusCode } = res;
      if (statusCode < 400) {
        this.logger.logRequestInfo({
          method,
          originalUrl,
          ip,
          statusCode,
          delay: responseTime
        });
      }
    });

    next();
  }
}
