import { validateEnvVars } from '../src/env-validation';

describe('validateEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should not throw when all vars are present', () => {
    process.env.TEST_VAR = 'value';
    expect(() => validateEnvVars(['TEST_VAR'])).not.toThrow();
  });

  it('should throw when a required var is missing', () => {
    delete process.env.MISSING_VAR;
    expect(() => validateEnvVars(['MISSING_VAR'])).toThrow('Missing required environment variables: MISSING_VAR');
  });

  it('should throw when a required var is empty string', () => {
    process.env.EMPTY_VAR = '';
    expect(() => validateEnvVars(['EMPTY_VAR'])).toThrow('Missing required environment variables: EMPTY_VAR');
  });

  it('should list all missing vars', () => {
    delete process.env.A;
    delete process.env.B;
    expect(() => validateEnvVars(['A', 'B'])).toThrow('A, B');
  });
});
