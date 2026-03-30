export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId?: string;
  context?: string;
  [key: string]: unknown;
}

export function formatLogEntry(
  level: string,
  message: string,
  correlationId?: string,
  context?: string,
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    context,
  };
}
