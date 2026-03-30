// Jest global setup - runs before any test file is loaded
process.env.JWT_SECRET = 'test-jwt-secret-for-fleet-dispatch-minimum-32-chars';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV = 'test';
