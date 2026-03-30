import { ResponseTimeInterceptor } from './response-time.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should add X-Response-Time header', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({
          setHeader: mockSetHeader,
        }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      complete: () => {
        expect(mockSetHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/^\d+ms$/));
        done();
      },
    });
  });
});
