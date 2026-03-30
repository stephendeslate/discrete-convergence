// Set environment variables required by integration tests
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-jest';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
