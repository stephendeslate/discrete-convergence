export interface PaginationParams {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
}
export declare function parsePagination(page?: number, pageSize?: number): PaginationParams;
