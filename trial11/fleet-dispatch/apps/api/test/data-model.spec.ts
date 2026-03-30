import * as fs from 'fs';
import * as path from 'path';

// TRACED: FD-DATA-001
// TRACED: FD-DATA-002
// TRACED: FD-DATA-003
// TRACED: FD-DATA-004
// TRACED: FD-DATA-005
// TRACED: FD-DATA-006
// TRACED: FD-DATA-007
// TRACED: FD-DATA-008
// TRACED: FD-DATA-009
// TRACED: FD-DATA-010
// TRACED: FD-DATA-011
// TRACED: FD-INFRA-007

describe('Data Model Verification', () => {
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  const migrationPath = path.resolve(
    __dirname,
    '../prisma/migrations/20240101000000_init/migration.sql',
  );
  let schema: string;
  let migration: string;

  beforeAll(() => {
    schema = fs.readFileSync(schemaPath, 'utf-8');
    migration = fs.readFileSync(migrationPath, 'utf-8');
  });

  describe('Entity Models', () => {
    it('FD-DATA-001: Vehicle model has @@map("vehicles") and @@index on tenantId', () => {
      expect(schema).toContain('model Vehicle');
      expect(schema).toContain('@@map("vehicles")');
      // Verify tenantId index exists in Vehicle block
      const vehicleBlock = schema.slice(
        schema.indexOf('model Vehicle'),
        schema.indexOf('model Driver'),
      );
      expect(vehicleBlock).toContain('@@index([tenantId])');
    });

    it('FD-DATA-002: Driver model has @@map("drivers") and @@index on tenantId', () => {
      expect(schema).toContain('model Driver');
      expect(schema).toContain('@@map("drivers")');
      const driverBlock = schema.slice(
        schema.indexOf('model Driver'),
        schema.indexOf('model Dispatch'),
      );
      expect(driverBlock).toContain('@@index([tenantId])');
    });

    it('FD-DATA-003: Dispatch model has @@map("dispatches") and composite index', () => {
      expect(schema).toContain('model Dispatch');
      expect(schema).toContain('@@map("dispatches")');
      const dispatchBlock = schema.slice(schema.indexOf('model Dispatch'));
      expect(dispatchBlock).toContain('@@index([tenantId, status])');
    });
  });

  describe('Enums', () => {
    it('FD-DATA-004: All enums use @@map with @map on each value', () => {
      expect(schema).toContain('@@map("user_role")');
      expect(schema).toContain('@@map("vehicle_status")');
      expect(schema).toContain('@@map("driver_status")');
      expect(schema).toContain('@@map("dispatch_status")');
      expect(schema).toContain('@map("admin")');
      expect(schema).toContain('@map("dispatcher")');
      expect(schema).toContain('@map("driver")');
      expect(schema).toContain('@map("available")');
      expect(schema).toContain('@map("in_use")');
      expect(schema).toContain('@map("maintenance")');
      expect(schema).toContain('@map("retired")');
      expect(schema).toContain('@map("active")');
      expect(schema).toContain('@map("inactive")');
      expect(schema).toContain('@map("on_leave")');
      expect(schema).toContain('@map("pending")');
      expect(schema).toContain('@map("in_transit")');
      expect(schema).toContain('@map("completed")');
      expect(schema).toContain('@map("cancelled")');
    });
  });

  describe('Indexes', () => {
    it('FD-DATA-005: @@index on tenantId for all domain models', () => {
      expect(migration).toContain('vehicles_tenant_id_idx');
      expect(migration).toContain('drivers_tenant_id_idx');
      expect(migration).toContain('dispatches_tenant_id_idx');
    });

    it('FD-DATA-006: @@index on status for Vehicle, Driver, Dispatch', () => {
      expect(migration).toContain('vehicles_status_idx');
      expect(migration).toContain('drivers_status_idx');
      expect(migration).toContain('dispatches_status_idx');
    });

    it('FD-DATA-007: Composite @@index on [tenantId, status]', () => {
      expect(migration).toContain('vehicles_tenant_id_status_idx');
      expect(migration).toContain('drivers_tenant_id_status_idx');
      expect(migration).toContain('dispatches_tenant_id_status_idx');
    });
  });

  describe('Row Level Security', () => {
    it('FD-DATA-008: ENABLE ROW LEVEL SECURITY on all domain tables', () => {
      expect(migration).toContain('ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY');
      expect(migration).toContain('ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY');
      expect(migration).toContain('ALTER TABLE "dispatches" ENABLE ROW LEVEL SECURITY');
      expect(migration).toContain('ALTER TABLE "users" ENABLE ROW LEVEL SECURITY');
    });

    it('FD-DATA-009: FORCE ROW LEVEL SECURITY on all domain tables', () => {
      expect(migration).toContain('ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY');
      expect(migration).toContain('ALTER TABLE "drivers" FORCE ROW LEVEL SECURITY');
      expect(migration).toContain('ALTER TABLE "dispatches" FORCE ROW LEVEL SECURITY');
      expect(migration).toContain('ALTER TABLE "users" FORCE ROW LEVEL SECURITY');
    });

    it('FD-DATA-010: CREATE POLICY for tenant isolation on each table', () => {
      expect(migration).toContain('CREATE POLICY "tenant_isolation_vehicles"');
      expect(migration).toContain('CREATE POLICY "tenant_isolation_drivers"');
      expect(migration).toContain('CREATE POLICY "tenant_isolation_dispatches"');
      expect(migration).toContain('CREATE POLICY "tenant_isolation_users"');
      // TEXT comparison — no ::uuid cast
      expect(migration).not.toContain('::uuid');
    });

    it('FD-INFRA-007: Migration includes RLS policies for all domain tables', () => {
      const rlsSections = migration.match(/ENABLE ROW LEVEL SECURITY/g);
      expect(rlsSections).toBeTruthy();
      expect(rlsSections!.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Monetary Fields', () => {
    it('FD-DATA-011: All monetary fields use Decimal @db.Decimal(12, 2)', () => {
      // Vehicle mileage
      expect(schema).toContain('@db.Decimal(12, 2)');
      // Migration checks
      expect(migration).toContain('DECIMAL(12,2)');
      // No Float types for monetary fields
      const vehicleBlock = schema.slice(
        schema.indexOf('model Vehicle'),
        schema.indexOf('model Driver'),
      );
      expect(vehicleBlock).not.toContain('Float');
      const dispatchBlock = schema.slice(schema.indexOf('model Dispatch'));
      expect(dispatchBlock).not.toContain('Float');
    });
  });
});
