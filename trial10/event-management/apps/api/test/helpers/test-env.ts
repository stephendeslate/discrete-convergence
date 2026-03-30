process.env['JWT_SECRET'] = 'test-secret-key-for-integration-tests';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-for-integration-tests';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test?connection_limit=1';
