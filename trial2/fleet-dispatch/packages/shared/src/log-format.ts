/**
 * Format a structured log entry for Pino-compatible JSON logging.
 */
export function formatLogEntry(data: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId: string;
}): Record<string, unknown> {
  return {
    msg: `${data.method} ${data.url} ${data.statusCode}`,
    method: data.method,
    url: data.url,
    statusCode: data.statusCode,
    duration: data.duration,
    correlationId: data.correlationId,
    timestamp: new Date().toISOString(),
  };
}
