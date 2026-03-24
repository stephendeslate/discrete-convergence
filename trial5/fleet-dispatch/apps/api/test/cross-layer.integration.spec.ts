import { createCorrelationId, formatLogEntry, validateEnvVars, clampPagination } from '@fleet-dispatch/shared';

describe('Cross-Layer Integration', () => {
  describe('Correlation ID propagation', () => {
    it('should generate valid UUID v4 format', () => {
      const id = createCorrelationId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs on each call', () => {
      const ids = new Set(Array.from({ length: 100 }, () => createCorrelationId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('Structured logging', () => {
    it('should produce valid JSON with all fields', () => {
      const entry = formatLogEntry({
        level: 'info',
        message: 'GET /drivers 200',
        method: 'GET',
        url: '/drivers',
        statusCode: 200,
        duration: 42,
        correlationId: 'test-id',
      });

      const parsed = JSON.parse(entry) as Record<string, unknown>;
      expect(parsed['level']).toBe('info');
      expect(parsed['message']).toBe('GET /drivers 200');
      expect(parsed['method']).toBe('GET');
      expect(parsed['statusCode']).toBe(200);
      expect(parsed['duration']).toBe(42);
      expect(parsed['correlationId']).toBe('test-id');
      expect(parsed['timestamp']).toBeDefined();
    });

    it('should include ISO timestamp', () => {
      const entry = formatLogEntry({ level: 'error', message: 'fail' });
      const parsed = JSON.parse(entry) as Record<string, string>;
      const ts = new Date(parsed['timestamp']);
      expect(ts.toISOString()).toBe(parsed['timestamp']);
    });
  });

  describe('Environment validation', () => {
    it('should throw when required vars are missing', () => {
      const original = process.env['NONEXISTENT_VAR'];
      delete process.env['NONEXISTENT_VAR'];

      expect(() => validateEnvVars(['NONEXISTENT_VAR'])).toThrow(
        'Missing required environment variables: NONEXISTENT_VAR',
      );

      if (original !== undefined) {
        process.env['NONEXISTENT_VAR'] = original;
      }
    });

    it('should not throw when all vars are present', () => {
      process.env['TEST_VAR_A'] = 'value';
      process.env['TEST_VAR_B'] = 'value';

      expect(() => validateEnvVars(['TEST_VAR_A', 'TEST_VAR_B'])).not.toThrow();

      delete process.env['TEST_VAR_A'];
      delete process.env['TEST_VAR_B'];
    });
  });

  describe('Pagination contract between frontend and API', () => {
    it('should handle skip/take computation correctly', () => {
      const { page, pageSize } = clampPagination(3, 10);
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      expect(skip).toBe(20);
      expect(take).toBe(10);
    });

    it('should handle edge case of page 1', () => {
      const { page, pageSize } = clampPagination(1, 20);
      const skip = (page - 1) * pageSize;

      expect(skip).toBe(0);
    });

    it('should compute totalPages correctly for exact division', () => {
      const total = 40;
      const { pageSize } = clampPagination(1, 20);
      const totalPages = Math.ceil(total / pageSize);

      expect(totalPages).toBe(2);
    });

    it('should compute totalPages correctly for remainder', () => {
      const total = 41;
      const { pageSize } = clampPagination(1, 20);
      const totalPages = Math.ceil(total / pageSize);

      expect(totalPages).toBe(3);
    });
  });
});
