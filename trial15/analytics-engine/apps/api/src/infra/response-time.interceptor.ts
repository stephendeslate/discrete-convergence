import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performance } from 'perf_hooks';
import { Response } from 'express';

// TRACED: AE-PERF-001 — ResponseTimeInterceptor uses performance.now() from perf_hooks and sets X-Response-Time header

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    return next.handle().pipe(
      tap(() => {
        const duration = performance.now() - start;
        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
      }),
    );
  }
}
