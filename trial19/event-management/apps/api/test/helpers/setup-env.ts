// This file must be loaded via jest setupFilesAfterEnv BEFORE any module imports
process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-integration-tests';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
