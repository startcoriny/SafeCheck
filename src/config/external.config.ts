import { registerAs } from '@nestjs/config';

export const externalConfig = registerAs('external', () => ({
  // 뉴스 수집 API (Phase 2에서 결정)
  newsApiKey: process.env.NEWS_API_KEY ?? '',
  newsApiUrl: process.env.NEWS_API_URL ?? '',

  // 재난 알림 API (Phase 4에서 결정)
  disasterApiKey: process.env.DISASTER_API_KEY ?? '',
  disasterApiUrl: process.env.DISASTER_API_URL ?? '',

  // FCM 푸시 알림 (Phase 4에서 결정)
  fcmServerKey: process.env.FCM_SERVER_KEY ?? '',
}));
