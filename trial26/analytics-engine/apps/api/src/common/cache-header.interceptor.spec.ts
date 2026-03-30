import { CacheHeaderInterceptor } from './cache-header.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('CacheHeaderInterceptor', () => {
  let interceptor: CacheHeaderInterceptor;
  let mockSetHeader: jest.Mock;
  let mockNext: CallHandler;

  beforeEach(() => {
    interceptor = new CacheHeaderInterceptor();
    mockSetHeader = jest.fn();
    mockNext = { handle: () => of('result') };
  });

  function createContext(method: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should set Cache-Control header for GET requests', (done) => {
    interceptor.intercept(createContext('GET'), mockNext).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=60');
      done();
    });
  });

  it('should not set Cache-Control header for POST requests', (done) => {
    interceptor.intercept(createContext('POST'), mockNext).subscribe(() => {
      expect(mockSetHeader).not.toHaveBeenCalled();
      done();
    });
  });

  it('should not set Cache-Control header for DELETE requests', (done) => {
    interceptor.intercept(createContext('DELETE'), mockNext).subscribe(() => {
      expect(mockSetHeader).not.toHaveBeenCalled();
      done();
    });
  });

  it('should pass through to next handler', (done) => {
    interceptor.intercept(createContext('GET'), mockNext).subscribe((result) => {
      expect(result).toBe('result');
      done();
    });
  });
});
