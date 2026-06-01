import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  // TODO: Phase 4 구현
  // FCM 푸시 알림 (재난 경보, 위험도 HIGH+ 뉴스)
  async sendPush(tokens: string[], title: string, body: string): Promise<void> {
    throw new Error('Not implemented');
  }

  // SMS 발송 (EMERGENCY 등급 재난 긴급 알림)
  async sendSms(phoneNumbers: string[], message: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
