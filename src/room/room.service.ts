// src/room/room.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async createRoom(): Promise<string> {
    const roomId = uuidv4().slice(0, 8);
    const roomData = { participants: [] };
    await this.redisClient.set(`room:${roomId}`, JSON.stringify(roomData));
    this.logger.log(`Room ${roomId} created.`);
    return roomId;
  }

  async roomExists(roomId: string): Promise<boolean> {
    const exists = await this.redisClient.exists(`room:${roomId}`);
    return exists === 1;
  }

  async addParticipant(roomId: string, participant: any): Promise<void> {
    const roomData = await this.redisClient.get(`room:${roomId}`);
    if (roomData) {
      const room = JSON.parse(roomData);
      room.participants.push(participant);
      await this.redisClient.set(`room:${roomId}`, JSON.stringify(room));
      this.logger.log(`Added participant ${participant.id} to room ${roomId}`);
    }
  }

  async removeParticipant(roomId: string, participantId: string): Promise<void> {
    const roomData = await this.redisClient.get(`room:${roomId}`);
    if (roomData) {
      const room = JSON.parse(roomData);
      room.participants = room.participants.filter(p => p.id !== participantId);
      await this.redisClient.set(`room:${roomId}`, JSON.stringify(room));
      this.logger.log(`Removed participant ${participantId} from room ${roomId}`);
    }
  }
}
