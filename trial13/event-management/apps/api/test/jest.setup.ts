// Set environment variables before any test modules are loaded
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-for-integration-tests';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
