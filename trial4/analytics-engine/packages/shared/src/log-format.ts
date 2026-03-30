export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

/** Format a structured log entry for Pino JSON logging */
export function formatLogEntry(fields: Partial<LogEntry> & { message: string; level: string }): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    ...fields,
  };
}
