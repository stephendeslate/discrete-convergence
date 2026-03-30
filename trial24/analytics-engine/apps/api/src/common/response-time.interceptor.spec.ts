// TRACED:RESPONSE-TIME-INTERCEPTOR-SPEC
import { ResponseTimeInterceptor } from './response-time.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should set X-Response-Time header', (done) => {
    const setHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader }),
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(setHeader).toHaveBeenCalledWith(
          'X-Response-Time',
          expect.stringMatching(/^\d+ms$/),
        );
      },
      complete: done,
    });
  });

  it('should pass through the response value', (done) => {
    const setHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader }),
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of('my-value') };

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toBe('my-value');
      },
      complete: done,
    });
  });
});
