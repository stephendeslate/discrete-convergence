import { CorrelationInterceptor } from './correlation.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;
  let mockSetHeader: jest.Mock;
  let mockNext: CallHandler;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
    mockSetHeader = jest.fn();
    mockNext = { handle: () => of('result') };
  });

  function createContext(headers: Record<string, string> = {}): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test', headers }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should set X-Correlation-ID header on response', (done) => {
    interceptor.intercept(createContext(), mockNext).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
      done();
    });
  });

  it('should use existing correlation ID from request header', (done) => {
    const ctx = createContext({ 'x-correlation-id': 'my-correlation-id' });
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('X-Correlation-ID', 'my-correlation-id');
      done();
    });
  });

  it('should pass through to next handler', (done) => {
    interceptor.intercept(createContext(), mockNext).subscribe((result) => {
      expect(result).toBe('result');
      done();
    });
  });
});
