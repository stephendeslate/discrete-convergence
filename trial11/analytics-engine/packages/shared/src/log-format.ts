// TRACED: AE-MON-003
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
  context?: Record<string, unknown>;
}

// TRACED: AE-MON-004
export function formatLogEntry(params: {
  level: string;
  message: string;
  correlationId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  tenantId?: string;
  context?: Record<string, unknown>;
}): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level: params.level,
    message: params.message,
    correlationId: params.correlationId,
    method: params.method,
    url: params.url,
    statusCode: params.statusCode,
    duration: params.duration,
    userId: params.userId,
    tenantId: params.tenantId,
    context: params.context,
  };
}
