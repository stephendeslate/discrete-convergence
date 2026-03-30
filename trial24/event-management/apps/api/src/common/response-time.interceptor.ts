// TRACED:RESPONSE-TIME-INTERCEPTOR
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        res.setHeader('x-response-time', `${duration}ms`);
        this.logger.debug({ duration }, 'Request completed');
      }),
    );
  }
}
