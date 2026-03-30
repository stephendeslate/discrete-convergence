import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response, NextFunction } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(middleware).toBeInstanceOf(CorrelationIdMiddleware);
  });

  it('should use existing x-correlation-id from request headers', () => {
    const setHeader = jest.fn();
    const next: NextFunction = jest.fn();
    const req = {
      headers: { 'x-correlation-id': 'existing-id-123' },
    } as unknown as Request;
    const res = { setHeader } as unknown as Response;

    middleware.use(req, res, next);

    expect(req.headers['x-correlation-id']).toBe('existing-id-123');
    expect(setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id-123');
    expect(next).toHaveBeenCalled();
  });

  it('should generate a correlation id when none is provided', () => {
    const setHeader = jest.fn();
    const next: NextFunction = jest.fn();
    const req = {
      headers: {},
    } as unknown as Request;
    const res = { setHeader } as unknown as Response;

    middleware.use(req, res, next);

    expect(req.headers['x-correlation-id']).toBeDefined();
    expect(setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      expect.any(String),
    );
    expect(next).toHaveBeenCalled();
  });
});
