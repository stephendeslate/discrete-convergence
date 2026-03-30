// TRACED:EM-MON-004 — GlobalExceptionFilter with sanitizeLogContext
import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import pino from 'pino';
import { sanitizeLogContext } from '@event-management/shared';
import { RequestContextService } from './request-context.service';

const logger = pino({ level: 'error' });

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly context: RequestContextService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    const sanitized = sanitizeLogContext({
      method: request.method,
      url: request.originalUrl,
      body: request.body as Record<string, unknown>,
      error: message,
    });

    logger.error({ ...sanitized, correlationId: this.context.correlationId, statusCode: status });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId: this.context.correlationId,
    });
  }
}
