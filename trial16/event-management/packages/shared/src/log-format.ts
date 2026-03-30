// TRACED: EM-MON-003
import { LogEntry } from './types';

/** Format a log entry as a JSON string */
export function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  });
}
