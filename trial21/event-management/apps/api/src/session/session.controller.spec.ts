import { Test } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

const mockSessionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SessionController', () => {
  let controller: SessionController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [{ provide: SessionService, useValue: mockSessionService }],
    }).compile();
    controller = module.get(SessionController);
  });

  it('should create a session within event window', async () => {
    const session = { id: 's1', title: 'Workshop' };
    mockSessionService.create.mockResolvedValue(session);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.create('e1', {
      title: 'Workshop',
      startTime: '2025-06-01T10:00:00Z',
      endTime: '2025-06-01T12:00:00Z',
    }, req);
    expect(result.title).toBe('Workshop');
    expect(mockSessionService.create).toHaveBeenCalledWith('e1', {
      title: 'Workshop',
      startTime: '2025-06-01T10:00:00Z',
      endTime: '2025-06-01T12:00:00Z',
    }, 'org1');
  });

  it('should list all sessions for an event', async () => {
    const sessions = [{ id: 's1' }, { id: 's2' }];
    mockSessionService.findAll.mockResolvedValue(sessions);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findAll('e1', req);
    expect(result).toHaveLength(2);
    expect(mockSessionService.findAll).toHaveBeenCalledWith('e1', 'org1');
  });

  it('should find a single session by id', async () => {
    const session = { id: 's1', title: 'Keynote' };
    mockSessionService.findOne.mockResolvedValue(session);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findOne('e1', 's1', req);
    expect(result.title).toBe('Keynote');
    expect(mockSessionService.findOne).toHaveBeenCalledWith('e1', 's1', 'org1');
  });

  it('should update a session', async () => {
    const updated = { id: 's1', title: 'Updated Keynote' };
    mockSessionService.update.mockResolvedValue(updated);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.update('e1', 's1', { title: 'Updated Keynote' }, req);
    expect(result.title).toBe('Updated Keynote');
    expect(mockSessionService.update).toHaveBeenCalledWith('e1', 's1', { title: 'Updated Keynote' }, 'org1');
  });

  it('should delete a session', async () => {
    mockSessionService.remove.mockResolvedValue({ id: 's1' });
    const req = { user: { organizationId: 'org1' } };

    await controller.remove('e1', 's1', req);
    expect(mockSessionService.remove).toHaveBeenCalledWith('e1', 's1', 'org1');
  });
});
