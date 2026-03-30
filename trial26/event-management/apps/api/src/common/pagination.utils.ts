// TRACED:EM-DATA-004
import { clampPagination, PaginatedResult } from '@repo/shared';

interface PaginationInput {
  page?: number;
  pageSize?: number;
}

/** Build pagination metadata from query params */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  input: PaginationInput,
): PaginatedResult<T> {
  const { page, pageSize } = clampPagination(input);
  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/** Calculate skip value for Prisma queries */
export function calculateSkip(input: PaginationInput): { skip: number; take: number } {
  const { page, pageSize } = clampPagination(input);
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
