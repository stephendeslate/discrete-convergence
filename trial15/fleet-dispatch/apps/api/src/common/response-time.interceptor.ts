import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { performance } from 'perf_hooks';
import { Response } from 'express';

// TRACED: FD-PERF-002
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const setHeader = () => {
      const duration = (performance.now() - start).toFixed(2);
      const response = context.switchToHttp().getResponse<Response>();
      if (!response.headersSent) {
        response.setHeader('X-Response-Time', `${duration}ms`);
      }
    };
    return next.handle().pipe(
      tap(() => setHeader()),
      catchError((err) => {
        setHeader();
        throw err;
      }),
    );
  }
}
