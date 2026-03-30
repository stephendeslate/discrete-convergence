import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('should handle HttpException', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ headers: { 'x-correlation-id': 'test-id' }, url: '/test', method: 'GET', body: {} }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new HttpException('Bad Request', HttpStatus.BAD_REQUEST), host);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'test-id' }),
    );
  });

  it('should handle unknown exceptions as 500', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ headers: {}, url: '/test', method: 'GET', body: {} }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new Error('Unexpected'), host);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500 }),
    );
  });

  it('should not leak stack traces', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ headers: {}, url: '/test', method: 'GET', body: { password: 'secret' } }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new Error('Stack trace leak'), host);
    const response = mockJson.mock.calls[0][0];
    expect(response.stack).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(500);
  });
});
