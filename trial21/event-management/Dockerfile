# Stage 1: Build — TRACED:EM-INF-008
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
RUN pnpm --filter @event-management/shared run build

COPY apps/api/ apps/api/
RUN cd apps/api && npx prisma generate
RUN pnpm --filter @event-management/api run build

# Stage 2: Production — TRACED:EM-INF-009
FROM node:20-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/shared/dist/ packages/shared/dist/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist/ apps/api/dist/
COPY --from=builder /app/apps/api/prisma/ apps/api/prisma/
COPY --from=builder /app/apps/api/node_modules/.prisma/ apps/api/node_modules/.prisma/

ENV PORT=3001
EXPOSE 3001

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
