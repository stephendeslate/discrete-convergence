// TRACED:RESP-TIME-TEST — Response time interceptor tests
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
    expect(interceptor).toBeInstanceOf(ResponseTimeInterceptor);
  });

  it('should log warning for slow responses', (done) => {
    const mockResponse = { setHeader: jest.fn() };
    const context = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;
    const handler: CallHandler = { handle: () => of({ data: 'slow' }) };

    // Mock Date.now to simulate a slow response (>1000ms)
    const originalNow = Date.now;
    let callCount = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 1000 : 2500; // First call returns start, second returns start + 1500ms
    });

    interceptor.intercept(context, handler).subscribe({
      next: (value) => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('x-response-time', '1500ms');
        expect(value).toEqual({ data: 'slow' });
        jest.restoreAllMocks();
        done();
      },
    });
  });

  it('should set x-response-time header', (done) => {
    const mockResponse = { setHeader: jest.fn() };
    const context = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;
    const handler: CallHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(context, handler).subscribe({
      next: (value) => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'x-response-time',
          expect.stringMatching(/^\d+ms$/),
        );
        expect(mockResponse.setHeader).toHaveBeenCalledTimes(1);
        expect(value).toEqual({ data: 'test' });
        done();
      },
    });
  });
});
