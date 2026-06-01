# SafeCheck 시스템 개요

## 서비스 목적

실시간 재난·재해 및 사건사고 정보를 수집하고, 사용자에게 위험 정보를 제공하는 서비스입니다.
위험 정보를 빠르게 인지하고, 대피소 확인·구조 요청까지 한 앱에서 처리할 수 있도록 합니다.

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Runtime | Node.js | 20.x LTS |
| Language | TypeScript | 5.x |
| Framework | NestJS | 10.x |
| Database | PostgreSQL | 16.x |
| ORM | TypeORM | 0.3.x |
| Cache | Redis | 7.x (Phase 3+) |
| WebSocket | Socket.io | 4.x (Phase 4+) |
| Scheduler | @nestjs/schedule | 4.x |
| API 문서 | Swagger (OpenAPI 3) | 자동 생성 |

---

## 모듈 목록

| 모듈 | 경로 | 역할 | Phase |
|------|------|------|-------|
| NewsModule | src/modules/news | 실시간 뉴스 수집·조회 | 2 |
| ShelterModule | src/modules/shelter | 대피소 위치 조회 | 3 |
| DisasterModule | src/modules/disaster | 재난·재해 알림 수집·발송 | 4 |
| RescueModule | src/modules/rescue | 구조 요청 생성·관리 | 5 |
| AuthModule | src/modules/auth | JWT 인증·인가 | 5 |
| CommunityModule | src/modules/community | 지역 대화방·구호물품 거래 | 6 |
| AppScheduleModule | src/shared/schedule | ScheduleModule.forRoot() 등록 | 1 |
| NotificationModule | src/shared/notification | FCM 푸시·SMS 발송 | 4 |
| WebsocketModule | src/shared/websocket | 실시간 브로드캐스트 | 4 |
| CacheModule | src/shared/cache | Redis 캐싱 래핑 | 3 |

---

## 요청 흐름

```
Client (HTTP / WebSocket)
  │
  ▼
NestJS 글로벌 레이어
  ├─ ValidationPipe   (요청 DTO 검증)
  ├─ LoggingInterceptor (요청/응답 로깅)
  ├─ TransformInterceptor (응답 포맷 통일)
  └─ HttpExceptionFilter (에러 응답 포맷 통일)
  │
  ▼
Controller (라우팅 및 파라미터 추출)
  │
  ▼
Service (비즈니스 로직)
  ├─ Repository (DB 접근, TypeORM)
  └─ Shared Services (알림, 캐시, WebSocket)
  │
  ▼
PostgreSQL / Redis
```

---

## 환경 구성

| 환경 | 파일 | 용도 |
|------|------|------|
| 로컬 개발 | .env.development | 개발 서버 |
| 프로덕션 | .env.production | 서버에서만 관리 (git 제외) |
| 예시 | .env.example | git 커밋용 (실제 값 없음) |

실행 시 `NODE_ENV` 값에 따라 `.env.{NODE_ENV}` 파일을 자동 로드합니다.

---

## Phase별 개발 계획

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | 프로젝트 하네스 구조 구축 | 완료 |
| 2 | 실시간 뉴스 정보 페이지 | 예정 |
| 3 | 대피소 위치 페이지 + Redis 캐시 | 예정 |
| 4 | 재난·재해 알림 + WebSocket + 푸시 알림 | 예정 |
| 5 | JWT 인증 + 구조 요청 기능 | 예정 |
| 6 | 지역 대화방·구호물품 거래 (최하 우선순위) | 예정 |

---

## API 접근 경로

| 항목 | URL |
|------|-----|
| REST API base | `http://localhost:3000/api/v1` |
| Swagger 문서 | `http://localhost:3000/api/docs` |
| WebSocket | `ws://localhost:3000/realtime` (Phase 4+) |
