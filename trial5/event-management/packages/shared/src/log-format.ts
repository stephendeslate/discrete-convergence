// TRACED:EM-MON-002 — Structured log entry formatting
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

export function formatLogEntry(fields: Partial<LogEntry> & { message: string; level: string }): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    ...fields,
  };
  return JSON.stringify(entry);
}
