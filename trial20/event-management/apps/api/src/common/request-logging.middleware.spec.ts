import { RequestLoggingMiddleware } from './request-logging.middleware';
import { Request, Response } from 'express';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
  });

  it('should call next and register finish listener', () => {
    const mockOn = jest.fn();
    const req = {
      method: 'GET',
      originalUrl: '/test',
      headers: { 'x-correlation-id': 'corr-1' },
    } as unknown as Request;
    const res = { on: mockOn } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalledWith('finish', expect.any(Function));
  });
});
