export const APP_VERSION = '1.0.0';
export const BCRYPT_SALT_ROUNDS = 12;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
export const JWT_EXPIRY = '1h';
export const CORRELATION_HEADER = 'x-correlation-id';
export const HEALTH_CHECK_TIMEOUT = 3000;
export const RATE_LIMIT_TTL = 60000;
export const RATE_LIMIT_MAX = 20000;

export function sanitizeLogValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(
      /("(?:password|secret|token|authorization|cookie|apiKey|configEncrypted)"\s*:\s*)"[^"]*"/gi,
      '$1"[REDACTED]"',
    );
  }
  return value;
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

export function clampPage(page: number): number {
  return Math.max(1, Math.floor(page));
}

export function clampPageSize(size: number): number {
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(size)));
}

export function validateEnvVars(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export enum DashboardStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum DataSourceType {
  REST_API = 'REST_API',
  POSTGRESQL = 'POSTGRESQL',
  CSV = 'CSV',
  WEBHOOK = 'WEBHOOK',
}

export enum SyncStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum WidgetType {
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  AREA_CHART = 'AREA_CHART',
  KPI_CARD = 'KPI_CARD',
  TABLE = 'TABLE',
  FUNNEL = 'FUNNEL',
}
