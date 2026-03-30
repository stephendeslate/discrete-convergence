import { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION, clampPagination } from '../src/constants';

describe('shared constants', () => {
  it('BCRYPT_SALT_ROUNDS should be 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('ALLOWED_REGISTRATION_ROLES should exclude ADMIN', () => {
    expect(ALLOWED_REGISTRATION_ROLES).toContain('ORGANIZER');
    expect(ALLOWED_REGISTRATION_ROLES).toContain('VIEWER');
    expect(ALLOWED_REGISTRATION_ROLES).not.toContain('ADMIN');
  });

  it('APP_VERSION should be a valid semver string', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('clampPagination', () => {
  it('should return default values when no params provided', () => {
    const result = clampPagination({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.skip).toBe(0);
    expect(result.take).toBe(20);
  });

  it('should clamp pageSize to MAX_PAGE_SIZE (100)', () => {
    const result = clampPagination({ page: 1, pageSize: 500 });
    expect(result.pageSize).toBe(100);
    expect(result.take).toBe(100);
  });

  it('should clamp page to minimum of 1', () => {
    const result = clampPagination({ page: -5, pageSize: 10 });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('should compute skip correctly for page 3', () => {
    const result = clampPagination({ page: 3, pageSize: 25 });
    expect(result.skip).toBe(50);
    expect(result.take).toBe(25);
  });

  it('should clamp pageSize to minimum of 1', () => {
    const result = clampPagination({ page: 1, pageSize: 0 });
    expect(result.pageSize).toBe(1);
  });

  it('should floor fractional values', () => {
    const result = clampPagination({ page: 2.7, pageSize: 15.3 });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(15);
  });
});
