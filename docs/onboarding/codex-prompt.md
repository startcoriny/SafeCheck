# Codex 구현 지시서 — 뉴스 기능 Phase 2

## 목표

SafeCheck 뉴스 기능의 핵심 로직을 구현한다.

현재 `src/modules/news/` 아래 모든 메서드가 `throw new Error('Not implemented')` 상태다.

이 지시서에 정의된 범위만 구현한다. 그 외는 구현하지 않는다.

---

## 작업 전 반드시 읽을 문서

순서대로 읽는다.

1. `CLAUDE.md` — 프로젝트 전반 규칙
2. `docs/domain/news/feature-definition.md` — 기능 정의 및 MVP 범위
3. `docs/domain/news/data-model.md` — DB 테이블 구조 및 컬럼 정의
4. `docs/domain/news/collection-design.md` — 네이버 사건사고 수집 방식
5. `docs/domain/news/collection-operation-policy.md` — 스케줄러 주기, 락, 장애 대응
6. `docs/domain/news/risk-score-policy.md` — 키워드 필터링 및 위험도 산정

---

## 구현 대상

### 1. 키워드 설정 파일 생성

`keywords/` 디렉토리를 프로젝트 루트에 생성하고 JSON 파일 4개를 작성한다.

모든 내용은 `docs/domain/news/risk-score-policy.md`를 기준으로 작성한다.

**keywords/include-keywords.json**

섹션 4의 포함 키워드를 카테고리별로 구조화한다.

```json
{
  "화재_폭발": ["화재", "불", ...],
  "교통사고": ["추돌", "충돌", ...],
  ...
}
```

**keywords/exclude-keywords.json**

섹션 5의 제외 키워드를 배열로 작성한다.

```json
["삼성화재", "현대해상", ...]
```

**keywords/accident-type-keywords.json**

섹션 6의 사고 유형별 키워드 매핑을 작성한다.

```json
{
  "FIRE": ["화재", "불", "불길", "산불"],
  "EXPLOSION": ["폭발", "폭음", "가스폭발"],
  ...
}
```

**keywords/risk-score-rules.json**

섹션 8~11의 점수 기준을 구조화한다.

```json
{
  "accidentTypeScores": {
    "KNIFE_ATTACK": 10,
    "EXPLOSION": 9,
    ...
  },
  "casualtyKeywordScores": {
    "사망": 5,
    "중상": 4,
    ...
  },
  "scaleKeywordScores": {
    "긴급대피": 4,
    ...
  },
  "riskLevelThresholds": {
    "LOW": [0, 4],
    "MEDIUM": [5, 9],
    "HIGH": [10, 14],
    "CRITICAL": [15, 999]
  }
}
```

---

### 2. news.types.ts에 RawNewsItem 추가

파일: `src/modules/news/interfaces/news.types.ts`

수집기와 서비스 간에 주고받는 원시 데이터 타입을 추가한다.

```typescript
export interface RawNewsItem {
  articleKey: string;
  pressCode: string;
  articleId: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: Date;
}
```

---

### 3. NewsRepository 구현

파일: `src/modules/news/news.repository.ts`

**findAll(filter: NewsFilter)**

- `is_filtered = true`인 기사만 조회한다.
- 최신순 정렬 (`published_at DESC`)
- 필터 적용: region, district, riskLevel, accidentType, keyword (제목 LIKE 검색)
- offset/limit 페이지네이션 적용
- 반환 타입: `PaginatedResult<NewsArticleEntity>`

**findById(id: number)**

- id로 단일 기사를 조회한다.
- 반환 타입: `NewsArticleEntity | null`

**findByArticleKey(articleKey: string)**

- 중복 수집 여부 확인에 사용한다.
- 반환 타입: `NewsArticleEntity | null`

**save(news: Partial<NewsArticleEntity>)**

- 단건 저장한다.
- 반환 타입: `NewsArticleEntity`

---

### 4. NewsService 구현

파일: `src/modules/news/news.service.ts`

**findAll(query: NewsQueryDto)**

- query를 NewsFilter로 변환한다.
- `repository.findAll`을 호출한다.
- entity 배열을 NewsResponseDto 배열로 매핑한다.
- 반환 타입: `NewsListResponseDto`

**findById(id: number)**

