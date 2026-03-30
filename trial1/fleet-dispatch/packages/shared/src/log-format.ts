interface LogEntryInput {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  correlationId: string;
}

export function formatLogEntry(input: LogEntryInput): string {
  return JSON.stringify({
    method: input.method,
    url: input.url,
    statusCode: input.statusCode,
    duration: `${input.duration}ms`,
    correlationId: input.correlationId,
    timestamp: new Date().toISOString(),
  });
}
