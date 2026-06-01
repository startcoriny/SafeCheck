import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

// Phase 4 — 재난 알림 실시간 브로드캐스트 시 활성화
// Phase 6 — 지역 채팅방 룸 관리 추가
@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
