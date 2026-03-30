// TRACED:EM-API-005 — Pagination result builder for list endpoints
export function paginatedResult<T>(data: T[], total: number, skip: number, take: number) {
  return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
}
