// TRACED:AE-ENV-001 — Environment variable validation

export function validateEnvVars(keys: string[]): void {
  const missing: string[] = [];
  for (const key of keys) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
