import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext, formatLogEntry } from '@event-management/shared';

// TRACED: EM-MON-005
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const correlationId = request.headers['x-correlation-id'] as string;

    const sanitizedBody = sanitizeLogContext(request.body);

    const logEntry = formatLogEntry({
      level: 'error',
      message: `Exception: ${typeof message === 'string' ? message : JSON.stringify(message)}`,
      timestamp: new Date().toISOString(),
      correlationId,
      method: request.method,
      url: request.url,
      statusCode: status,
    });
    process.stdout.write(logEntry + '\n');

    // Log sanitized body for debugging but never send internal details to client
    if (sanitizedBody && typeof sanitizedBody === 'object' && Object.keys(sanitizedBody).length > 0) {
      process.stdout.write(JSON.stringify({ sanitizedRequestBody: sanitizedBody }) + '\n');
    }

    const responseBody = typeof message === 'string'
      ? { statusCode: status, message, correlationId }
      : { ...(message as object), correlationId };

    response.status(status).json(responseBody);
  }
}
