import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CacheControlInterceptor } from './cache-control.interceptor';

describe('CacheControlInterceptor', () => {
  let interceptor: CacheControlInterceptor;

  beforeEach(() => {
    interceptor = new CacheControlInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
    expect(interceptor).toBeInstanceOf(CacheControlInterceptor);
  });

  it('should set Cache-Control header for GET requests', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('response-data') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockSetHeader).toHaveBeenCalledWith(
          'Cache-Control',
          'public, max-age=300',
        );
        expect(mockSetHeader).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it('should NOT set Cache-Control header for POST requests', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
        getRequest: () => ({ method: 'POST' }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('response-data') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockSetHeader).not.toHaveBeenCalled();
        expect(mockSetHeader).toHaveBeenCalledTimes(0);
        done();
      },
    });
  });
});
