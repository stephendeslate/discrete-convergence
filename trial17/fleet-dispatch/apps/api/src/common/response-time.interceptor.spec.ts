import { ResponseTimeInterceptor } from './response-time.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should set X-Response-Time header on success', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ headersSent: false, setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;
    const mockHandler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockSetHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringContaining('ms'));
      },
      complete: () => done(),
    });
  });

  it('should not set header if already sent', (done) => {
    const mockSetHeader = jest.fn();
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ headersSent: true, setHeader: mockSetHeader }),
      }),
    } as unknown as ExecutionContext;
    const mockHandler: CallHandler = { handle: () => of('result') };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: () => {
        expect(mockSetHeader).not.toHaveBeenCalled();
      },
      complete: () => done(),
    });
  });
});
