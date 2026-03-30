import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  organization: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(OrganizationService);
  });

  it('should return organization', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1', name: 'Acme' });
    const result = await service.findMine('org1');
    expect(result.name).toBe('Acme');
  });

  it('should throw when organization not found', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue(null);
    await expect(service.findMine('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update organization', async () => {
    mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org1' });
    mockPrisma.organization.update.mockResolvedValue({ id: 'org1', name: 'New Name' });
    const result = await service.update('org1', { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });
});
