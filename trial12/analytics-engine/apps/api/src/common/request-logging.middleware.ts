import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';

// TRACED: AE-MON-006
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.url} ${res.statusCode}`,
        correlationId: req.headers['x-correlation-id'] as string,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
      process.stdout.write(JSON.stringify(entry) + '\n');
    });

    next();
  }
}
