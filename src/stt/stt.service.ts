// src/stt/stt.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private readonly client: SpeechClient;

  constructor() {
    this.client = new SpeechClient();
  }

  async transcribeAudio(audioBytes: Buffer): Promise<string> {
    const audio = { content: audioBytes.toString('base64') };
    const config = {
      encoding: 'LINEAR16' as const,
      languageCode: 'ko-KR',
    };

    try {
      const response = await this.client.recognize({ config, audio });
      if (!response[0] || !response[0].results) {
        return '';
      }
      const transcript = response[0].results
        .map(result => {
          const alt = result.alternatives && result.alternatives[0];
          return alt ? alt.transcript : '';
        })
        .filter((text): text is string => !!text && text.length > 0)
        .join('\n');
      return transcript;
    } catch (error) {
      this.logger.error('STT Error', error);
      throw error;
    }
  }
}
