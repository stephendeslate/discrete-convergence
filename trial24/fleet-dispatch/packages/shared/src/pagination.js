"use strict";
// TRACED:SHARED-PAGINATION
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_PAGE = exports.DEFAULT_PAGE_SIZE = exports.MAX_PAGE_SIZE = void 0;
exports.clampPagination = clampPagination;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_PAGE_SIZE = 20;
exports.MIN_PAGE = 1;
function clampPagination(page, limit) {
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : (page ?? exports.MIN_PAGE);
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : (limit ?? exports.DEFAULT_PAGE_SIZE);
    return {
        page: Math.max(exports.MIN_PAGE, Number.isFinite(parsedPage) ? parsedPage : exports.MIN_PAGE),
        limit: Math.min(exports.MAX_PAGE_SIZE, Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : exports.DEFAULT_PAGE_SIZE)),
    };
}
