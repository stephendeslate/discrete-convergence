"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_PAGE = exports.DEFAULT_PAGE_SIZE = exports.MAX_PAGE_SIZE = void 0;
exports.clampPagination = clampPagination;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_PAGE_SIZE = 20;
exports.MIN_PAGE = 1;
function clampPagination(params) {
    const page = Math.max(exports.MIN_PAGE, Math.floor(params.page ?? exports.MIN_PAGE));
    const pageSize = Math.min(exports.MAX_PAGE_SIZE, Math.max(1, Math.floor(params.pageSize ?? exports.DEFAULT_PAGE_SIZE)));
    return { page, pageSize };
}
//# sourceMappingURL=pagination.js.map