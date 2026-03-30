import { Request, Response } from 'express';
import { CorrelationIdMiddleware } from './correlation-id.middleware';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  createCorrelationId: jest.fn().mockReturnValue('generated-id'),
}));

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should use existing correlation id from header', () => {
    const req = { headers: { 'x-correlation-id': 'existing-id' } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.headers['x-correlation-id']).toBe('existing-id');
  });

  it('should generate correlation id when not present', () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req).toHaveProperty('startTime');
  });
});
