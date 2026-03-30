/** Build Prisma skip/take from page/limit — TRACED:EM-API-004 */
export function buildPagination(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
