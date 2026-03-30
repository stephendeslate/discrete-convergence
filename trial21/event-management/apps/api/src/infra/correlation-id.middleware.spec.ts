import { CorrelationIdMiddleware } from './correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should generate a correlation id if none provided', () => {
    const req = { headers: {} } as { headers: Record<string, string> };
    const res = { setHeader: jest.fn() } as unknown as { setHeader: typeof jest.fn };
    const next = jest.fn();

    middleware.use(req as never, res as never, next);

    expect(req.headers['x-correlation-id']).toMatch(/^em-/);
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', expect.stringMatching(/^em-/));
    expect(next).toHaveBeenCalled();
  });

  it('should preserve existing correlation id', () => {
    const req = { headers: { 'x-correlation-id': 'existing-123' } };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    middleware.use(req as never, res as never, next);

    expect(req.headers['x-correlation-id']).toBe('existing-123');
    expect(next).toHaveBeenCalled();
  });
});
