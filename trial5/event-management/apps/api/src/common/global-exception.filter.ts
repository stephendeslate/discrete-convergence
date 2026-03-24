// TRACED:EM-CROSS-004 — GlobalExceptionFilter as APP_FILTER with sanitized errors and correlationId
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import type { Response, Request } from 'express';
import { sanitizeLogContext } from '@event-management/shared';
import { RequestContextService } from './request-context.service';
import pino from 'pino';

const logger = pino({ level: 'error' });

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(RequestContextService) private readonly requestContext: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    let correlationId = '';
    try {
      correlationId = this.requestContext.getCorrelationId();
    } catch {
      correlationId = (request.headers['x-correlation-id'] as string) ?? '';
    }

    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error({
      message,
      statusCode: status,
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
