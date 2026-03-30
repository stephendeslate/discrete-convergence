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
export declare function formatLogEntry(entry: Partial<LogEntry>): LogEntry;
