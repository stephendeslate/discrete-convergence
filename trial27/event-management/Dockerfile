# TRACED: EM-INFRA-007 — Multi-stage Dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS install
LABEL maintainer="event-management-team"
LABEL description="Event Management Platform API"

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM install AS build
COPY . .
RUN pnpm --filter @event-management/api exec prisma generate
RUN pnpm --filter @event-management/shared build
RUN pnpm --filter @event-management/api build

# Stage 3: Production
FROM node:20-alpine AS production
LABEL maintainer="event-management-team"
LABEL description="Event Management Platform API"

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
COPY --from=build --chown=appuser:appgroup /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=appuser:appgroup /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=appuser:appgroup /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/packages/shared ./packages/shared
COPY --from=build --chown=appuser:appgroup /app/package.json ./

USER appuser
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy 2>/dev/null; cd /app && node apps/api/dist/main.js"]
