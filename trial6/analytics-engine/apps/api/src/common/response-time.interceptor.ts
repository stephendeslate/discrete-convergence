// TRACED:AE-MON-005 — ResponseTimeInterceptor as APP_INTERCEPTOR with performance.now
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { performance } from 'perf_hooks';
import type { Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - start).toFixed(2);
        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
