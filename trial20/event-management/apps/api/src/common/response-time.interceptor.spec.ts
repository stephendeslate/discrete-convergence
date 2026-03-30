import { ResponseTimeInterceptor } from './response-time.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should set X-Response-Time header', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const mockNext: CallHandler = { handle: () => of('response') };

    interceptor.intercept(mockContext, mockNext).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/\d+ms/));
      done();
    });
  });

  it('should pass through the response value', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const mockNext: CallHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(mockContext, mockNext).subscribe((result) => {
      expect(result).toEqual({ data: 'test' });
      expect(mockSetHeader).toHaveBeenCalled();
      done();
    });
  });
});
