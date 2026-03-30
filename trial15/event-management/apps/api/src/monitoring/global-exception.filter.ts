// TRACED: EM-MON-005
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext, formatLogEntry } from '@event-management/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

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

    const correlationId = request.headers['x-correlation-id'] as string;

    const sanitizedBody = sanitizeLogContext(request.body);
    this.logger.error(
      formatLogEntry({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `${request.method} ${request.url} - ${status}`,
        correlationId,
        method: request.method,
        url: request.url,
        statusCode: status,
        error: message,
      }),
    );
    this.logger.debug(`Sanitized request body: ${JSON.stringify(sanitizedBody)}`);

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
