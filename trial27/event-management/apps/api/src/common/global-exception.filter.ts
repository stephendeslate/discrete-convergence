// TRACED: EM-SEC-006 — Global exception filter with safe error responses
// TRACED: EM-EDGE-017 — Prevents stack trace leakage in production
// TRACED: EM-API-009 — All endpoints return consistent error format

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogValue } from '@event-management/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse;
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${sanitizeLogValue('error', exception instanceof Error ? exception.message : 'Unknown error')}`,
    );

    response.status(status).json({
      statusCode: status,
      ...(typeof message === 'object' ? message : { message }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
