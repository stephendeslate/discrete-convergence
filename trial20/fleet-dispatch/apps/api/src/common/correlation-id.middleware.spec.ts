import { CorrelationIdMiddleware } from './correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should preserve existing correlation id', () => {
    const req = { headers: { 'x-correlation-id': 'existing-id' } } as never;
    const setHeader = jest.fn();
    const res = { setHeader } as never;
    const next = jest.fn();

    middleware.use(req, res, next);
    expect(setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id');
    expect(next).toHaveBeenCalled();
  });

  it('should generate new correlation id when missing', () => {
    const req = { headers: {} } as never;
    const setHeader = jest.fn();
    const res = { setHeader } as never;
    const next = jest.fn();

    middleware.use(req, res, next);
    expect(setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    expect(next).toHaveBeenCalled();
  });
});
