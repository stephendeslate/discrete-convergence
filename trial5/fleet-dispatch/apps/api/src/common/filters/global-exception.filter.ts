// TRACED:FD-MON-008 — global exception filter as APP_FILTER with sanitized errors
import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { sanitizeLogContext } from '@fleet-dispatch/shared';
import { PinoLoggerService } from '../services/pino-logger.service';
import { MetricsService } from '../services/metrics.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly metrics: MetricsService,
  ) {}

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
      (request.headers['x-correlation-id'] as string | undefined) ?? '';

    this.metrics.recordError();
    this.logger.error('Request failed', {
      statusCode: status,
      method: request.method,
      url: request.url,
      correlationId,
      body: sanitizeLogContext(request.body) as Record<string, unknown>,
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
