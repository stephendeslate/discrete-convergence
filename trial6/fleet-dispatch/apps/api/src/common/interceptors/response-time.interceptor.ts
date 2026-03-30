// TRACED:FD-PERF-002 — response time interceptor as APP_INTERCEPTOR
import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performance } from 'perf_hooks';
import type { Response } from 'express';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const duration = performance.now() - start;
        response.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
        this.metrics.recordRequest(duration);
      }),
    );
  }
}
