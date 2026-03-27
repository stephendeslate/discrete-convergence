import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { generateCorrelationId, CORRELATION_HEADER } from '@analytics-engine/shared';
import pino from 'pino';

const logger = pino({ level: 'info' });

// TRACED: AE-MON-004 — Structured logging
// TRACED: AE-MON-005 — Correlation ID tracking

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const correlationId =
      (request.headers[CORRELATION_HEADER] as string) ??
      generateCorrelationId();

    response.setHeader(CORRELATION_HEADER, correlationId);

    logger.info({
      correlationId,
      method: request.method,
      url: request.url,
    });

    return next.handle();
  }
}
