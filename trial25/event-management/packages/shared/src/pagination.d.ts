export declare const MAX_PAGE_SIZE = 100;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MIN_PAGE = 1;
export interface PaginationParams {
    page: number;
    pageSize: number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
export declare function clampPagination(params: Partial<PaginationParams>): PaginationParams;
