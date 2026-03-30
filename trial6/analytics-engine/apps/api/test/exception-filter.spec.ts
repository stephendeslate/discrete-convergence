// TRACED:AE-MON-007 — Tests for GlobalExceptionFilter error handling and response format
import { HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from '../src/common/global-exception.filter';
import { RequestContextService } from '../src/common/request-context.service';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string; method: string; body: Record<string, unknown> };
  let mockHost: ArgumentsHost;
  let requestContext: RequestContextService;

  beforeEach(() => {
    requestContext = new RequestContextService();
    requestContext.correlationId = 'test-corr-id-123';
    filter = new GlobalExceptionFilter(requestContext);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test',
      method: 'POST',
      body: { email: 'test@test.com', password: 'secret' },
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should return correct status for HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not Found',
        correlationId: 'test-corr-id-123',
      }),
    );
  });

  it('should return 500 for non-HttpException errors', () => {
    const exception = new Error('Database connection lost');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
  });

  it('should not leak internal error messages in response', () => {
    const exception = new Error('SELECT * FROM users WHERE id = injection');

    filter.catch(exception, mockHost);

    const jsonCall = mockResponse.json.mock.calls[0][0];
    // Message should be generic, not the internal error
    expect(jsonCall.message).toBe('Internal server error');
    expect(jsonCall.message).not.toContain('SELECT');
  });

  it('should include correlationId in error response', () => {
    filter.catch(new Error('test'), mockHost);

    const jsonCall = mockResponse.json.mock.calls[0][0];
    expect(jsonCall.correlationId).toBe('test-corr-id-123');
  });

  it('should include ISO timestamp in response', () => {
    filter.catch(new Error('test'), mockHost);

    const jsonCall = mockResponse.json.mock.calls[0][0];
    expect(jsonCall.timestamp).toBeDefined();
    // Verify it parses as valid ISO date
    expect(new Date(jsonCall.timestamp).toISOString()).toBe(jsonCall.timestamp);
  });

  it('should handle 401 Unauthorized HttpException', () => {
    const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Unauthorized',
      }),
    );
  });

  it('should handle 403 Forbidden HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });

  it('should handle 400 Bad Request HttpException', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});
