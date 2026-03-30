export interface LogEntry {
  timestamp: string;
  level: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  correlationId?: string;
  message?: string;
}

/** Format a structured log entry as JSON string */
export function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: entry.duration,
    correlationId: entry.correlationId,
    message: entry.message,
  });
}
