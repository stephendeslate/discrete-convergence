import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should preserve existing correlation ID from request header', () => {
    const req = { headers: { 'x-correlation-id': 'existing-id' } } as unknown as Request;
    const mockSetHeader = jest.fn();
    const res = { setHeader: mockSetHeader } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.headers['x-correlation-id']).toBe('existing-id');
    expect(mockSetHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id');
    expect(next).toHaveBeenCalled();
  });

  it('should generate a new correlation ID when not present', () => {
    const req = { headers: {} } as unknown as Request;
    const mockSetHeader = jest.fn();
    const res = { setHeader: mockSetHeader } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.headers['x-correlation-id']).toBeDefined();
    expect(mockSetHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    expect(next).toHaveBeenCalled();
  });
});
