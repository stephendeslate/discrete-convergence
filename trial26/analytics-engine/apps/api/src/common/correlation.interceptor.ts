import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { getCorrelationId, CORRELATION_HEADER } from '@analytics-engine/shared';
import pino from 'pino';

const logger = pino({ level: 'info' });

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const correlationId = getCorrelationId(req.headers[CORRELATION_HEADER] as string);
    res.setHeader('X-Correlation-ID', correlationId);

    logger.info({
      correlationId,
      method: req.method,
      url: req.url,
    }, 'Incoming request');

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        res.setHeader('X-Response-Time', `${elapsed}ms`);
      }),
    );
  }
}
