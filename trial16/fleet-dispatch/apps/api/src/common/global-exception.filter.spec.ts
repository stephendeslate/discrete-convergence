import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  sanitizeLogContext: jest.fn((ctx) => ctx),
}));

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  const createMockHost = (startTime?: number): ArgumentsHost => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockSetHeader = jest.fn();
    return {
      switchToHttp: () => ({
        getResponse: () => ({
          status: mockStatus,
          headersSent: false,
          setHeader: mockSetHeader,
        }),
        getRequest: () => ({
          url: '/test',
          method: 'GET',
          headers: { 'x-correlation-id': 'corr-1' },
          body: {},
          startTime,
        }),
      }),
    } as unknown as ArgumentsHost;
  };

  it('should handle HttpException with correct status', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const host = createMockHost();
    const httpCtx = host.switchToHttp();
    const res = httpCtx.getResponse<{ status: jest.Mock }>();

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should handle unknown exceptions as 500', () => {
    const exception = new Error('Something broke');
    const host = createMockHost();
    const httpCtx = host.switchToHttp();
    const res = httpCtx.getResponse<{ status: jest.Mock }>();

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
