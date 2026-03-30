// TRACED:TEST-ENV-SETUP — Jest environment setup for integration tests
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-jwt-secret-for-integration-tests';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://test:test@localhost:5432/test';
process.env['NODE_ENV'] = 'test';
