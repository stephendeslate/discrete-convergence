// TRACED: FD-INFRA-002
export function validateEnvVars(required: string[]): void {
  const missing: string[] = [];
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}
