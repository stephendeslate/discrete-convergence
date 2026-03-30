// TRACED:FD-INF-001 — environment variable validation at startup
export function validateEnvVars(required: string[]): void {
  const missing: string[] = [];
  for (const envVar of required) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
