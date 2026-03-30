"use strict";
// TRACED:AE-PAG-001 — Pagination types and utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampPagination = clampPagination;
const index_1 = require("./index");
function clampPagination(page, limit) {
    const safePage = Math.max(index_1.MIN_PAGE, page ?? index_1.MIN_PAGE);
    const safeLimit = Math.min(index_1.MAX_PAGE_SIZE, Math.max(1, limit ?? index_1.DEFAULT_PAGE_SIZE));
    const skip = (safePage - 1) * safeLimit;
    return { page: safePage, limit: safeLimit, skip };
}
