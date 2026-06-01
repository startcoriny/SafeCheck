import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';

// TODO: Phase 3+ — Redis 연결 설정 추가
// @nestjs/cache-manager + ioredis 패키지 설치 필요
// REDIS_HOST, REDIS_PORT 환경변수 사용
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
