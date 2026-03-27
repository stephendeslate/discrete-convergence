// TRACED: FD-SEC-007 — Global exception filter unit tests
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { method: string; url: string; headers: Record<string, string> };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: {},
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle HttpException with correct status', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('should handle non-HttpException as 500 error', () => {
    const exception = new Error('unexpected');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('should handle null/undefined exception as 500 error', () => {
    filter.catch(null, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('should include correlationId when header is present', () => {
    mockRequest.headers['x-correlation-id'] = 'corr-123';
    const exception = new HttpException('Bad', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'corr-123' }),
    );
  });

  it('should not include correlationId when header is absent', () => {
    const exception = new HttpException('Bad', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.correlationId).toBeUndefined();
  });

  it('should include timestamp and path in error response', () => {
    const exception = new HttpException('Error', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.timestamp).toBeDefined();
    expect(body.path).toBe('/test');
  });

  it('should handle HttpException with object response (malformed body)', () => {
    const exception = new HttpException(
      { statusCode: 400, message: ['field must not be empty'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toEqual(['field must not be empty']);
  });
});
