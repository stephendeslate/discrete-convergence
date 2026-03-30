import { ResponseTimeInterceptor } from './response-time.interceptor';
import { of } from 'rxjs';

describe('ResponseTimeInterceptor', () => {
  let interceptor: ResponseTimeInterceptor;

  beforeEach(() => {
    interceptor = new ResponseTimeInterceptor();
  });

  it('should set X-Response-Time header', (done) => {
    const mockResponse = { setHeader: jest.fn(), statusCode: 200 };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
        getResponse: () => mockResponse,
      }),
    };
    const mockHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(mockContext as never, mockHandler as never).subscribe(() => {
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Response-Time',
        expect.stringMatching(/^\d+ms$/),
      );
      done();
    });
  });
});
