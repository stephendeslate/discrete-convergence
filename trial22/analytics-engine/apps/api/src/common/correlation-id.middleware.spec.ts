import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response, NextFunction } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    mockReq = { headers: {} };
    mockRes = { setHeader: jest.fn() };
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(middleware).toBeInstanceOf(CorrelationIdMiddleware);
  });

  it('should generate a correlation ID when none is provided', () => {
    middleware.use(
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockReq.headers!['x-correlation-id']).toBeDefined();
    expect(typeof mockReq.headers!['x-correlation-id']).toBe('string');
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      expect.any(String),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should preserve an existing correlation ID from the request', () => {
    mockReq.headers = { 'x-correlation-id': 'existing-id-123' };

    middleware.use(
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockReq.headers['x-correlation-id']).toBe('existing-id-123');
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      'existing-id-123',
    );
  });
});
