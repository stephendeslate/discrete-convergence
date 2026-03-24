// TRACED:FD-DISPATCH-001
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/dispatch', cors: { origin: '*' } })
export class DispatchGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`dispatch:${data.companyId}`);
  }

  emitAssignment(companyId: string, payload: { workOrderId: string; technicianId: string }) {
    this.server.to(`dispatch:${companyId}`).emit('assignment', payload);
  }

  emitStatusChange(companyId: string, payload: { workOrderId: string; status: string }) {
    this.server.to(`dispatch:${companyId}`).emit('statusChange', payload);
  }
}
