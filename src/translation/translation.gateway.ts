// src/translation/translation.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { UseGuards, Logger } from '@nestjs/common';
  import { Server, Socket } from 'socket.io';
  import { TranslationService } from './translation.service';
  import { RoomService } from '../room/room.service';
  import { WsAuthGuard } from '../guards/ws-auth.guard';
  
  @WebSocketGateway({ namespace: '/ws' })
  export class TranslationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(TranslationGateway.name);
  
    constructor(
      private readonly translationService: TranslationService,
      private readonly roomService: RoomService,
    ) {}
  
    handleConnection(client: Socket) {
      // handshake.address는 클라이언트의 IP 주소를 포함합니다.
      const clientIP = client.handshake.address;
      this.logger.log(`Client connected: ${client.id}, IP: ${clientIP}`);
    }
  
    async handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
      @MessageBody() data: { roomId: string },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      const { roomId } = data;
      if (!(await this.roomService.roomExists(roomId))) {
        client.emit('error', '해당 방이 존재하지 않습니다.');
        client.disconnect();
        return;
      }
      await this.roomService.addParticipant(roomId, { id: client.id, user: (client as any).user });
      client.join(roomId);
      client.emit('joined', { roomId });
      this.logger.log(`Client ${client.id} joined room ${roomId}`);
    }
  
    // 내부 IP 가져오기 이벤트 추가
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('getInternalIP')
    handleGetInternalIP(@ConnectedSocket() client: Socket): void {
      const internalIP = client.handshake.address;
      client.emit('internalIP', { internalIP });
      this.logger.log(`Sent internal IP to client ${client.id}: ${internalIP}`);
    }
  
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() data: { roomId: string; message: string },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      const { roomId, message } = data;
      try {
        const translatedTextEn = await this.translationService.translate(message, 'EN');
        const translatedTextJa = await this.translationService.translate(message, 'JA');
        this.server.to(roomId).emit('message', {
          original: message,
          english: translatedTextEn,
          japanese: translatedTextJa,
          sender: (client as any).user ? (client as any).user.username : 'unknown',
        });
        this.logger.log(`Message in room ${roomId}: ${message}`);
      } catch (error) {
        client.emit('error', '번역 처리 중 오류가 발생했습니다.');
        this.logger.error('Translation error', error);
      }
    }
  }
  