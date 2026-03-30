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

// TRACED: FD-MON-002
export function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  });
}
