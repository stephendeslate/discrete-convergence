import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';
import { Request } from 'express';

describe('AuditController', () => {
  let controller: AuditController;
  let service: jest.Mocked<AuditService>;

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
      findAll: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;
    controller = new AuditController(service);
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const paginated = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(mockRequest(), { page: 1, limit: 20 });

      expect(service.findAll).toHaveBeenCalledWith(TENANT_ID, 1, 20);
      expect(result.total).toBe(0);
    });
  });
});
