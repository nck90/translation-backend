// src/translation/translation.gateway.ts
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
  } from '@nestjs/websockets';
  import { /* UseGuards, */ Logger } from '@nestjs/common';
  import { Server, Socket } from 'socket.io';
  import { TranslationService } from './translation.service';
  import { RoomService } from '../room/room.service';
  // import { WsAuthGuard } from '../guards/ws-auth.guard';
  import { WsExceptionsFilter } from '../common/filters/ws-exception.filter';
  import { UseFilters } from '@nestjs/common';
  
  @WebSocketGateway({
    namespace: '/ws',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })
  @UseFilters(WsExceptionsFilter)
  export class TranslationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(TranslationGateway.name);
  
    constructor(
      private readonly translationService: TranslationService,
      private readonly roomService: RoomService,
    ) {}
  
    afterInit(server: Server) {
      this.logger.log('WebSocket Gateway initialized');
    }
  
    handleConnection(client: Socket) {
      const clientIP = client.handshake.address;
      this.logger.log(`Client connected: ${client.id}, IP: ${clientIP}`);
      
      // Check token early to prevent hanging connections (비활성화)
      // try {
      //   const token = client.handshake.query.token as string;
      //   if (!token) {
      //     this.logger.warn(`Client ${client.id} has no token, disconnecting`);
      //     client.disconnect(true);
      //   }
      // } catch (error) {
      //   this.logger.error(`Authentication error for client ${client.id}`, error);
      //   client.disconnect(true);
      // }
    }
  
    async handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
      // Cleanup code를 여기에 추가할 수 있습니다.
    }
  
    // @UseGuards(WsAuthGuard) // 임시 비활성화
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
      @MessageBody() data: { roomId: string },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      const { roomId } = data;
      try {
        if (!(await this.roomService.roomExists(roomId))) {
          client.emit('error', '해당 방이 존재하지 않습니다.');
          return;
        }
        await this.roomService.addParticipant(roomId, { id: client.id, user: (client as any).user });
        client.join(roomId);
        client.emit('joined', { roomId });
        this.logger.log(`Client ${client.id} joined room ${roomId}`);
      } catch (error) {
        this.logger.error(`Error joining room for client ${client.id}`, error);
        client.emit('error', '방에 참여하는 중 오류가 발생했습니다.');
      }
    }
  
    // @UseGuards(WsAuthGuard) // 임시 비활성화
    @SubscribeMessage('getInternalIP')
    handleGetInternalIP(@ConnectedSocket() client: Socket): void {
      const internalIP = client.handshake.address;
      client.emit('internalIP', { internalIP });
      this.logger.log(`Sent internal IP to client ${client.id}: ${internalIP}`);
    }
  
    // @UseGuards(WsAuthGuard) // 임시 비활성화
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
  