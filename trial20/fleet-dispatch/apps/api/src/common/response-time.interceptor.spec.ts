import { ResponseTimeInterceptor } from './response-time.interceptor';
import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';

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

    interceptor.intercept(context, next).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/\d+ms/));
      done();
    });
  });

  it('should pass through the response value', (done) => {
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(context, next).subscribe((value) => {
      expect(value).toEqual({ data: 'test' });
      expect(mockSetHeader).toHaveBeenCalled();
      done();
    });
  });
});
