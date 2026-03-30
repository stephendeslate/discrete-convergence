import request from 'supertest';
import { createTestApp } from './helpers/test-setup';
import { INestApplication } from '@nestjs/common';
import { clampPagination, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@event-management/shared';

// TRACED: EM-TEST-013 — Performance and pagination tests

describe('Performance', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return X-Response-Time header in correct format', async () => {
    // TRACED: EM-PERF-001
    const res = await request(app.getHttpServer()).get('/health');

    const responseTime = res.headers['x-response-time'];
    expect(responseTime).toBeDefined();
    expect(typeof responseTime).toBe('string');
    // Format: digits (with optional decimal) followed by "ms"
    expect(responseTime).toMatch(/^\d+(\.\d+)?ms$/);
    // Extract numeric value and verify it's a valid number
    const numericPart = parseFloat(responseTime.replace('ms', ''));
    expect(numericPart).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(numericPart)).toBe(true);
  });

  it('should respond to /health endpoint in sub-1s', async () => {
    // TRACED: EM-PERF-002
    const start = performance.now();
    const res = await request(app.getHttpServer()).get('/health');
    const elapsed = performance.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(1000);
    // Also verify via the response header
    const serverTime = parseFloat(res.headers['x-response-time']?.replace('ms', '') ?? '9999');
    expect(serverTime).toBeLessThan(1000);
  });

  it('should correctly clamp pagination parameters', () => {
    // TRACED: EM-PERF-003
    // Default values
    const defaults = clampPagination();
    expect(defaults.page).toBe(1);
    expect(defaults.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(defaults.skip).toBe(0);

    // Negative page clamped to 1
    const negativePage = clampPagination(-5, 10);
    expect(negativePage.page).toBe(1);
    expect(negativePage.pageSize).toBe(10);
    expect(negativePage.skip).toBe(0);

    // Excessive pageSize clamped to MAX_PAGE_SIZE
    const largePageSize = clampPagination(1, 500);
    expect(largePageSize.pageSize).toBe(MAX_PAGE_SIZE);
    expect(largePageSize.skip).toBe(0);

    // Zero pageSize falls back to DEFAULT_PAGE_SIZE (falsy value treated as default)
    const zeroPageSize = clampPagination(1, 0);
    expect(zeroPageSize.pageSize).toBe(DEFAULT_PAGE_SIZE);

    // Proper skip calculation
    const page3 = clampPagination(3, 25);
    expect(page3.page).toBe(3);
    expect(page3.pageSize).toBe(25);
    expect(page3.skip).toBe(50);
  });
});
