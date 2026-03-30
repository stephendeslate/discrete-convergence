// TRACED:CORR-INT-TEST — Correlation interceptor tests
import { CorrelationInterceptor } from './correlation.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should add correlation ID when not present', (done) => {
    const mockRequest = { headers: {} as Record<string, string> };
    const mockResponse = {
      setHeader: jest.fn(),
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;
    const handler: CallHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        expect(mockRequest.headers['x-correlation-id']).toBeDefined();
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'x-correlation-id',
          expect.any(String),
        );
        done();
      },
    });
  });

  it('should preserve existing correlation ID', (done) => {
    const mockRequest = {
      headers: { 'x-correlation-id': 'existing-id' } as Record<string, string>,
    };
    const mockResponse = { setHeader: jest.fn() };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;
    const handler: CallHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(context, handler).subscribe({
      next: () => {
        expect(mockRequest.headers['x-correlation-id']).toBe('existing-id');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
        done();
      },
    });
  });
});
