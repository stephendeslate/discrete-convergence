import { clampPagination } from '@fleet-dispatch/shared';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface PaginatableDelegate {
  findMany(args: object): Promise<unknown[]>;
  count(args: object): Promise<number>;
}

export async function paginatedQuery<T>(
  delegate: PaginatableDelegate,
  where: Record<string, unknown>,
  page: number | undefined,
  limit: number | undefined,
  extras?: Record<string, unknown>,
): Promise<PaginatedResult<T>> {
  const { page: clampedPage, limit: clampedLimit } = clampPagination(page, limit);
  const skip = (clampedPage - 1) * clampedLimit;
  const [items, total] = await Promise.all([
    delegate.findMany({ where, skip, take: clampedLimit, orderBy: { createdAt: 'desc' }, ...extras }),
    delegate.count({ where }),
  ]);
  return { items: items as T[], total, page: clampedPage, limit: clampedLimit };
}
