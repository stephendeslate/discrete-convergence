/**
 * Validates that all required environment variables are present at startup.
 * Throws an error with a list of missing variables if any are absent.
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter((varName) => {
    const value = process.env[varName];
    return value === undefined || value === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
