import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';

/**
 * Interceptor that adds X-Response-Time header to all responses.
 * Registered as APP_INTERCEPTOR in AppModule.
 * TRACED:FD-PERF-001
 */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = performance.now() - start;
        response.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
      }),
    );
  }
}
