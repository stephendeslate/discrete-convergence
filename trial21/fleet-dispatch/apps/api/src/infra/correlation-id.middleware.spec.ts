import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should add correlation ID if not present', () => {
    const req = { headers: {} } as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.headers['x-correlation-id']).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      expect.any(String),
    );
    expect(next).toHaveBeenCalled();
  });

  it('should preserve existing correlation ID', () => {
    const req = {
      headers: { 'x-correlation-id': 'existing-id' },
    } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.headers['x-correlation-id']).toBe('existing-id');
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'existing-id',
    );
  });
});
