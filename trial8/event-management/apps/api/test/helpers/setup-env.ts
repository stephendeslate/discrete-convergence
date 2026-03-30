// This file runs before module resolution to ensure env vars are available
// when AppModule's @Module() decorator evaluates JwtModule.register()
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
