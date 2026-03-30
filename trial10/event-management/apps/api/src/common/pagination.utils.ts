export function parsePaginationParams(
  page?: string,
  limit?: string,
): { page: number | undefined; limit: number | undefined } {
  return {
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  };
}
