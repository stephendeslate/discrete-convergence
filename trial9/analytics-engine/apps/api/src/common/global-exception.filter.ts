import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { sanitizeLogContext, formatLogEntry } from '@analytics-engine/shared';
import { PinoLoggerService } from '../monitoring/pino-logger.service';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  error: string;
  correlationId: string;
  timestamp: string;
}

// TRACED: AE-MON-004
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

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
        ? exception.message
        : 'Internal server error';

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? 'unknown';

    const sanitizedBody = sanitizeLogContext(request.body);

    this.logger.error(
      formatLogEntry({
        level: 'error',
        message: `${request.method} ${request.url} - ${status}`,
        correlationId,
      }),
      {
        body: sanitizedBody,
        status,
      },
    );

    const errorResponse: ErrorResponseBody = {
      statusCode: status,
      message,
      error: status >= 500 ? 'Internal Server Error' : message,
      correlationId,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
