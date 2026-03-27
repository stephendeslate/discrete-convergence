// TRACED: FD-MON-004 — CorrelationInterceptor reads X-Correlation-ID header
// TRACED: FD-MON-005 — Structured logging with correlation ID
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { CORRELATION_HEADER, generateCorrelationId } from '@fleet-dispatch/shared';
import pino from 'pino';

const logger = pino({ level: 'info' });

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId =
      (request.headers[CORRELATION_HEADER] as string) || generateCorrelationId();

    request.headers[CORRELATION_HEADER] = correlationId;

    logger.info({
      correlationId,
      method: request.method,
      url: request.url,
    });

    return next.handle().pipe(
      tap(() => {
        response.setHeader('X-Correlation-ID', correlationId);
      }),
    );
  }
}
