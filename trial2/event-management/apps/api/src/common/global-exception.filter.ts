import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@event-management/shared';

// TRACED:EM-MON-003 — GlobalExceptionFilter sanitizes errors, includes correlationId

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? '';

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
        statusCode: status,
        message,
        correlationId,
        path: request.url,
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
