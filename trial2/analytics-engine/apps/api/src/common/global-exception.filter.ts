import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { sanitizeLogContext } from '@analytics-engine/shared';
import { LoggerService } from '../infra/logger.service';
import { RequestContextService } from './request-context.service';

// TRACED:AE-MON-007 — GlobalExceptionFilter as APP_FILTER with sanitized errors
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
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

    const sanitizedBody = sanitizeLogContext(request.body);

    this.logger.error(
      JSON.stringify({
        message,
        status,
        path: request.url,
        body: sanitizedBody,
        correlationId: this.requestContext.correlationId,
      }),
      exception instanceof Error ? exception.stack : undefined,
      'GlobalExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      message,
      correlationId: this.requestContext.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
