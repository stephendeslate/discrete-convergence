// TRACED:FD-LOG-001
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
): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    context,
  };
  return JSON.stringify(entry);
}
