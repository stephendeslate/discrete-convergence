import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { createTestInvoice, TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';
import { Request } from 'express';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: jest.Mocked<InvoiceService>;

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
      createFromWorkOrder: jest.fn(),
      send: jest.fn(),
      markPaid: jest.fn(),
      void: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<InvoiceService>;
    controller = new InvoiceController(service);
  });

  describe('create', () => {
    it('should delegate invoice creation to service', async () => {
      const invoice = createTestInvoice();
      service.createFromWorkOrder.mockResolvedValue({ ...invoice, lineItems: [] } as never);

      const result = await controller.create(
        mockRequest(),
        'wo-1',
        { lineItems: [{ type: 'LABOR' as never, description: 'Service', quantity: 1, unitPrice: 100 }] },
      );

      expect(service.createFromWorkOrder).toHaveBeenCalledWith(
        TENANT_ID,
        COMPANY_ID,
        'wo-1',
        expect.objectContaining({ lineItems: expect.arrayContaining([]) }),
      );
      expect(result.sequenceNumber).toBeDefined();
    });
  });

  describe('send', () => {
    it('should delegate send to service', async () => {
      const invoice = createTestInvoice({ status: 'SENT' });
      service.send.mockResolvedValue(invoice as never);

      const result = await controller.send(mockRequest(), invoice.id);

      expect(service.send).toHaveBeenCalledWith(TENANT_ID, invoice.id);
      expect(result.status).toBe('SENT');
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      const paginated = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(mockRequest(), { page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith(TENANT_ID, 1, 10);
      expect(result.total).toBe(0);
    });
  });
});
