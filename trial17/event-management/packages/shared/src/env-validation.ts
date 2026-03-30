// TRACED: EM-INFRA-001

/** Validate that required environment variables are set and non-empty */
export function validateEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value === undefined || value === '') {
      missing.push(varName);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
