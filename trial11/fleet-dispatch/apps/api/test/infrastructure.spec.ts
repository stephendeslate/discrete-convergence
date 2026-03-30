import * as fs from 'fs';
import * as path from 'path';

// TRACED: FD-INFRA-001
// TRACED: FD-INFRA-002
// TRACED: FD-INFRA-003
// TRACED: FD-INFRA-004
// TRACED: FD-INFRA-005
// TRACED: FD-INFRA-006
// TRACED: FD-INFRA-009

describe('Infrastructure Verification', () => {
  const rootDir = path.resolve(__dirname, '../../..');

  describe('Dockerfile', () => {
    let dockerfile: string;

    beforeAll(() => {
      dockerfile = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf-8');
    });

    it('FD-INFRA-001: Multi-stage Dockerfile with deps, build, production stages', () => {
      expect(dockerfile).toContain('FROM node:20-alpine AS deps');
      expect(dockerfile).toContain('FROM node:20-alpine AS build');
      expect(dockerfile).toContain('FROM node:20-alpine AS production');
    });

    it('FD-INFRA-002: Uses node:20-alpine with USER node', () => {
      expect(dockerfile).toContain('node:20-alpine');
      expect(dockerfile).toContain('USER node');
    });

    it('FD-INFRA-003: Includes HEALTHCHECK and LABEL maintainer', () => {
      expect(dockerfile).toContain('HEALTHCHECK');
      expect(dockerfile).toContain('LABEL maintainer');
    });
  });

  describe('Docker Compose', () => {
    let compose: string;

    beforeAll(() => {
      compose = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf-8');
    });

    it('FD-INFRA-004: docker-compose.yml with PostgreSQL 16 service', () => {
      expect(compose).toContain('postgres:16');
      expect(compose).toContain('db:');
      expect(compose).toContain('api:');
    });

    it('FD-INFRA-005: PostgreSQL healthcheck and named volume', () => {
      expect(compose).toContain('healthcheck:');
      expect(compose).toContain('pg_isready');
      expect(compose).toContain('pgdata:');
      expect(compose).toContain('volumes:');
    });
  });

  describe('CI Pipeline', () => {
    let ci: string;

    beforeAll(() => {
      ci = fs.readFileSync(
        path.join(rootDir, '.github/workflows/ci.yml'),
        'utf-8',
      );
    });

    it('FD-INFRA-006: GitHub Actions CI with lint, test, build, typecheck, audit', () => {
      expect(ci).toContain('pnpm turbo run lint');
      expect(ci).toContain('pnpm turbo run typecheck');
      expect(ci).toContain('pnpm turbo run test');
      expect(ci).toContain('pnpm turbo run build');
      expect(ci).toContain('pnpm audit');
    });
  });

  describe('Environment Configuration', () => {
    let envExample: string;

    beforeAll(() => {
      envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
    });

    it('FD-INFRA-009: .env.example has all required variables', () => {
      expect(envExample).toContain('DATABASE_URL');
      expect(envExample).toContain('JWT_SECRET');
      expect(envExample).toContain('CORS_ORIGIN');
      expect(envExample).toContain('PORT');
      expect(envExample).toContain('API_URL');
      expect(envExample).toContain('NODE_ENV');
    });
  });
});
