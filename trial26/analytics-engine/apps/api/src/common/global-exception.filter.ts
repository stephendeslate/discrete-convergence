// TRACED: AE-EDGE-011 — Global exception filter catches all unhandled errors
// TRACED: AE-EDGE-012 — HTTP exception status code pass-through
// TRACED: AE-EDGE-013 — Non-HTTP exceptions return 500 with generic message
// TRACED: AE-MON-004 — Structured error logging with pino
// TRACED: AE-MON-005 — Error correlation via request context
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import pino from 'pino';

const logger = pino({ level: 'error' });

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message = typeof exResponse === 'string' ? exResponse : (exResponse as Record<string, unknown>).message as string ?? exception.message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      logger.error({ err: exception, path: request.url }, 'Unhandled exception');
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
