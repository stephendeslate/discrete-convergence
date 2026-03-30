jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  sanitizeLogContext: jest.fn().mockReturnValue({}),
  formatLogEntry: jest.fn().mockReturnValue('formatted-log'),
}));

import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost, Logger } from '@nestjs/common';
import { sanitizeLogContext, formatLogEntry } from '@event-management/shared';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jest.clearAllMocks();
  });

  const createMockHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return {
      host: {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({ status }),
          getRequest: jest.fn().mockReturnValue({
            method: 'GET',
            url: '/test',
            headers: { 'x-correlation-id': 'corr-1' },
            body: {},
          }),
        }),
      } as unknown as ArgumentsHost,
      status,
      json,
    };
  };

  it('should handle HttpException with correct status', () => {
    const { host, status, json } = createMockHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Not Found' }),
    );
    expect(formatLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('should handle unknown exceptions as 500', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new Error('unexpected'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'Internal server error' }),
    );
    expect(sanitizeLogContext).toHaveBeenCalledWith({});
  });
});
