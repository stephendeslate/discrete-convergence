// TRACED:EM-LOG-001 — Formats structured log entries for Pino output
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

export function formatLogEntry(fields: Omit<LogEntry, 'timestamp'>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    ...fields,
  };
}
