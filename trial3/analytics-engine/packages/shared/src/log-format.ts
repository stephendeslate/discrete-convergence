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
  [key: string]: unknown;
}

/**
 * Formats a structured log entry for Pino-compatible JSON logging.
 */
export function formatLogEntry(fields: Partial<LogEntry> & { message: string; level: string }): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    ...fields,
  };
}
