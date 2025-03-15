// src/translation/translation.module.ts
import { Module } from '@nestjs/common';
import { TranslationGateway } from './translation.gateway';
import { TranslationService } from './translation.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  providers: [TranslationGateway, TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
