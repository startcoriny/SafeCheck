import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

// Phase 4 — 재난 알림 발송 시 활성화
@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
