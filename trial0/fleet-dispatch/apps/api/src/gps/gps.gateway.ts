// TRACED:FD-GPS-001
// TRACED:FD-GPS-002
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../common/prisma.service';

interface GpsPosition {
  technicianId: string;
  companyId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

@WebSocketGateway({ namespace: '/gps', cors: { origin: '*' } })
export class GpsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('position')
  async handlePosition(
    @MessageBody() data: GpsPosition,
    @ConnectedSocket() client: Socket,
  ) {
    await this.prisma.gpsLog.create({
      data: {
        technicianId: data.technicianId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        speed: data.speed,
        heading: data.heading,
        recordedAt: new Date(),
      },
    });

    await this.prisma.technician.update({
      where: { id: data.technicianId },
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        lastGpsAt: new Date(),
      },
    });

    this.server.to(`company:${data.companyId}`).emit('technicianPosition', {
      technicianId: data.technicianId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`company:${data.companyId}`);
  }

  @SubscribeMessage('subscribeWorkOrder')
  handleSubscribeWorkOrder(
    @MessageBody() data: { workOrderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`workorder:${data.workOrderId}`);
  }
}
