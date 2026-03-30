export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  tenantId?: string;
}

/** Formats a structured log entry for Pino-compatible JSON logging */
export function formatLogEntry(entry: Partial<LogEntry>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level: entry.level ?? 'info',
    message: entry.message ?? '',
    ...entry,
  };
}
