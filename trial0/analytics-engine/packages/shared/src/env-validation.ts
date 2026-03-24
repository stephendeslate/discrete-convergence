// TRACED:AE-ENV-001 — Validates required environment variables at startup
export function validateEnvVars(required: string[]): void {
  const missing: string[] = [];
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
