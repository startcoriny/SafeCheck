import { Injectable } from '@nestjs/common';

// TODO: Phase 3+ 구현 — Redis 캐시 래핑 서비스
// 메인 페이지 집계 데이터, 대피소 목록 등 캐싱에 사용
@Injectable()
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    // TODO
    return null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    // TODO
  }

  async del(key: string): Promise<void> {
    // TODO
  }
}
