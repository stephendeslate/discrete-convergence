/**
 * Validate that required environment variables are set and non-empty.
 * Throws on first missing or empty variable — call at application startup.
 */
export function validateEnvVars(requiredVars: string[]): void {
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      throw new Error(
        `Missing required environment variable: ${varName}. Set it before starting the application.`,
      );
    }
  }
}
