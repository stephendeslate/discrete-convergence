// TRACED:FD-MON-004
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from 'shared';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string;

    res.on('finish', () => {
      const duration = Date.now() - start;
      process.stderr.write(
        formatLogEntry('info', `${req.method} ${req.url} ${res.statusCode}`, correlationId, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
        }) + '\n',
      );
    });

    next();
  }
}
