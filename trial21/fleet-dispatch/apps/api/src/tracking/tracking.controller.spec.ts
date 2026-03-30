import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { createTestWorkOrder } from '../../test/helpers/factories';

describe('TrackingController', () => {
  let controller: TrackingController;
  let service: jest.Mocked<TrackingService>;

  beforeEach(() => {
    service = {
      getByToken: jest.fn(),
    } as unknown as jest.Mocked<TrackingService>;
    controller = new TrackingController(service);
  });

  describe('getByToken', () => {
    it('should return tracking info for valid token', async () => {
      const wo = createTestWorkOrder();
      const trackingResult = {
        id: wo.id,
        sequenceNumber: wo.sequenceNumber,
        title: wo.title,
        status: wo.status,
        technician: null,
        latitude: wo.latitude,
        longitude: wo.longitude,
      };
      service.getByToken.mockResolvedValue(trackingResult);

      const result = await controller.getByToken('valid-token');

      expect(service.getByToken).toHaveBeenCalledWith('valid-token');
      expect(result.sequenceNumber).toBe(wo.sequenceNumber);
    });

    it('should propagate NotFoundException for invalid token', async () => {
      service.getByToken.mockRejectedValue(
        new Error('Tracking token not found'),
      );

      await expect(
        controller.getByToken('bad-token'),
      ).rejects.toThrow('Tracking token not found');
    });
  });
});
