import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { sanitizeLogContext } from '@analytics-engine/shared';
import { LoggerService } from './logger.service';

// TRACED: AE-MON-005
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? '';

    const sanitizedBody = sanitizeLogContext(request.body);

    this.logger.error(
      `Exception: ${message}`,
      JSON.stringify({
        status,
        path: request.url,
        method: request.method,
        correlationId,
        body: sanitizedBody,
      }),
      'ExceptionFilter',
    );

    // Preserve validation pipe response format (array of messages)
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      response.status(status).json({
        ...(exceptionResponse as Record<string, unknown>),
        correlationId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
