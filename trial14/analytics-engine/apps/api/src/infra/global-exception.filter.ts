import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import pino from 'pino';
import { sanitizeLogContext } from '@analytics-engine/shared';

// TRACED: AE-MON-004 — GlobalExceptionFilter sanitizes errors using sanitizeLogContext, includes correlationId in response

const logger = pino({ level: 'error' });

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? 'unknown';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error({
      statusCode: status,
      message,
      correlationId,
      path: request.url,
      method: request.method,
      body: sanitizedBody,
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
