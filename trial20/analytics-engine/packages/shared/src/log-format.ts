// TRACED: AE-MON-003
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

// TRACED: AE-MON-004
export function formatLogEntry(
  level: string,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
}
