// TRACED:EM-MON-005
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@event-management/shared';
import { RequestContextService } from './request-context.service';
import { PinoLoggerService } from './logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly logger: PinoLoggerService,
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

    const sanitizedBody = sanitizeLogContext(request.body);

    this.logger.error(
      JSON.stringify({
        message,
        statusCode: status,
        path: request.url,
        correlationId: this.requestContext.correlationId,
        body: sanitizedBody,
      }),
    );

    response.status(status).json({
      statusCode: status,
      message,
      correlationId: this.requestContext.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
