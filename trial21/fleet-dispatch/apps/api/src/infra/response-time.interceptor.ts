import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import pino from 'pino';

const logger = pino({ name: 'response-time' });

/**
 * Records request response time in milliseconds.
 * TRACED: FD-MON-003
 */
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const res = context.switchToHttp().getResponse();
        res.setHeader('X-Response-Time', `${duration}ms`);
        logger.info(
          {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
          },
          'Request completed',
        );
      }),
    );
  }
}
