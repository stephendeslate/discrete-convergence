// TRACED:EM-PERF-002 — ResponseTimeInterceptor as APP_INTERCEPTOR using perf_hooks
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performance } from 'perf_hooks';
import type { Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap(() => {
        const duration = (performance.now() - start).toFixed(2);
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
