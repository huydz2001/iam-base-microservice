import {
  BadRequestException,
  CallHandler,
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
        let ip: string | string[];

        if (request && request.headers && request.headers['x-forwarded-for']) {
          ip = request.headers['x-forwarded-for'];
        } else {
          ip = request.ip;
        }

        if (Array.isArray(ip)) {
          ip = ip.join(' ');
        }

        let status: number;
        let message: string;
        const errRespData = error?.response?.data;

        if (errRespData) {
          message =
            errRespData?.errors?.[0]?.message ||
            errRespData?.message ||
            'Lỗi hệ thống, vui lòng thử lại.';
          status = errRespData?.status || HttpStatus.BAD_REQUEST;
        } else {
          message =
            error?.response?.message === 'Bad Request' ||
            error?.response?.message === 'Internal Server Error'
              ? 'Lỗi hệ thống, vui lòng thử lại.'
              : error?.response?.message === 'Unauthorized'
                ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.'
                : error?.response?.message || error?.message;
          status =
            error?.status ||
            error?.response?.status ||
            error?.response?.statusCode ||
            HttpStatus.INTERNAL_SERVER_ERROR;
        }

        this.logger.error(`${method} ${url} ${status} - ${ip} +${delay}ms`, {
          message
        });
        this.loggerService.logError(error, `${method} ${url} ${status} - ${ip} +${delay}ms`);

        switch (status) {
          case HttpStatus.BAD_REQUEST:
            return throwError(() => new BadRequestException(message));
          case HttpStatus.UNAUTHORIZED:
            return throwError(() => new UnauthorizedException(message));
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
