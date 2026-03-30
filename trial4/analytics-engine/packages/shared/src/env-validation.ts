/**
 * Validates that all required environment variables are present at startup.
 * Throws an error listing all missing variables if any are absent.
 */
export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
