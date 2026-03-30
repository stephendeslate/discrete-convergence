// TRACED:AE-MON-003 — GlobalExceptionFilter with correlation ID in response
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext, formatLogEntry } from '@analytics-engine/shared';
import { PinoLoggerService } from '../infra/pino-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = (request.headers['x-correlation-id'] as string) ?? 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message as string ?? exception.message;
    }

    const sanitizedBody = sanitizeLogContext(request.body);

    this.logger.error(
      formatLogEntry({
        level: 'error',
        message: `Exception: ${message}`,
        correlationId,
        method: request.method,
        url: request.url,
        statusCode: status,
        body: sanitizedBody,
      }),
    );

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
