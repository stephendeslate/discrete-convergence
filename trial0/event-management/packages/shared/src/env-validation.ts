// TRACED:EM-ENV-001 — Validates required environment variables at startup
export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
