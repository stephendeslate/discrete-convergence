// TRACED:CORRELATION-INTERCEPTOR-SPEC
import { CorrelationInterceptor } from './correlation.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CORRELATION_ID_HEADER } from '@repo/shared';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  function createContext(existingId?: string) {
    const headers: Record<string, string | undefined> = {};
    if (existingId) {
      headers[CORRELATION_ID_HEADER] = existingId;
    }
    const setHeader = jest.fn();
    return {
      context: {
        switchToHttp: () => ({
          getRequest: () => ({ headers }),
          getResponse: () => ({ setHeader }),
        }),
      } as unknown as ExecutionContext,
      setHeader,
      headers,
    };
  }

  it('should use existing correlation ID from request headers', (done) => {
    const { context, setHeader, headers } = createContext('existing-id');
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(headers[CORRELATION_ID_HEADER]).toBe('existing-id');
        expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, 'existing-id');
      },
      complete: done,
    });
  });

  it('should generate a new correlation ID when none exists', (done) => {
    const { context, setHeader, headers } = createContext();
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(headers[CORRELATION_ID_HEADER]).toBeDefined();
        expect(typeof headers[CORRELATION_ID_HEADER]).toBe('string');
        expect(setHeader).toHaveBeenCalledWith(
          CORRELATION_ID_HEADER,
          expect.any(String),
        );
      },
      complete: done,
    });
  });
});
