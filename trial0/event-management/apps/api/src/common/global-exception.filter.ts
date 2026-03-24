// TRACED:EM-MON-001 — GlobalExceptionFilter as APP_FILTER with sanitized errors
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@event-management/shared';
import { LoggerService } from './logger.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>)['message'] as string;
    }

    const correlationId = (request.headers['x-correlation-id'] as string) ?? 'unknown';

    this.logger.error('Request failed', {
      ...sanitizeLogContext({
        method: request.method,
        url: request.url,
        status,
        correlationId,
        body: request.body,
      }) as Record<string, unknown>,
    });

    // TRACED:EM-MON-002 — No stack traces in response, correlationId included
    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
    });
  }
}
