// TRACED: FD-MON-003
export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  context?: Record<string, unknown>;
}

// TRACED: FD-MON-004
export function formatLogEntry(entry: Partial<LogEntry>): LogEntry {
  return {
    level: entry.level ?? 'info',
    message: entry.message ?? '',
    timestamp: entry.timestamp ?? new Date().toISOString(),
    correlationId: entry.correlationId,
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: entry.duration,
    context: entry.context,
  };
}
