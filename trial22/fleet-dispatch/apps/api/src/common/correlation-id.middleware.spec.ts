import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response, NextFunction } from 'express';

jest.mock('@repo/shared', () => ({
  createCorrelationId: () => 'generated-correlation-id',
}));

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(middleware).toBeInstanceOf(CorrelationIdMiddleware);
  });

  it('should use existing x-correlation-id from request headers', () => {
    const setHeader = jest.fn();
    const req = {
      headers: { 'x-correlation-id': 'existing-id' },
    } as unknown as Request;
    const res = { setHeader } as unknown as Response;

    middleware.use(req, res, mockNext);

    expect(req.headers['x-correlation-id']).toBe('existing-id');
    expect(setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should generate a correlation id when none is provided', () => {
    const setHeader = jest.fn();
    const req = {
      headers: {},
    } as unknown as Request;
    const res = { setHeader } as unknown as Response;

    middleware.use(req, res, mockNext);

    expect(req.headers['x-correlation-id']).toBe('generated-correlation-id');
    expect(setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'generated-correlation-id');
    expect(mockNext).toHaveBeenCalled();
  });
});
