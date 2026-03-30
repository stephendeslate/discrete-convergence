export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId?: string;
  context?: Record<string, unknown>;
}

export function formatLogEntry(
  level: string,
  message: string,
  correlationId?: string,
  context?: Record<string, unknown>,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (correlationId !== undefined) {
    entry.correlationId = correlationId;
  }

  if (context !== undefined) {
    entry.context = context;
  }

  return entry;
}
