import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should use existing correlation ID from request headers', (done) => {
    const headers: Record<string, string> = { 'x-correlation-id': 'existing-id' };
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
      expect(headers['x-correlation-id']).toBe('existing-id');
      done();
    });
  });

  it('should generate new correlation ID when header is empty', (done) => {
    const headers: Record<string, string> = {};
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('x-correlation-id', expect.any(String));
      expect(headers['x-correlation-id']).toBeDefined();
      done();
    });
  });

  it('should set correlation ID on both request and response', (done) => {
    const headers: Record<string, string> = { 'x-correlation-id': 'test-id' };
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('value') };

    interceptor.intercept(context, next).subscribe(() => {
      expect(mockSetHeader).toHaveBeenCalledWith('x-correlation-id', 'test-id');
      expect(headers['x-correlation-id']).toBe('test-id');
      done();
    });
  });

  it('should pass through the next handler result', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
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
