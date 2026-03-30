// TRACED:EM-AUTH-007 TRACED:EM-SEC-003
// Login rate limit configuration: 10 requests per 60 seconds
// Login rate limit config
export const LOGIN_RATE_LIMIT = { default: { ttl: 60000, limit: 10 } };
