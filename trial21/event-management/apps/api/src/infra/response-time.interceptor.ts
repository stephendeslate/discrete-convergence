import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import pino from 'pino';

const logger = pino({ name: 'response-time' });

/** TRACED:EM-MON-003 — ResponseTimeInterceptor as APP_INTERCEPTOR */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        response.setHeader('X-Response-Time', `${duration}ms`);
        logger.info({
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
          duration,
        });
      }),
    );
  }
}
