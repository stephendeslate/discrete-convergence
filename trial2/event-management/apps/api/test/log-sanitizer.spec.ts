import { sanitizeLogContext } from '@event-management/shared';

// TRACED:EM-TEST-009 — Log sanitizer tests with array cases

describe('sanitizeLogContext (from API tests)', () => {
  it('should redact sensitive fields in request-like objects', () => {
    const request = {
      method: 'POST',
      url: '/auth/login',
      body: {
        email: 'user@test.com',
        password: 'secret123',
      },
    };
    const result = sanitizeLogContext(request) as Record<string, unknown>;
    const body = result.body as Record<string, unknown>;
    expect(body.email).toBe('user@test.com');
    expect(body.password).toBe('[REDACTED]');
  });

  it('should handle array of users with tokens', () => {
    const data = [
      { id: '1', name: 'Alice', accessToken: 'tok-1' },
      { id: '2', name: 'Bob', accessToken: 'tok-2' },
    ];
    const result = sanitizeLogContext(data) as Array<Record<string, unknown>>;
    expect(result[0].name).toBe('Alice');
    expect(result[0].accessToken).toBe('[REDACTED]');
    expect(result[1].accessToken).toBe('[REDACTED]');
  });

  it('should handle deeply nested auth context', () => {
    const ctx = {
      request: {
        headers: {
          authorization: 'Bearer xyz',
        },
        user: {
          credentials: {
            secret: 'my-secret',
          },
        },
      },
    };
    const result = sanitizeLogContext(ctx) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.request.headers.authorization).toBe('[REDACTED]');
    expect(
      (result.request.user as Record<string, Record<string, unknown>>).credentials.secret,
    ).toBe('[REDACTED]');
  });
});
