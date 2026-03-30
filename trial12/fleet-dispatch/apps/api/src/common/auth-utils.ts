// TRACED: FD-SEC-004
export interface RequestWithUser {
  user: {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
  };
  correlationId?: string;
  body: unknown;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
}
