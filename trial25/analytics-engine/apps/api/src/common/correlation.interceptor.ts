// TRACED:CORR-INT — Correlation ID interceptor
// TRACED:MON-CORRELATION-ID — adds x-correlation-id to request/response (VERIFY:MON-CORRELATION-ID)
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { createCorrelationId } from '@repo/shared';

/**
 * Interceptor that adds correlation IDs to requests and responses.
 * TRACED:AE-CORR-003 — Correlation interceptor
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId =
      (request.headers['x-correlation-id'] as string | undefined) ??
      createCorrelationId();

    request.headers['x-correlation-id'] = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    return next.handle().pipe(
      tap(() => {
        // Correlation ID already set on response headers
      }),
    );
  }
}
