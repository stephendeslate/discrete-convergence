# Stage 1: deps — install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY turbo.json pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

# Stage 2: build — compile
FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm turbo run build

# Stage 3: production — runtime
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
USER node
COPY --from=build --chown=node:node /app .
EXPOSE 3001
HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1
LABEL maintainer="analytics-engine"
CMD ["node", "apps/api/dist/main.js"]
