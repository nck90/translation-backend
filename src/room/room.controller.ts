// src/room/room.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('create')
  async createRoom() {
    const roomId = await this.roomService.createRoom();
    return { roomId };
  }
}
