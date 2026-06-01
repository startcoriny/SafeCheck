import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

// TODO: Phase 4 구현
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  // TODO: 재난 알림 전체 브로드캐스트
  // broadcastDisasterAlert(alert: unknown): void {}

  // TODO: 지역별 룸에 알림 전송 (Phase 6)
  // broadcastToRegion(region: string, payload: unknown): void {}
}
