# TRACED: FD-INF-007 — Multi-stage Dockerfile for production
# Stage 1: Install dependencies
FROM node:20-alpine AS install
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=install /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

RUN pnpm --filter @fleet-dispatch/api exec prisma generate
RUN pnpm --filter @fleet-dispatch/api run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

LABEL org.opencontainers.image.title="fleet-dispatch-api"
LABEL org.opencontainers.image.description="Fleet Dispatch Platform API"
LABEL org.opencontainers.image.version="1.0.0"

COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules/ node_modules/
COPY --from=build /app/apps/api/dist/ apps/api/dist/
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/node_modules/ apps/api/node_modules/
COPY --from=build /app/apps/api/prisma/ apps/api/prisma/
COPY --from=build /app/packages/shared/ packages/shared/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy 2>/dev/null; cd /app && node apps/api/dist/main.js"]
