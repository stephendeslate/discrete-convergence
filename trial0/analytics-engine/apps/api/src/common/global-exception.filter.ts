// TRACED:AE-MON-001 — GlobalExceptionFilter as APP_FILTER with sanitized errors
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';
import { AppLogger } from './logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: AppLogger,
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

    const correlationId = this.requestContext.getCorrelationId();

    const sanitizedBody = sanitizeLogContext(request.body);
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      {
        correlationId,
        body: sanitizedBody,
        statusCode: status,
      },
    );

    // TRACED:AE-MON-002 — No stack traces in response, correlationId included
    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
