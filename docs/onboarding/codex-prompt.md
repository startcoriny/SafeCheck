# Codex 구현 지시서 — 에러 로그 저장 및 한국어 메시지

## 목표

애플리케이션에서 발생하는 에러를 PostgreSQL `error_logs` 테이블에 저장한다.

5xx 에러와 처리되지 않은 예외만 저장한다. 4xx, 일반 실행 로그는 저장하지 않는다.

영어로 된 에러 메시지를 한국어로 변경한다.

이 지시서에 정의된 범위만 구현한다.

---

## 작업 전 반드시 읽을 문서

1. `CLAUDE.md` — 프로젝트 전반 규칙
2. `AGENTS.md` — Codex 행동 규칙
3. `docs/onboarding/ai-orchestration.md` — 역할 분리 기준

---

## 현재 구조 파악

구현 전 아래 파일을 반드시 읽는다.

```
src/app.module.ts
src/main.ts
src/common/filters/http-exception.filter.ts
src/modules/news/news.service.ts
src/modules/news/collector/naver-news.collector.ts
```

---

## 구현 대상

### 1. ErrorLogEntity 생성

파일: `src/shared/error-log/entities/error-log.entity.ts`

```typescript
@Entity('error_logs')
export class ErrorLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  level: 'ERROR' | 'WARN';

  @Column({ type: 'varchar', length: 100 })
  service: string;

  @Column({ type: 'varchar', length: 100 })
  method: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  stack: string | null;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

`DatabaseModule`은 `**/*.entity{.ts,.js}` 패턴으로 엔티티를 자동 감지한다. 별도 등록 불필요.

---

### 2. ErrorLogRepository 구현

파일: `src/shared/error-log/error-log.repository.ts`

**save(data)**

```typescript
interface CreateErrorLog {
  level: 'ERROR' | 'WARN';
  service: string;
  method: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}
```

- 단건 저장한다.
- 저장 실패 시 예외를 throw하지 않는다. console.error로만 출력한다.
  (로그 저장 실패로 앱이 중단되면 안 된다.)

---

### 3. ErrorLogModule 생성

파일: `src/shared/error-log/error-log.module.ts`

- `TypeOrmModule.forFeature([ErrorLogEntity])` 등록
- `ErrorLogRepository` provider로 등록
- `ErrorLogRepository` export
- `@Global()` 데코레이터 적용

---

### 4. HttpExceptionFilter 수정

파일: `src/common/filters/http-exception.filter.ts`

현재 필터에 `ErrorLogRepository` 의존성을 주입한다.

변경 기준:

- `status >= 500`이면 `ErrorLogRepository.save()`를 호출한다.
- `status < 500`이면 저장하지 않는다.
- 저장 시 `context`에 `{ path: request.url, method: request.method }`를 담는다.
- 기존 응답 형식(`success`, `statusCode`, `message`, `timestamp`, `path`)은 변경하지 않는다.

---

### 5. AllExceptionsFilter 신규 생성

파일: `src/common/filters/all-exceptions.filter.ts`

`@Catch()` 데코레이터로 HttpException이 아닌 모든 예외를 처리한다.

- 항상 `ErrorLogRepository.save()`를 호출한다.
- 응답은 아래 형식으로 고정한다.

```json
{
  "success": false,
  "statusCode": 500,
  "message": "서버 내부 오류가 발생했습니다.",
  "timestamp": "ISO 문자열",
  "path": "요청 경로"
}
```

- `context`에 `{ path: request.url, method: request.method }`를 담는다.

---

### 6. AppModule 수정

파일: `src/app.module.ts`

아래 두 가지를 추가한다.

**ErrorLogModule import 추가**

```typescript
import { ErrorLogModule } from './shared/error-log/error-log.module';
```

**APP_FILTER로 전역 필터 등록**

```typescript
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

providers: [
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
],
```

`AllExceptionsFilter`를 먼저 등록해야 한다.
NestJS는 나중에 등록된 필터를 먼저 적용하므로, `HttpExceptionFilter`가 `HttpException`을 먼저 처리하고 나머지는 `AllExceptionsFilter`가 처리한다.

`main.ts`에는 `useGlobalFilters`를 추가하지 않는다.

---

### 7. 에러 메시지 한국어화

아래 파일의 에러 메시지를 한국어로 변경한다.

**src/modules/news/news.service.ts**

```typescript
// 변경 전
throw new NotFoundException(`News article not found. id=${id}`);

// 변경 후
throw new NotFoundException(`뉴스를 찾을 수 없습니다. id=${id}`);
```

**src/modules/news/collector/naver-news.collector.ts**

```typescript
// 변경 전
throw new Error(`Naver news request failed. status=${response.status}`);
// 변경 후
throw new Error(`네이버 뉴스 요청 실패. status=${response.status}`);

// 변경 전
throw new Error(`${name} is required for Naver news collection.`);
// 변경 후
throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
```

---

## 구현 금지 항목

- `news_collect_logs`, `news_collect_locks` 구현 (별도 작업)
- 에러 조회 API 추가
- 에러 알림 (Slack, FCM 등)
- `warn` 수준 로그 저장 로직 (현재는 `error`만)

---

## 완료 기준

```
npx prettier --write .
npx tsc --noEmit
npm test
npm run build
```

모두 통과해야 완료다.

## 결과 보고

- 변경된 파일 목록
- 테스트 결과
- 구현하지 못한 항목 및 이유
- 남은 TODO
