import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { sanitizeLogContext, formatLogEntry } from '@event-management/shared';

// TRACED: EM-MON-005
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
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

    const correlationId = (request.headers['x-correlation-id'] as string) ?? 'unknown';

    const sanitizedBody = sanitizeLogContext(request.body);

    const logMessage = formatLogEntry({
      level: 'error',
      message: `${request.method} ${request.url} ${status}`,
      correlationId,
      method: request.method,
      url: request.url,
      statusCode: status,
    });
    process.stderr.write(logMessage + '\n');

    // Log sanitized body for debugging (no sensitive data leak)
    if (sanitizedBody && typeof sanitizedBody === 'object' && Object.keys(sanitizedBody).length > 0) {
      process.stderr.write(JSON.stringify({ sanitizedBody }) + '\n');
    }

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
