// TRACED:CORRELATION-INTERCEPTOR-SPEC
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should use existing correlation ID from request header', (done) => {
    const mockReq = { headers: { 'x-correlation-id': 'existing-id' } };
    const mockRes = { setHeader: jest.fn() };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => mockReq,
        getResponse: () => mockRes,
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(ctx, next).subscribe(() => {
      expect(mockReq.headers['x-correlation-id']).toBe('existing-id');
      expect(mockRes.setHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
      done();
    });
  });

  it('should generate new correlation ID when none present (empty header)', (done) => {
    const mockReq = { headers: {} as Record<string, string> };
    const mockRes = { setHeader: jest.fn() };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => mockReq,
        getResponse: () => mockRes,
      }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of('result') };

    interceptor.intercept(ctx, next).subscribe(() => {
      expect(mockReq.headers['x-correlation-id']).toBeDefined();
      expect(typeof mockReq.headers['x-correlation-id']).toBe('string');
      expect(mockRes.setHeader).toHaveBeenCalled();
      done();
    });
  });
});
