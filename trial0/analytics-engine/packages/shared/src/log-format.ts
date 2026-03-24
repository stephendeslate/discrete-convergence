// TRACED:AE-LOG-001 — Formats structured log entries for Pino output
export interface LogEntry {
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export function formatLogEntry(entry: LogEntry): string {
  const timestamp = entry.timestamp ?? new Date().toISOString();
  const base = {
    timestamp,
    level: entry.level,
    message: entry.message,
    correlationId: entry.correlationId,
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: entry.duration,
  };
  return JSON.stringify(base);
}
