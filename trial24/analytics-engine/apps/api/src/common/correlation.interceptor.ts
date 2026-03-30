// TRACED:CORRELATION — Adds X-Correlation-ID to requests and responses
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER, createCorrelationId } from '@repo/shared';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const correlationId =
      (req.headers[CORRELATION_ID_HEADER] as string | undefined) ??
      createCorrelationId();

    req.headers[CORRELATION_ID_HEADER] = correlationId;

    return next.handle().pipe(
      tap(() => {
        res.setHeader(CORRELATION_ID_HEADER, correlationId);
      }),
    );
  }
}
