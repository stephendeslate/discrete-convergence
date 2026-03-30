// TRACED:RESP-TIME — Response time interceptor
// TRACED:MON-RESPONSE-TIME — sets x-response-time header on every response (VERIFY:MON-RESPONSE-TIME)
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response } from 'express';

/**
 * Interceptor that measures and logs response time.
 * TRACED:AE-PERF-001 — Response time interceptor
 */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseTimeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        response.setHeader('x-response-time', `${duration}ms`);
        if (duration > 1000) {
          this.logger.warn(`Slow response: ${duration}ms`);
        }
      }),
    );
  }
}
