"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
const constants_1 = require("./constants");
function parsePagination(page, limit) {
    const safePage = Math.max(1, page ?? 1);
    const safeLimit = Math.min(constants_1.MAX_PAGE_SIZE, Math.max(1, limit ?? constants_1.DEFAULT_PAGE_SIZE));
    return {
        page: safePage,
        limit: safeLimit,
        skip: (safePage - 1) * safeLimit,
    };
}
