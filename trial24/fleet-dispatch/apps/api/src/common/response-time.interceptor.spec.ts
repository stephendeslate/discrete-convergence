import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  const interceptor = new ResponseTimeInterceptor();

  it('sets X-Response-Time header on response', (done) => {
    const headers: Record<string, string> = {};
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({
          setHeader: (key: string, value: string) => {
            headers[key] = value;
          },
        }),
      }),
    } as unknown as ExecutionContext;
    const handler = { handle: () => of('result') } as CallHandler;

    interceptor.intercept(context, handler).subscribe(() => {
      expect(headers['X-Response-Time']).toMatch(/^\d+ms$/);
      done();
    });
  });
});
