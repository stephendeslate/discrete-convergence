// TRACED:EM-MON-002 — structured log entry format for RequestLoggingMiddleware
export function formatLogEntry(data: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId: string;
}): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    level: data.statusCode >= 500 ? 'error' : data.statusCode >= 400 ? 'warn' : 'info',
    method: data.method,
    url: data.url,
    statusCode: data.statusCode,
    duration: `${data.duration}ms`,
    correlationId: data.correlationId,
  };
}
