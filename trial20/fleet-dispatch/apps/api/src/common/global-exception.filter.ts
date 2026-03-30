import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@fleet-dispatch/shared';
import pino from 'pino';

const logger = pino({ level: 'error' });

// TRACED: FD-SEC-006
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-correlation-id'] as string;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error({
      correlationId,
      statusCode: status,
      path: request.url,
      method: request.method,
      body: sanitizedBody,
      message: typeof message === 'string' ? message : undefined,
    }, 'Request error');

    const responseBody = typeof message === 'object' ? message : { statusCode: status, message };

    response.status(status).json({
      ...(typeof responseBody === 'object' ? responseBody : { statusCode: status, message: responseBody }),
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
