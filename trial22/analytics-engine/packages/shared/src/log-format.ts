export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId?: string;
  context?: string;
  duration?: number;
  method?: string;
  url?: string;
  statusCode?: number;
}

export function formatLogEntry(entry: Partial<LogEntry>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level: entry.level ?? 'info',
    message: entry.message ?? '',
    correlationId: entry.correlationId,
    context: entry.context,
    duration: entry.duration,
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
  };
}
