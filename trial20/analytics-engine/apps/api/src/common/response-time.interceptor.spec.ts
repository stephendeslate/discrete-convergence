import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should set X-Response-Time header', (done) => {
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockSetHeader).toHaveBeenCalledWith(
          'X-Response-Time',
          expect.stringMatching(/^\d+ms$/),
        );
        done();
      },
    });
  });

  it('should pass through the response unchanged', (done) => {
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('data') };

    interceptor.intercept(context, next).subscribe({
      next: (value) => {
        expect(value).toBe('data');
        done();
      },
    });
  });
});
