import { PhotoService } from './photo.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { createTestWorkOrder, TENANT_ID } from '../../test/helpers/factories';

describe('PhotoService', () => {
  let service: PhotoService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new PhotoService(prisma as never);
  });

  describe('create', () => {
    it('should create a photo for work order', async () => {
      const wo = createTestWorkOrder();
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.jobPhoto.create.mockResolvedValue({
        id: 'photo-1',
        url: 'https://example.com/photo.jpg',
        caption: 'Before',
        workOrderId: wo.id,
        uploadedBy: 'user-1',
        createdAt: new Date(),
      });

      const result = await service.create(TENANT_ID, wo.id, 'user-1', {
        url: 'https://example.com/photo.jpg',
        caption: 'Before',
      });

      expect(result.url).toBe('https://example.com/photo.jpg');
    });

    it('should throw for missing work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.create(TENANT_ID, 'missing', 'user-1', {
          url: 'https://example.com/photo.jpg',
        }),
      ).rejects.toThrow('Work order not found');
    });
  });

  describe('findByWorkOrder', () => {
    it('should return photos for work order', async () => {
      const wo = createTestWorkOrder();
      prisma.workOrder.findUnique.mockResolvedValue(wo);
      prisma.jobPhoto.findMany.mockResolvedValue([]);

      const result = await service.findByWorkOrder(TENANT_ID, wo.id);
      expect(result).toEqual([]);
    });
  });
});
