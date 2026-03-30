import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@analytics-engine/shared';
import pino from 'pino';

const logger = pino({ level: 'error' });

// TRACED: AE-SEC-004
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
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

    const correlationId = request.headers['x-correlation-id'] as string;

    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error(
      {
        correlationId,
        statusCode: status,
        path: request.url,
        method: request.method,
        body: sanitizedBody,
      },
      exception instanceof Error ? exception.message : 'Unknown error',
    );

    const responseBody = typeof message === 'string'
      ? { statusCode: status, message, correlationId }
      : { ...(message as object), correlationId };

    response.status(status).json(responseBody);
  }
}
