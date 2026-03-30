// TRACED:FD-COMMON-003 — Correlation ID interceptor for request tracing
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CORRELATION_ID_HEADER, isValidCorrelationId } from '@repo/shared';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const headerValue = request.headers[CORRELATION_ID_HEADER] as string | undefined;
    const correlationId =
      headerValue && isValidCorrelationId(headerValue) ? headerValue : uuidv4();
    request.headers[CORRELATION_ID_HEADER] = correlationId;

    return next.handle().pipe(
      tap(() => {
        response.setHeader(CORRELATION_ID_HEADER, correlationId);
      }),
    );
  }
}
