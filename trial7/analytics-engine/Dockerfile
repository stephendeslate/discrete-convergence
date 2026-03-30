# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN corepack enable && pnpm turbo run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

LABEL maintainer="analytics-engine-team"

RUN addgroup -g 1001 -S appgroup && adduser -S node -u 1001

COPY --from=build --chown=node:appgroup /app/apps/api/dist ./dist
COPY --from=build --chown=node:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=node:appgroup /app/apps/api/prisma ./prisma

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
