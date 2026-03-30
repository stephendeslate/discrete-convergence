/**
 * Validate that required environment variables are set at startup.
 * Throws an error listing all missing variables — no fallback values.
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
