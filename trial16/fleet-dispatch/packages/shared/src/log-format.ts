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

// TRACED: FD-MON-002
export function formatLogEntry(entry: Partial<LogEntry>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level: entry.level ?? 'info',
    message: entry.message ?? '',
    correlationId: entry.correlationId,
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: entry.duration,
    userId: entry.userId,
    tenantId: entry.tenantId,
  };
}
