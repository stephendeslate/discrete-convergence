import { RequestLoggingMiddleware } from './request-logging.middleware';
import { Request, Response } from 'express';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
  });

  it('should call next function', () => {
    const req = {
      headers: { 'x-correlation-id': 'corr-1' },
      method: 'GET',
      url: '/test',
    } as unknown as Request;
    const res = { on: jest.fn() } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should register finish listener on response', () => {
    const req = {
      headers: {},
      method: 'POST',
      url: '/api/data',
    } as unknown as Request;
    const on = jest.fn();
    const res = { on, statusCode: 200 } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(on).toHaveBeenCalledWith('finish', expect.any(Function));
  });
});
