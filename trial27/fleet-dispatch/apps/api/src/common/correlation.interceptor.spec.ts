// TRACED: FD-MON-004 — Correlation interceptor unit tests
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { CorrelationInterceptor } from './correlation.interceptor';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should use existing correlation ID from header', (done) => {
    const mockHeaders: Record<string, string> = { 'x-correlation-id': 'existing-id' };
    const mockRequest = { headers: mockHeaders };
    const mockResponse = { setHeader: jest.fn() };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('response') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id');
        done();
      },
    });
  });

  it('should generate new correlation ID when header is empty', (done) => {
    const mockHeaders: Record<string, string> = {};
    const mockRequest = { headers: mockHeaders };
    const mockResponse = { setHeader: jest.fn() };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const next: CallHandler = { handle: () => of('response') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'X-Correlation-ID',
          expect.any(String),
        );
        const generatedId = mockResponse.setHeader.mock.calls[0][1];
        expect(generatedId).toBeTruthy();
        expect(generatedId.length).toBeGreaterThan(0);
        done();
      },
    });
  });
});
