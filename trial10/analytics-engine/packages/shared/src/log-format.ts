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

/**
 * Formats a structured log entry as a JSON string.
 * Used by RequestLoggingMiddleware for consistent log output.
 */
export function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  });
}
