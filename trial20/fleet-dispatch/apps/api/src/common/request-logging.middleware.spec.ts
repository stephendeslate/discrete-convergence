import { RequestLoggingMiddleware } from './request-logging.middleware';

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
  });

  it('should call next function', () => {
    const req = { headers: { 'x-correlation-id': 'test' }, method: 'GET', originalUrl: '/test' } as never;
    const res = { on: jest.fn(), statusCode: 200 } as never;
    const next = jest.fn();

    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should register finish event listener', () => {
    const onFn = jest.fn();
    const req = { headers: {}, method: 'POST', originalUrl: '/api' } as never;
    const res = { on: onFn, statusCode: 201 } as never;
    const next = jest.fn();

    middleware.use(req, res, next);
    expect(onFn).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(next).toHaveBeenCalled();
  });
});
