import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class LoggerInterceptor implements NestInterceptor {
    private readonly loggerService;
    private logger;
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any>;
}
