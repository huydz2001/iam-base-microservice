import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { LoggersService } from '../loggers/logger.service';
import { Request } from 'express';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');
  private readonly loggerService = new LoggersService();
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now: number = Date.now();

    return next.handle().pipe(
      catchError((error) => {
        const delay: number = Date.now() - now;
        let ip: string | string[] | undefined;

        if (request && request.headers && request.headers['x-forwarded-for']) {
          ip = request.headers['x-forwarded-for'];
        } else {
          ip = request.ip;
        }

        if (Array.isArray(ip)) {
          ip = ip.join(' ');
        }

        let message: string;

        if (Array.isArray(error.response.message)) {
          message = error.response.message[0];
        } else {
          message = error?.response?.message;
        }
        const status = error?.response?.statusCode;

        this.logger.error(`${method} ${url} ${status} - ${ip} +${delay}ms`, {
          message
        });
        this.loggerService.logError(error, `${method} ${url} ${status} - ${ip} +${delay}ms`);
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            return throwError(() => new BadRequestException(message));
          case HttpStatus.UNAUTHORIZED:
            return throwError(() => new UnauthorizedException(message));
          case HttpStatus.CONFLICT:
            return throwError(() => new ConflictException(message));
          case HttpStatus.FORBIDDEN:
            return throwError(() => new ForbiddenException(message));
          case HttpStatus.NOT_FOUND:
            return throwError(() => new NotFoundException(message));
          case HttpStatus.NOT_ACCEPTABLE:
            return throwError(() => new NotAcceptableException(message));
          case HttpStatus.INTERNAL_SERVER_ERROR:
            return throwError(() => new InternalServerErrorException(message));
          default:
            return throwError(() => new InternalServerErrorException(message));
        }
      })
    );
  }
}
