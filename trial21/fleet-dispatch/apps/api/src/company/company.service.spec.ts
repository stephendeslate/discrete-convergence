import { CompanyService } from './company.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { createTestCompany, COMPANY_ID } from '../../test/helpers/factories';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CompanyService(prisma as never);
  });

  describe('getCompany', () => {
    it('should return company by id', async () => {
      const company = createTestCompany();
      prisma.company.findUnique.mockResolvedValue(company);

      const result = await service.getCompany(COMPANY_ID);
      expect(result.name).toBe('Test Company');
    });

    it('should throw for missing company', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.getCompany('missing')).rejects.toThrow(
        'Company not found',
      );
    });
  });

  describe('updateCompany', () => {
    it('should update company fields', async () => {
      const company = createTestCompany();
      prisma.company.findUnique.mockResolvedValue(company);
      prisma.company.update.mockResolvedValue({
        ...company,
        name: 'Updated',
      });

      const result = await service.updateCompany(COMPANY_ID, {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw for missing company on update', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCompany('missing', { name: 'X' }),
      ).rejects.toThrow('Company not found');
    });
  });
});
