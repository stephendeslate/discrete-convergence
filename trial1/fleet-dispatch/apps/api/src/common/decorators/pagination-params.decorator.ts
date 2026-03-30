// TRACED:FD-PERF-010 — @PaginationParams() decorator extracts page/pageSize from query string
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationInput {
  page: number | undefined;
  pageSize: number | undefined;
}

export const PaginationParams = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PaginationInput => {
    const request = ctx.switchToHttp().getRequest();
    const rawPage = request.query?.page;
    const rawPageSize = request.query?.pageSize;
    return {
      page: rawPage ? Number(rawPage) : undefined,
      pageSize: rawPageSize ? Number(rawPageSize) : undefined,
    };
  },
);
