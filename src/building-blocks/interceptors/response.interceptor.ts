import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        if (data?.stream) {
          return data;
        }
        return {
          success: true,
          code: context.switchToHttp().getResponse().statusCode,
          message: data?.messageResp || 'ok',
          data: data ?? null
        };
      })
    );
  }
}
