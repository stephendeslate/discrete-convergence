jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  createCorrelationId: jest.fn().mockReturnValue('generated-id'),
}));

import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { createCorrelationId } from '@event-management/shared';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    jest.clearAllMocks();
  });

  it('should use existing correlation id from header', () => {
    const req = { headers: { 'x-correlation-id': 'existing-id' } } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'existing-id');
    expect(next).toHaveBeenCalledWith();
  });

  it('should generate correlation id when not present', () => {
    const req = { headers: {} } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(createCorrelationId).toHaveBeenCalledWith();
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'generated-id');
    expect(next).toHaveBeenCalledWith();
  });
});
