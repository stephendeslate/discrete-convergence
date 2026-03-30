/**
 * Build a paginated response object.
 * TRACED:FD-PERF-003
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  take: number,
): { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } } {
  return {
    data,
    meta: {
      page,
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
}
