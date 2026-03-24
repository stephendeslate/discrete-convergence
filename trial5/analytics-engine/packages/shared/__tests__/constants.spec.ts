import { clampPagination, BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION } from '../src/constants';

describe('clampPagination', () => {
  it('should use defaults when no arguments', () => {
    const result = clampPagination();
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should clamp page to minimum 1', () => {
    const result = clampPagination(-5, 10);
    expect(result.page).toBe(1);
  });

  it('should clamp limit to maximum 100', () => {
    const result = clampPagination(1, 500);
    expect(result.limit).toBe(100);
  });

  it('should clamp limit to minimum 1', () => {
    const result = clampPagination(1, -10);
    expect(result.limit).toBe(1);
  });

  it('should floor fractional page values', () => {
    const result = clampPagination(2.7, 10);
    expect(result.page).toBe(2);
  });

  it('should floor fractional limit values', () => {
    const result = clampPagination(1, 15.9);
    expect(result.limit).toBe(15);
  });

  it('should pass through valid values', () => {
    const result = clampPagination(3, 50);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });
});

describe('shared constants', () => {
  it('should export BCRYPT_SALT_ROUNDS as 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should export ALLOWED_REGISTRATION_ROLES without ADMIN', () => {
    expect(ALLOWED_REGISTRATION_ROLES).toContain('USER');
    expect(ALLOWED_REGISTRATION_ROLES).toContain('VIEWER');
    expect(ALLOWED_REGISTRATION_ROLES).not.toContain('ADMIN');
  });

  it('should export APP_VERSION as semver string', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
