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

  it('should set X-Response-Time header', (done) => {
    const setHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('response') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(setHeader).toHaveBeenCalledWith(
        'X-Response-Time',
        expect.stringMatching(/^\d+ms$/),
      );
      expect(setHeader).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
