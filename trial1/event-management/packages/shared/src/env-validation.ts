export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    process.stderr.write(message + '\n');
    process.exit(1);
  }
}
