// TRACED: EM-MON-002
export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  context?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  tenantId?: string;
}

// TRACED: EM-MON-003
export function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  });
}
