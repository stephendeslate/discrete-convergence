export interface LogEntry {
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  timestamp: string;
}

export function formatLogEntry(
  level: string,
  message: string,
  context?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
}
