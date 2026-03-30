interface LogEntry {
  level: string;
  message: string;
  correlationId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export function formatLogEntry(entry: LogEntry): string {
  const ts = entry.timestamp ?? new Date().toISOString();
  const cid = entry.correlationId ?? 'no-correlation';
  return JSON.stringify({ ...entry, timestamp: ts, correlationId: cid });
}
