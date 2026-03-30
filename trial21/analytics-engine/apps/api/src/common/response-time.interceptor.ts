import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response } from 'express';

/**
 * Interceptor that adds X-Response-Time header to all responses.
 * VERIFY: AE-MON-003 — response time tracking via interceptor
 */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - start;
        response.setHeader('X-Response-Time', `${duration}ms`); // TRACED: AE-MON-003 // TRACED: AE-MON-008
      }),
    );
  }
}
