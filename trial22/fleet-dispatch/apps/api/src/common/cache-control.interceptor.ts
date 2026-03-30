import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// TRACED: FD-PERF-003
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const req = context.switchToHttp().getRequest();
        if (req.method === 'GET') {
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
        }
      }),
    );
  }
}
