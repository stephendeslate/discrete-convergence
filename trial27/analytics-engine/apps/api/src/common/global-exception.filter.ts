import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import pino from 'pino';
import { sanitizeLogValue } from '@analytics-engine/shared';

const logger = pino({ level: 'error' });

// TRACED: AE-SEC-007 — Global exception filter

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message as string ??
            exception.message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorMsg = exception instanceof Error ? exception.message : 'Unknown error';
      logger.error(
        {
          path: request.url,
          method: request.method,
          error: sanitizeLogValue(errorMsg),
        },
        'Unhandled exception',
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
