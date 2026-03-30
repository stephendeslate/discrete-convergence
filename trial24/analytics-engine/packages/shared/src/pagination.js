"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampPagination = clampPagination;
const index_1 = require("./index");
function clampPagination(page, limit) {
    const clampedPage = Math.max(index_1.MIN_PAGE, Math.floor(page ?? index_1.MIN_PAGE));
    const clampedLimit = Math.min(index_1.MAX_PAGE_SIZE, Math.max(1, Math.floor(limit ?? index_1.DEFAULT_PAGE_SIZE)));
    return { page: clampedPage, limit: clampedLimit };
}
//# sourceMappingURL=pagination.js.map