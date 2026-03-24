// TRACED:FD-MON-001
// TRACED:FD-MON-002
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { formatLogEntry, sanitizeLogContext } from 'shared';

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
      ? exception.message
      : 'Internal server error';

    const correlationId = (request.headers['x-correlation-id'] as string) ?? 'unknown';

    const logContext = sanitizeLogContext({
      statusCode: status,
      path: request.url,
      method: request.method,
      correlationId,
    });

    process.stderr.write(formatLogEntry('error', message, correlationId, logContext as Record<string, unknown>) + '\n');

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
