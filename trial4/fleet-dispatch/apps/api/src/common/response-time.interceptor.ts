// TRACED:FD-PRF-001 — ResponseTimeInterceptor adds X-Response-Time header
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = (performance.now() - start).toFixed(2);
        if (response && typeof response.setHeader === 'function') {
          response.setHeader('X-Response-Time', `${duration}ms`);
        }
      }),
    );
  }
}
