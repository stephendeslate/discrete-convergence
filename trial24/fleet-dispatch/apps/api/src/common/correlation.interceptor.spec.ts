import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';

describe('CorrelationInterceptor', () => {
  const interceptor = new CorrelationInterceptor();

  function mockContext(headers: Record<string, string> = {}): {
    context: ExecutionContext;
    handler: CallHandler;
    responseHeaders: Record<string, string>;
    requestHeaders: Record<string, string>;
  } {
    const requestHeaders: Record<string, string> = { ...headers };
    const responseHeaders: Record<string, string> = {};
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: requestHeaders }),
        getResponse: () => ({
          setHeader: (key: string, value: string) => {
            responseHeaders[key] = value;
          },
        }),
      }),
    } as unknown as ExecutionContext;
    const handler = { handle: () => of('result') } as CallHandler;
    return { context, handler, responseHeaders, requestHeaders };
  }

  it('generates correlation ID when not present in request', (done) => {
    const { context, handler, responseHeaders, requestHeaders } = mockContext();
    interceptor.intercept(context, handler).subscribe(() => {
      expect(requestHeaders['x-correlation-id']).toBeDefined();
      expect(responseHeaders['x-correlation-id']).toBeDefined();
      done();
    });
  });

  it('preserves existing correlation ID from request', (done) => {
    const { context, handler, responseHeaders, requestHeaders } = mockContext({
      'x-correlation-id': 'existing-id',
    });
    interceptor.intercept(context, handler).subscribe(() => {
      expect(requestHeaders['x-correlation-id']).toBe('existing-id');
      expect(responseHeaders['x-correlation-id']).toBe('existing-id');
      done();
    });
  });
});
