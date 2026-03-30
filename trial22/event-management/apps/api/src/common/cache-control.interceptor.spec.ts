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

  it('should set Cache-Control header on GET requests', (done) => {
    const setHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader }),
        getRequest: () => ({ method: 'GET' }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('response') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=300, s-maxage=600',
      );
      expect(setHeader).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should not set Cache-Control header on non-GET requests', (done) => {
    const setHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader }),
        getRequest: () => ({ method: 'POST' }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('response') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(setHeader).not.toHaveBeenCalled();
      expect(setHeader).toHaveBeenCalledTimes(0);
      done();
    });
  });
});
