import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('should handle HttpException and return correct status', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({
          url: '/test',
          method: 'GET',
          headers: { 'x-correlation-id': 'corr-1' },
          body: {},
        }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Not Found' }),
    );
  });

  it('should handle unknown exceptions as 500', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({
          url: '/test',
          method: 'GET',
          headers: {},
          body: {},
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new Error('unexpected'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'Internal server error' }),
    );
  });

  it('should include correlationId in error response', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({
          url: '/test',
          method: 'GET',
          headers: { 'x-correlation-id': 'test-corr-id' },
          body: {},
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new HttpException('Bad Request', 400), mockHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'test-corr-id' }),
    );
  });

  it('should sanitize sensitive data from request body', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({
          url: '/auth/login',
          method: 'POST',
          headers: {},
          body: { email: 'test@test.com', password: 'secret123' },
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new Error('fail'), mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalled();
  });
});
