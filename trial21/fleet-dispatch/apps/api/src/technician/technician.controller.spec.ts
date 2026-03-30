import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { createTestTechnician, TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';
import { Request } from 'express';

describe('TechnicianController', () => {
  let controller: TechnicianController;
  let service: jest.Mocked<TechnicianService>;

  const mockUser = {
    sub: 'user-1',
    email: 'admin@test.com',
    role: 'ADMIN',
    companyId: COMPANY_ID,
    tenantId: TENANT_ID,
  };

  function mockRequest(): Request {
    return { user: mockUser } as unknown as Request;
  }

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      findAvailable: jest.fn(),
      getSchedule: jest.fn(),
      updateGps: jest.fn(),
    } as unknown as jest.Mocked<TechnicianService>;
    controller = new TechnicianController(service);
  });

  describe('create', () => {
    it('should delegate to service with tenant context', async () => {
      const tech = createTestTechnician();
      service.create.mockResolvedValue(tech);

      const result = await controller.create(mockRequest(), {
        firstName: 'John',
        lastName: 'Tech',
        email: 'john@test.com',
        phone: '555-0200',
      });

      expect(service.create).toHaveBeenCalledWith(
        TENANT_ID,
        COMPANY_ID,
        expect.objectContaining({ firstName: 'John' }),
      );
      expect(result.firstName).toBe(tech.firstName);
    });
  });

  describe('findAvailable', () => {
    it('should return available technicians', async () => {
      const techs = [createTestTechnician()];
      service.findAvailable.mockResolvedValue(techs);

      const result = await controller.findAvailable(mockRequest());

      expect(service.findAvailable).toHaveBeenCalledWith(TENANT_ID);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return technician by id', async () => {
      const tech = createTestTechnician();
      service.findOne.mockResolvedValue(tech);

      const result = await controller.findOne(mockRequest(), tech.id);

      expect(service.findOne).toHaveBeenCalledWith(TENANT_ID, tech.id);
      expect(result.id).toBe(tech.id);
    });
  });

  describe('updateGps', () => {
    it('should update GPS coordinates', async () => {
      const tech = createTestTechnician({ latitude: 40.7128, longitude: -74.006 });
      service.updateGps.mockResolvedValue(tech);

      const result = await controller.updateGps(
        mockRequest(),
        tech.id,
        { latitude: 40.7128, longitude: -74.006 },
      );

      expect(service.updateGps).toHaveBeenCalledWith(
        TENANT_ID,
        tech.id,
        40.7128,
        -74.006,
      );
      expect(result.latitude).toBe(40.7128);
    });
  });
});
