import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { sanitizeLogContext, createCorrelationId } from '@fleet-dispatch/shared';
import { performance } from 'perf_hooks';
import pino from 'pino';

const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'info' });

// TRACED: FD-MON-004
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? createCorrelationId();

    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error({
      message: `Exception: ${message}`,
      statusCode: status,
      correlationId,
      path: request.url,
      method: request.method,
      body: sanitizedBody,
    });

    const startTime = (request as unknown as { __startTime?: number }).__startTime;
    if (typeof startTime === 'number') {
      const duration = (performance.now() - startTime).toFixed(2);
      response.setHeader('X-Response-Time', `${duration}ms`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
