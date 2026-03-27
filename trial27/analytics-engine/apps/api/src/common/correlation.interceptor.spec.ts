import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should use existing correlation ID from request headers', (done) => {
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-correlation-id': 'existing-id' },
          method: 'GET',
          url: '/test',
        }),
        getResponse: () => ({
          setHeader: mockSetHeader,
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
      done();
    });
  });

  it('should generate a new correlation ID when none exists', (done) => {
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          method: 'POST',
          url: '/api/data',
        }),
        getResponse: () => ({
          setHeader: mockSetHeader,
        }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('x-correlation-id', expect.any(String));
      done();
    });
  });

  it('should call next.handle()', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {}, method: 'GET', url: '/' }),
        getResponse: () => ({ setHeader: jest.fn() }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('test-value') };

    interceptor.intercept(context, next).subscribe((value) => {
      expect(value).toBe('test-value');
      done();
    });
  });
});
