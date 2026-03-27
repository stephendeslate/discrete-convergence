// TRACED: EM-MON-002 — Correlation ID interceptor for request tracing
// TRACED: EM-MON-003 — Structured logging with correlation ID
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { CORRELATION_HEADER, generateCorrelationId } from '@event-management/shared';
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
    response.setHeader(CORRELATION_HEADER, correlationId);

    logger.info({
      correlationId,
      method: request.method,
      url: request.url,
    });

    return next.handle();
  }
}
