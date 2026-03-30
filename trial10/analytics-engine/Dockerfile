# TRACED: AE-INFRA-001
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

RUN pnpm turbo run build

FROM node:20-alpine AS production
WORKDIR /app

LABEL maintainer="analytics-engine-team"

RUN addgroup --system --gid 1001 nodejs
USER node

COPY --from=build --chown=node:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=node:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=node:nodejs /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
