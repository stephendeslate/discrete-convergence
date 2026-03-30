// TRACED: EM-CROSS-002 — ResponseTimeInterceptor as APP_INTERCEPTOR with Date.now()
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
