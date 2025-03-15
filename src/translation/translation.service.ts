// src/translation/translation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly deeplApiKey = process.env.DEEPL_API_KEY || 'your_deepl_api_key';

  async translate(text: string, targetLang: string): Promise<string> {
    try {
      const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
        params: {
          auth_key: this.deeplApiKey,
          text,
          target_lang: targetLang,
        },
      });
      return response.data.translations[0].text;
    } catch (error) {
      this.logger.error('DeepL translation error', error);
      // Fallback: 대체 번역 API 또는 기본 포맷 적용
      return `[Fallback] ${text}`;
    }
  }
}
