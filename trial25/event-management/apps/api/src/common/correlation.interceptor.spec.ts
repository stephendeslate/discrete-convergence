// Unit tests
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';
import { CORRELATION_ID_HEADER } from '@repo/shared';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should add correlation id to response', (done) => {
    const headers: Record<string, string> = {};
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
        getResponse: () => ({ setHeader: (key: string, val: string) => { headers[key] = val; } }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('test') };

    interceptor.intercept(mockContext, mockHandler).subscribe(() => {
      expect(headers[CORRELATION_ID_HEADER]).toBeDefined();
      done();
    });
  });

  it('should preserve existing correlation id', (done) => {
    const headers: Record<string, string> = { [CORRELATION_ID_HEADER]: 'existing-id' };
    const responseHeaders: Record<string, string> = {};
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
        getResponse: () => ({ setHeader: (key: string, val: string) => { responseHeaders[key] = val; } }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('test') };

    interceptor.intercept(mockContext, mockHandler).subscribe(() => {
      expect(responseHeaders[CORRELATION_ID_HEADER]).toBe('existing-id');
      done();
    });
  });
});
