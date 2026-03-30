import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should generate correlation ID when not provided', () => {
    const mockReq = { headers: {} } as Request;
    const mockSetHeader = jest.fn();
    const mockRes = { setHeader: mockSetHeader } as unknown as Response;
    const mockNext = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockReq.headers['x-correlation-id']).toBeDefined();
    expect(mockSetHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should preserve existing correlation ID', () => {
    const existingId = 'existing-correlation-id';
    const mockReq = { headers: { 'x-correlation-id': existingId } } as unknown as Request;
    const mockSetHeader = jest.fn();
    const mockRes = { setHeader: mockSetHeader } as unknown as Response;
    const mockNext = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockReq.headers['x-correlation-id']).toBe(existingId);
    expect(mockSetHeader).toHaveBeenCalledWith('X-Correlation-ID', existingId);
  });
});
