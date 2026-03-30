/**
 * Validate that all required environment variables are present at startup.
 * Throws an error listing all missing variables if any are absent.
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
