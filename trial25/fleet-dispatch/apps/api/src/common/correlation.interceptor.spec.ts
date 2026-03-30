import { CorrelationInterceptor } from './correlation.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('CorrelationInterceptor', () => {
  let interceptor: CorrelationInterceptor;

  beforeEach(() => {
    interceptor = new CorrelationInterceptor();
  });

  it('should set correlation id header on response', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-correlation-id': 'existing-id' },
        }),
        getResponse: () => ({
          setHeader: mockSetHeader,
        }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('test') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      complete: () => {
        expect(mockSetHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
        done();
      },
    });
  });

  it('should generate correlation id if not present', (done) => {
    const mockHeaders: Record<string, string> = {};
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: mockHeaders }),
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;

    const mockHandler: CallHandler = { handle: () => of('test') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      complete: () => {
        expect(mockSetHeader).toHaveBeenCalled();
        expect(mockHeaders['x-correlation-id']).toBeDefined();
        done();
      },
    });
  });
});
