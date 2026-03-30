import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
// TRACED:AE-MON-003 — GlobalExceptionFilter sanitizes via sanitizeLogContext from shared
import { sanitizeLogContext } from '@analytics-engine/shared';
import { PinoLoggerService } from '../monitoring/pino-logger.service';
import { RequestContextService } from '../monitoring/request-context.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
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

    const correlationId = this.requestContext.correlationId;

    this.logger.error('Unhandled exception', {
      status,
      method: request.method,
      url: request.url,
      body: sanitizeLogContext(request.body),
      correlationId,
      error: exception instanceof Error ? exception.message : String(exception),
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
