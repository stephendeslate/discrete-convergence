// TRACED:FD-COMMON-001 — Global HTTP exception filter
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER, sanitizeLogData, sanitizeString } from '@repo/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

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

    const correlationId = request.headers[CORRELATION_ID_HEADER] as
      | string
      | undefined;

    // TRACED:FD-COMMON-002 — Log error details for monitoring
    const sanitizedPath = sanitizeString(request.url);
    const logDetails = sanitizeLogData({
      method: request.method,
      url: sanitizedPath,
      status,
      message,
      correlationId: correlationId ?? '',
    });
    this.logger.error(
      `${logDetails.method} ${logDetails.url} ${logDetails.status} - ${logDetails.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    });
  }
}
