// TRACED:EM-INFRA-001 — startup env validation with process.exit(1) on missing vars
export function validateEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    process.stderr.write(message + '\n');
    process.exit(1);
  }
}
