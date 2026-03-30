// TRACED: AE-MON-004
export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  context?: string;
}

export function formatLogEntry(fields: Partial<LogEntry> & { message: string }): LogEntry {
  return {
    level: fields.level ?? 'info',
    message: fields.message,
    timestamp: new Date().toISOString(),
    correlationId: fields.correlationId,
    method: fields.method,
    url: fields.url,
    statusCode: fields.statusCode,
    duration: fields.duration,
    context: fields.context,
  };
}
