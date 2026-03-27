# Stage 1: Install dependencies
FROM node:20-alpine AS install
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM install AS build
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
RUN cd apps/api && npx prisma generate
RUN pnpm --filter @analytics-engine/api build

# Stage 3: Production
FROM node:20-alpine AS production
LABEL maintainer="analytics-engine-team"
WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules/ node_modules/
COPY --from=build /app/apps/api/dist/ apps/api/dist/
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/node_modules/ apps/api/node_modules/
COPY --from=build /app/apps/api/prisma/ apps/api/prisma/
COPY --from=build /app/packages/shared/ packages/shared/

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy 2>/dev/null; cd /app && node apps/api/dist/main.js"]
