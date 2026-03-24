// TRACED:AE-PERF-002 — ResponseTimeInterceptor using performance.now() from perf_hooks
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';

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
