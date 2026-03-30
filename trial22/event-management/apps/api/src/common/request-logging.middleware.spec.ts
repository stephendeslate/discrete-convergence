import { RequestLoggingMiddleware } from './request-logging.middleware';
import { Request, Response, NextFunction } from 'express';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(middleware).toBeInstanceOf(RequestLoggingMiddleware);
  });

  it('should call next and register a finish listener', () => {
    const next: NextFunction = jest.fn();
    const on = jest.fn();
    const req = {
      headers: { 'x-correlation-id': 'test-corr-id' },
      method: 'GET',
      originalUrl: '/api/test',
    } as unknown as Request;
    const res = { on, statusCode: 200 } as unknown as Response;

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(on).toHaveBeenCalledWith('finish', expect.any(Function));
  });
});
