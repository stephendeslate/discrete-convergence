import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@fleet-dispatch/shared';
import { performance } from 'perf_hooks';

// TRACED: FD-MON-004
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? 'unknown';

    this.logger.error(
      JSON.stringify(
        sanitizeLogContext({
          message,
          statusCode: status,
          path: request.url,
          method: request.method,
          correlationId,
          body: request.body,
        }),
      ),
    );

    const startTime = (request as Request & { startTime?: number }).startTime;
    if (startTime !== undefined && !response.headersSent) {
      const duration = (performance.now() - startTime).toFixed(2);
      response.setHeader('X-Response-Time', `${duration}ms`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
