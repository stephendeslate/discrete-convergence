import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@analytics-engine/shared';
import pino from 'pino';

const logger = pino({ name: 'exception-filter' });

// TRACED: AE-MON-006
@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    const message =
      exceptionResponse !== null
        ? typeof exceptionResponse === 'object'
          ? (exceptionResponse as Record<string, unknown>).message ?? (exception as HttpException).message
          : exceptionResponse
        : 'Internal server error';

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? 'unknown';

    // TRACED: AE-SEC-009
    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error({
      statusCode: status,
      path: request.url,
      method: request.method,
      correlationId,
      body: sanitizedBody,
      message: exception instanceof Error ? exception.message : 'Unknown error',
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
