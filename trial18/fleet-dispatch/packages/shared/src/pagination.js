"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
const constants_1 = require("./constants");
function parsePagination(page, pageSize) {
    const safePage = Math.max(1, page ?? 1);
    const safePageSize = Math.min(constants_1.MAX_PAGE_SIZE, Math.max(1, pageSize ?? constants_1.DEFAULT_PAGE_SIZE));
    return {
        page: safePage,
        pageSize: safePageSize,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
    };
}
//# sourceMappingURL=pagination.js.map