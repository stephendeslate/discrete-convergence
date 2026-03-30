import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

// TRACED: AE-PERF-001
@Injectable()
export class ResponseTimeMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    const start = performance.now();

    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = function (...args: Parameters<typeof res.writeHead>) {
      const duration = (performance.now() - start).toFixed(2);
      res.setHeader('X-Response-Time', `${duration}ms`);
      return originalWriteHead(...args);
    } as typeof res.writeHead;

    next();
  }
}
