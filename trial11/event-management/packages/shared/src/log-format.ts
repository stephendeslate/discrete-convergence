// TRACED: EM-MON-002
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

// TRACED: EM-MON-003
export function formatLogEntry(entry: Partial<LogEntry>): string {
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    level: entry.level ?? 'info',
    message: entry.message ?? '',
    ...entry,
  };
  return JSON.stringify(log);
}
