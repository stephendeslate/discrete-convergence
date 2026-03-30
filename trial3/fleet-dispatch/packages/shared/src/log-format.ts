export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
}

export interface LogEntryInput {
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
}

// TRACED:FD-MON-004
export function formatLogEntry(fields: LogEntryInput): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    ...fields,
  };
}
