# 모듈 의존성 규칙

이 문서는 모듈 간 의존 허용/금지 규칙을 정의합니다.
새 기능 추가 시 반드시 이 규칙을 먼저 확인하세요.

---

## 의존 방향 원칙

```
Feature Modules (news, shelter, disaster, rescue, auth, community)
        │
        │  주입 가능 (imports)
        ▼
Shared Modules (schedule, notification, websocket, cache)
        │
        │  모두 사용 가능
        ▼
Common (filters, guards, interceptors, decorators, pipes)
```

**핵심 규칙: 방향은 항상 위 → 아래. 역방향 의존 금지.**

---

## 허용된 의존 패턴

| 의존 주체 | 의존 대상 | 이유 |
|----------|----------|------|
| news | shared/schedule | 뉴스 수집 크론 실행 인프라 |
| shelter | shared/cache | 대피소 목록 캐싱 (좌표 검색 비용) |
| disaster | shared/notification | 재난 경보 푸시·SMS 발송 |
| disaster | shared/websocket | 실시간 재난 알림 브로드캐스트 |
| disaster | shared/schedule | 재난 데이터 폴링 크론 |
| rescue | modules/auth | 회원 구조 요청 시 사용자 식별 |
| community | modules/auth | 게시글·채팅 인증 |
| community | shared/websocket | 실시간 채팅방 |
| 모든 Feature | shared/cache | 필요 시 캐싱 |

---

## 금지된 의존 패턴

| 금지 패턴 | 이유 |
|----------|------|
| `news → auth` | 뉴스 조회는 공개 API, 인증 불필요 |
| `news → disaster` (직접 import) | Feature 모듈 간 직접 참조 금지 |
| `shared/* → modules/*` | 공유 모듈은 Feature 모듈을 알면 안 됨 |
| `common/* → modules/*` | 동일 이유 |
| `shelter → disaster` (직접 import) | 도메인 간 결합 방지 |

Feature 모듈 간 데이터가 필요할 경우 → **이벤트(EventEmitter2)** 또는 **공유 서비스**로 분리.

---

## exports 규칙

| 파일 종류 | exports 등록 여부 |
|----------|-----------------|
| Service | 외부에서 사용되는 경우에만 등록 |
| Repository | 내부 전용 — exports 금지 |
| Entity | 내부 전용 — exports 금지 |
| DTO / Interface | exports 불필요 (import 경로로 직접 참조) |

---

## 순환 참조 방지

1. 순환 참조 발생 시 `forwardRef()` 사용 **전에** 설계를 재검토합니다.
2. 순환이 불가피하면 해당 로직을 Shared Module로 분리합니다.
3. `forwardRef()`는 최후의 수단으로만 사용합니다.

---

## 신규 모듈 추가 체크리스트

- [ ] `docs/features/{기능명}.md` 명세 작성
- [ ] 이 문서에 허용 의존 패턴 추가
- [ ] `src/app.module.ts`에 모듈 import 추가 (주석 해제)
- [ ] `docs/architecture/database-schema.md`에 테이블 추가
