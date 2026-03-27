// TRACED: FD-SEC-007 — Global exception filter with safe error responses
// TRACED: FD-MON-005 — Structured error logging with method, URL, status, stack trace, redacted values
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogValue } from '@fleet-dispatch/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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
        ? exception.getResponse()
        : 'Internal server error';

    const correlationId = request.headers['x-correlation-id'] as string | undefined;

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : String(sanitizeLogValue('error', exception)),
    );

    const body: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (correlationId) {
      body['correlationId'] = correlationId;
    }

    if (typeof message === 'string') {
      body['message'] = message;
    } else if (typeof message === 'object' && message !== null) {
      Object.assign(body, message);
    }

    response.status(status).json(body);
  }
}
