import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const mockLogger = {
    setContext: jest.fn(),
    error: jest.fn(),
  };

  const filter = new HttpExceptionFilter(mockLogger as never);

  function mockHost(url = '/test', method = 'GET'): {
    host: ArgumentsHost;
    jsonFn: jest.Mock;
    statusFn: jest.Mock;
  } {
    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusFn }),
        getRequest: () => ({ url, method }),
      }),
    } as unknown as ArgumentsHost;
    return { host, jsonFn, statusFn };
  }

  it('handles HttpException with correct status', () => {
    const { host, jsonFn, statusFn } = mockHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(404);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/test',
      }),
    );
  });

  it('handles non-HttpException as 500 Internal Server Error', () => {
    const { host, jsonFn, statusFn } = mockHost();

    filter.catch(new Error('unexpected'), host);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('handles HttpException with object response', () => {
    const { host, jsonFn, statusFn } = mockHost();
    const exception = new HttpException(
      { statusCode: 400, message: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'Bad Request' }),
    );
  });

  it('logs the error', () => {
    const { host } = mockHost('/api/test', 'POST');
    filter.catch(new Error('test error'), host);
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/api/test', method: 'POST' }),
      'Request error',
    );
  });
});
