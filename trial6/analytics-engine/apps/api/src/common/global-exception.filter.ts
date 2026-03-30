// TRACED:AE-MON-004 — Global exception filter as APP_FILTER with sanitized errors and correlationId
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import pino from 'pino';
import { sanitizeLogContext } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';

const logger = pino({ level: 'error' });

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly requestContext: RequestContextService) {}

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

    const sanitizedBody = sanitizeLogContext(request.body);
    logger.error({
      statusCode: status,
      path: request.url,
      method: request.method,
      body: sanitizedBody,
      correlationId: this.requestContext.correlationId,
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId: this.requestContext.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
