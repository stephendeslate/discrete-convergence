import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { url: '/test-path' };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, path: '/test-path' }),
    );
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException({ message: 'Validation failed' }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('should handle non-HttpException as 500', () => {
    const exception = new Error('Something broke');
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: ['Internal server error'],
      }),
    );
  });

  it('should wrap single message in array', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);
    const jsonArg = mockResponse.json.mock.calls[0][0];
    expect(Array.isArray(jsonArg.message)).toBe(true);
  });

  it('should pass through array messages', () => {
    const exception = new HttpException({ message: ['error1', 'error2'] }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);
    const jsonArg = mockResponse.json.mock.calls[0][0];
    expect(jsonArg.message).toEqual(['error1', 'error2']);
  });

  it('should include timestamp and path', () => {
    filter.catch(new Error('test'), mockHost);
    const jsonArg = mockResponse.json.mock.calls[0][0];
    expect(jsonArg).toHaveProperty('timestamp');
    expect(jsonArg.path).toBe('/test-path');
  });
});
