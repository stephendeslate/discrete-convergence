/**
 * Validates that all required environment variables are set at startup.
 * Throws an error listing missing variables if any are absent.
 */
export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === '';
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
