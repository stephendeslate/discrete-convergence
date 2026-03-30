import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@fleet-dispatch/shared';
import { PinoLoggerService } from '../services/pino-logger.service';

// TRACED:FD-MON-005 — GlobalExceptionFilter as APP_FILTER with sanitized errors
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

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

    const correlationId = (request.headers['x-correlation-id'] as string) ?? '';

    this.logger.error('Request failed', {
      statusCode: status,
      path: request.url,
      method: request.method,
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
