// TRACED:FD-MON-004 — Global exception filter as APP_FILTER with sanitized errors and correlationId
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import pino from 'pino';
import { sanitizeLogContext } from '@fleet-dispatch/shared';

const logger = pino({ level: 'error' });

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

    const correlationId = (response.getHeader('X-Correlation-ID') as string) ?? '';

    const sanitizedBody = sanitizeLogContext(request.body);
    logger.error({
      statusCode: status,
      path: request.url,
      method: request.method,
      body: sanitizedBody,
      correlationId,
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
