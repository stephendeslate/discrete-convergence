import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  const createMockHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const getResponse = () => ({ status });
    const getRequest = () => ({
      url: '/test',
      method: 'GET',
      headers: { 'x-correlation-id': 'test-corr-id' },
      body: { password: 'secret' },
    });

    return {
      switchToHttp: () => ({ getResponse, getRequest }),
      json,
      status,
    };
  };

  it('should handle HttpException with correct status code', () => {
    const { switchToHttp, status, json } = createMockHost();
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'test-corr-id' }),
    );
  });

  it('should handle unknown errors with 500 status', () => {
    const { switchToHttp, status, json } = createMockHost();
    const host = { switchToHttp } as unknown as ArgumentsHost;

    filter.catch(new Error('Unexpected'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        correlationId: 'test-corr-id',
      }),
    );
  });

  it('should not leak stack traces in response', () => {
    const { switchToHttp, json } = createMockHost();
    const host = { switchToHttp } as unknown as ArgumentsHost;
    const error = new Error('Internal failure');
    error.stack = 'Error: Internal failure\n  at Object.<anonymous>';

    filter.catch(error, host);

    const responseBody = json.mock.calls[0][0];
    expect(responseBody).not.toHaveProperty('stack');
    expect(JSON.stringify(responseBody)).not.toContain('at Object');
  });

  it('should include correlationId in response body', () => {
    const { switchToHttp, json } = createMockHost();
    const host = { switchToHttp } as unknown as ArgumentsHost;

    filter.catch(new HttpException('Bad', 400), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'test-corr-id' }),
    );
  });
});
