"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TRACED:SHARED-INDEX-SPEC
const index_1 = require("./index");
describe('shared constants', () => {
    it('exports APP_VERSION', () => {
        expect(index_1.APP_VERSION).toBe('1.0.0');
    });
    it('exports BCRYPT_SALT_ROUNDS as 12', () => {
        expect(index_1.BCRYPT_SALT_ROUNDS).toBe(12);
    });
    it('exports JWT expiry values', () => {
        expect(index_1.JWT_ACCESS_EXPIRY).toBe('15m');
        expect(index_1.JWT_REFRESH_EXPIRY).toBe('7d');
    });
    it('exports pagination constants', () => {
        expect(index_1.MAX_PAGE_SIZE).toBe(100);
        expect(index_1.DEFAULT_PAGE_SIZE).toBe(20);
        expect(index_1.MIN_PAGE).toBe(1);
    });
    it('exports CORRELATION_ID_HEADER', () => {
        expect(index_1.CORRELATION_ID_HEADER).toBe('x-correlation-id');
    });
});
describe('createCorrelationId', () => {
    it('returns a UUID string', () => {
        const id = (0, index_1.createCorrelationId)();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
    it('returns unique values', () => {
        const ids = new Set(Array.from({ length: 10 }, () => (0, index_1.createCorrelationId)()));
        expect(ids.size).toBe(10);
    });
});
describe('sanitizeLogContext', () => {
    it('redacts sensitive keys', () => {
        const result = (0, index_1.sanitizeLogContext)({
            email: 'test@example.com',
            password: 'secret123',
            token: 'jwt-token',
        });
        expect(result.email).toBe('test@example.com');
        expect(result.password).toBe('[REDACTED]');
        expect(result.token).toBe('[REDACTED]');
    });
    it('handles nested objects', () => {
        const result = (0, index_1.sanitizeLogContext)({
            user: { name: 'John', password: 'secret' },
        });
        expect(result.user.name).toBe('John');
        expect(result.user.password).toBe('[REDACTED]');
    });
    it('returns empty object for empty input', () => {
        expect((0, index_1.sanitizeLogContext)({})).toEqual({});
    });
});
describe('validateEnvVars', () => {
    it('does not throw when all vars are present', () => {
        process.env.TEST_VAR_A = 'value';
        expect(() => (0, index_1.validateEnvVars)(['TEST_VAR_A'])).not.toThrow();
        delete process.env.TEST_VAR_A;
    });
    it('throws when vars are missing', () => {
        expect(() => (0, index_1.validateEnvVars)(['MISSING_VAR_XYZ'])).toThrow('Missing required environment variables: MISSING_VAR_XYZ');
    });
});
describe('clampPagination', () => {
    it('returns defaults when no args', () => {
        expect((0, index_1.clampPagination)()).toEqual({ page: 1, limit: 20 });
    });
    it('clamps page to minimum 1', () => {
        expect((0, index_1.clampPagination)(-5, 10)).toEqual({ page: 1, limit: 10 });
    });
    it('clamps limit to max 100', () => {
        expect((0, index_1.clampPagination)(1, 500)).toEqual({ page: 1, limit: 100 });
    });
    it('parses string values', () => {
        expect((0, index_1.clampPagination)('3', '25')).toEqual({ page: 3, limit: 25 });
    });
    it('handles NaN gracefully', () => {
        expect((0, index_1.clampPagination)('abc', 'xyz')).toEqual({ page: 1, limit: 20 });
    });
});
