import { of } from 'rxjs';
import { ResponseTimeInterceptor } from './response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  const mockLogger = { debug: jest.fn() } as never;
  const interceptor = new ResponseTimeInterceptor(mockLogger);

  it('should set x-response-time header and log duration', (done) => {
    const mockSetHeader = jest.fn();
    const context = {
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
      }),
    } as never;

    const next = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockSetHeader).toHaveBeenCalledWith(
          'x-response-time',
          expect.stringMatching(/^\d+ms$/),
        );
      },
      complete: () => done(),
    });
  });
});
