# 데이터베이스 스키마

> 기능 구현 시 이 문서를 함께 업데이트합니다.
> 실제 테이블은 `src/database/migrations/`의 마이그레이션 파일이 정의합니다.

---

## ERD (텍스트)

```
[news]
  id            UUID        PK
  title         VARCHAR(500)
  content       TEXT
  source        VARCHAR(200)   출처 매체명
  url           VARCHAR(1000)  UNIQUE — 중복 수집 방지
  published_at  TIMESTAMPTZ    원문 발행 시각
  risk_level    ENUM           LOW | MEDIUM | HIGH | CRITICAL
  category      ENUM           DISASTER | ACCIDENT | CRIME | WEATHER | OTHER
  region        VARCHAR(100)   시·도 단위
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ
  deleted_at    TIMESTAMPTZ    NULL — 소프트 삭제

[shelter]
  id            UUID        PK
  name          VARCHAR(200)
  address       VARCHAR(500)
  lat           DECIMAL(10,7)  위도
  lng           DECIMAL(10,7)  경도
  capacity      INTEGER        수용 인원
  type          ENUM           CIVIL | FLOOD | EARTHQUAKE | GENERAL
  is_active     BOOLEAN        현재 운영 여부
  created_at    TIMESTAMPTZ

[disaster_alert]
  id            UUID        PK
  title         VARCHAR(500)
  description   TEXT
  level         ENUM           WATCH | WARNING | EMERGENCY
  region        VARCHAR(100)
  issued_at     TIMESTAMPTZ    발령 시각
  expires_at    TIMESTAMPTZ    NULL — 해제 예정 시각
  source        VARCHAR(200)   발령 기관 (기상청, 행안부 등)
  created_at    TIMESTAMPTZ

[user]
  id            UUID        PK
  email         VARCHAR(200)   UNIQUE
  password      VARCHAR(500)   bcrypt 해시
  nickname      VARCHAR(50)
  region        VARCHAR(100)   관심 지역
  role          ENUM           USER | ADMIN
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ
  deleted_at    TIMESTAMPTZ    NULL — 소프트 삭제

[rescue_request]
  id            UUID        PK
  user_id       UUID        FK → user.id   NULL 허용 (비회원 요청)
  name          VARCHAR(100)   요청자 이름
  phone         VARCHAR(20)
  lat           DECIMAL(10,7)
  lng           DECIMAL(10,7)
  description   TEXT
  status        ENUM           PENDING | IN_PROGRESS | RESOLVED
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ
```

---

## 공통 정책

| 항목 | 정책 |
|------|------|
| PK 타입 | UUID v4 (보안·분산 환경 대응) |
| 타임스탬프 | UTC 기준 저장 (TIMESTAMPTZ) |
| 소프트 삭제 | news, user 테이블 적용 (deleted_at). 나머지는 하드 삭제 |
| 동기화 | 개발: `synchronize: true` / 운영: `synchronize: false` + migration |

---

## 인덱스 전략

| 테이블 | 컬럼 | 인덱스 유형 | 이유 |
|--------|------|-----------|------|
| news | published_at DESC | B-tree | 최신순 조회 기본 정렬 |
| news | (region, risk_level) | 복합 B-tree | 지역+위험도 필터 |
| news | url | UNIQUE | 중복 수집 방지 |
| shelter | (lat, lng) | B-tree | 좌표 기반 검색 (PostGIS 도입 시 GIST) |
| disaster_alert | (region, issued_at) | 복합 B-tree | 지역별 최신 알림 조회 |
| user | email | UNIQUE | 로그인 조회 |

---

## 마이그레이션 운영 방법

```bash
# 개발 서버 실행 전 환경변수 확인
cp .env.example .env.development

# 마이그레이션 파일 자동 생성 (entity 변경 후)
npm run migration:generate -- src/database/migrations/AddNewsTable

# 마이그레이션 실행
npm run migration:run

# 롤백 (최근 1개)
npm run migration:revert
```

> **주의:** 운영 환경에서는 `synchronize: false`를 반드시 유지하고, 마이그레이션 파일로만 스키마를 변경합니다.

---

## 향후 검토 사항

- [ ] PostGIS 확장 도입 (대피소 반경 검색 고도화)
- [ ] 파티셔닝 검토 (news 테이블 대량 누적 시)
- [ ] 전문 검색 (뉴스 제목·본문 full-text search)
