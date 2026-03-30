import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@fleet-dispatch/shared';
import { RequestContextService } from './request-context.service';
import pino from 'pino';

// TRACED:FD-MON-009
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject('PINO_LOGGER') private readonly logger: pino.Logger,
    private readonly requestContext: RequestContextService,
  ) {}

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

    const correlationId = this.requestContext.correlationId;

    this.logger.error({
      message: 'Unhandled exception',
      statusCode: status,
      path: request.url,
      method: request.method,
      correlationId,
      body: sanitizeLogContext(request.body),
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
