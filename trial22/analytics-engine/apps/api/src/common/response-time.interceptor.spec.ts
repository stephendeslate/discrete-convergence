import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
    expect(interceptor).toBeInstanceOf(ResponseTimeInterceptor);
  });

  it('should set X-Response-Time header on the response', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('data') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockSetHeader).toHaveBeenCalledWith(
          'X-Response-Time',
          expect.stringMatching(/^\d+ms$/),
        );
        expect(mockSetHeader).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});
