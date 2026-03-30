import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { sanitizeLogContext } from '@repo/shared';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const context = sanitizeLogContext({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${Date.now() - start}ms`,
        correlationId: req.headers['x-correlation-id'] as string,
        userAgent: req.headers['user-agent'] as string,
      });
      this.logger.log(context);
    });

    next();
  }
}
