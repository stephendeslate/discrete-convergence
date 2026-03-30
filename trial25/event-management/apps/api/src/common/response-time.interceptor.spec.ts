// Unit tests
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should add X-Response-Time header', (done) => {
    const responseHeaders: Record<string, string> = {};
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: (key: string, val: string) => { responseHeaders[key] = val; } }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('test') };

    interceptor.intercept(mockContext, mockHandler).subscribe(() => {
      expect(responseHeaders['X-Response-Time']).toMatch(/^\d+ms$/);
      done();
    });
  });
});
