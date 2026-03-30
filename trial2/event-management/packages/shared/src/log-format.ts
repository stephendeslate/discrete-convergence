/**
 * Formats a structured log entry for consistent logging.
 */
export function formatLogEntry(entry: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId: string;
}): string {
  return JSON.stringify({
    method: entry.method,
    url: entry.url,
    statusCode: entry.statusCode,
    duration: `${entry.duration}ms`,
    correlationId: entry.correlationId,
    timestamp: new Date().toISOString(),
  });
}