- `repository.findById`를 호출한다.
- null이면 `NotFoundException`을 throw한다.
- entity를 NewsResponseDto로 매핑한다.
- 반환 타입: `NewsResponseDto`

**collectAndSave(rawNews: RawNewsItem[])**

아래 순서로 처리한다.

1. `findByArticleKey`로 중복 여부 확인, 이미 존재하면 skip
2. 포함 키워드 매칭 (`include-keywords.json`)
3. 제외 키워드 매칭 (`exclude-keywords.json`)
4. 사고 유형 분류 (`accident-type-keywords.json`)
5. 위험도 점수 계산 (`risk-score-rules.json`)
6. `is_filtered`, `filter_reason` 설정
7. `repository.save` 호출

**assignRiskScore(title: string) — private**

- `risk-score-rules.json`을 로드한다.
- 사건 유형 점수 + 인명 피해 점수 + 규모 점수를 합산한다.
- 최종 점수로 RiskLevel 등급을 결정한다.
- 반환 타입:

```typescript
{
  score: number;
  riskLevel: RiskLevel;
  accidentType: AccidentType;
  matchedIncludeKeywords: string[];
  matchedExcludeKeywords: string[];
}
```

---

### 5. 뉴스 수집기 구현

신규 파일: `src/modules/news/collector/naver-news.collector.ts`

기준 문서: `docs/domain/news/collection-design.md`

**collect() 메서드**

아래 순서로 처리한다.

1. KST 기준 오늘 날짜로 네이버 사건사고 섹션 HTML 요청
2. 첫 번째 cursor 값 추출 (`data-cursor-name="next"`, `data-cursor`)
3. 기사 목록 파싱 (제목, URL, 언론사, 발행시간, pressCode, articleId)
4. articleKey 생성 (`NAVER:{pressCode}:{articleId}`)
5. `findByArticleKey`로 기존 기사 확인, 발견 시 즉시 종료
6. 더보기 요청 반복 (`has-next=true`이고 종료 조건 미달 시)
7. 반환 타입: `RawNewsItem[]`

종료 조건 (`collection-operation-policy.md` 기준):

- 기존 articleKey 발견
- `has-next = false`
- 최대 3페이지 도달
- 최대 100건 수집
- 요청 간 500ms 대기

---

### 6. NewsScheduler 활성화

파일: `src/modules/news/news.scheduler.ts`

현재 주석 처리된 크론을 활성화한다.

- 주기: `EVERY_5_MINUTES`
- `NaverNewsCollector.collect()` 호출
- `NewsService.collectAndSave()` 호출
- Logger로 시작/완료/실패 출력
- catch 블록 안에서 처리하여 예외가 서비스 전체로 전파되지 않도록 한다.

`NaverNewsCollector`를 providers에 추가하고 `NewsModule`에 등록한다.

---

### 7. 단위 테스트 작성

파일: `src/modules/news/__tests__/news.service.spec.ts`

테스트 대상 및 케이스:

| 메서드            | 케이스                                   |
| ----------------- | ---------------------------------------- |
| `findAll`         | 정상 조회, 빈 결과 반환                  |
| `findById`        | 정상 조회, null 시 NotFoundException     |
| `collectAndSave`  | 중복 기사 skip, 신규 기사 저장           |
| `assignRiskScore` | LOW / MEDIUM / HIGH / CRITICAL 각 케이스 |

---

## 구현 금지 항목

아래는 고도화 단계이므로 구현하지 않는다.

- Incident 그룹핑 (`docs/domain/news/incident-grouping.md` 참조)
- AI 요약 (`ai_summary`, `ai_analysis_status` 컬럼은 기본값으로 유지)
- 좌표 기반 위치 검색 (`latitude`, `longitude` 컬럼은 null로 유지)
- WebSocket 실시간 알림
- 회원가입, 로그인, 인증

---

## 완료 기준

아래 세 가지가 모두 통과해야 완료다.

```
npx tsc --noEmit   → 타입 에러 없음
npm test           → 모든 테스트 통과
npm run build      → 빌드 성공
```

완료 후 아래 내용을 보고한다.

- 변경된 파일 목록
- 테스트 결과 요약
- 구현하지 못한 항목 및 이유
- 남은 TODO
