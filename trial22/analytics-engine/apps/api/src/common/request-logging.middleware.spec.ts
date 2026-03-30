import { RequestLoggingMiddleware } from './request-logging.middleware';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(middleware).toBeInstanceOf(RequestLoggingMiddleware);
  });

  it('should call next() and register a finish listener on the response', () => {
    const mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
      headers: { 'x-correlation-id': 'test-corr-id' },
    } as unknown as Request;

    const emitter = new EventEmitter();
    Object.assign(emitter, { statusCode: 200 });
    const mockRes = emitter as unknown as Response;
    const mockNext: NextFunction = jest.fn();

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
    // Verify a 'finish' listener was registered
    expect(mockRes.listenerCount('finish')).toBeGreaterThanOrEqual(1);
  });
});
