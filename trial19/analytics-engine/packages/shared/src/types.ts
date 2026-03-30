export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export enum DashboardStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
}

export enum DataSourceType {
  POSTGRESQL = 'POSTGRESQL',
  MYSQL = 'MYSQL',
  REST_API = 'REST_API',
  CSV = 'CSV',
}

export enum WidgetType {
  CHART = 'CHART',
  TABLE = 'TABLE',
  METRIC = 'METRIC',
  MAP = 'MAP',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
