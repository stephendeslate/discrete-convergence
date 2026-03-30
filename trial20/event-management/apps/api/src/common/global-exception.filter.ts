import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { sanitizeLogContext } from '@event-management/shared';
import pino from 'pino';

const logger = pino({ level: 'error' });

// TRACED: EM-SEC-004
// TRACED: EM-EDGE-012 — SQL injection handled safely by Prisma parameterized queries
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

    const correlationId = request.headers['x-correlation-id'] as string;

    const sanitizedBody = sanitizeLogContext(request.body);

    logger.error(
      {
        correlationId,
        statusCode: status,
        path: request.url,
        method: request.method,
        body: sanitizedBody,
      },
      message,
    );

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
