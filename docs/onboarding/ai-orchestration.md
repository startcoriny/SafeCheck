# AI Orchestration Guide

## 목적

SafeCheck 프로젝트에서 Claude와 Codex의 역할을 명확하게 분리한다.

AI 간 역할 중복을 줄이고, 각자의 강점을 활용하여 1인 개발 생산성을 높인다.

---

## 역할 정의

### Claude

Claude는 설계, 검증, 문서화를 담당한다.

| 작업 | 산출물 |
|------|--------|
| 요구사항 분석 | `docs/domain/{도메인}/feature-definition.md` |
| DB 설계 | `docs/architecture/database-schema.md` |
| API 설계 | `docs/api/openapi.yaml` |
| 아키텍처 설계 | `docs/architecture/overview.md` |
| ADR 작성 | `docs/decisions/*.md` |
| 코드 리뷰 | PR 코멘트 |
| Work Log 작성 | Notion |
| PR 초안 작성 | GitHub PR |

Claude는 구현보다 설계와 검증에 집중한다. 대규모 코드 생성은 하지 않는다.

---

### Codex

Codex는 구현을 담당한다.

| 작업 | 산출물 |
|------|--------|
| 기능 구현 | `src/modules/{도메인}/*.ts` |
| DTO 작성 | `src/modules/{도메인}/dto/*.ts` |
| Controller 작성 | `src/modules/{도메인}/{도메인}.controller.ts` |
| Service 작성 | `src/modules/{도메인}/{도메인}.service.ts` |
| Repository 작성 | `src/modules/{도메인}/{도메인}.repository.ts` |
| 테스트 코드 작성 | `src/modules/{도메인}/__tests__/*.spec.ts` |
| 리뷰 반영 | 기존 파일 수정 |

Codex는 Claude가 설계한 명세와 하네스 구조를 기준으로 구현한다.

---

## 개발 흐름

SafeCheck는 Phase 단위로 기능을 추가한다. 각 Phase 안에서 아래 흐름을 따른다.

```
Step 1  Claude   기능 분석 및 명세 작성
Step 2  Claude   DB / API 설계
Step 3  Codex    기능 구현
Step 4  Claude   코드 리뷰
Step 5  Codex    리뷰 반영
Step 6  Claude   문서화 및 PR 초안 작성
```

---

### Step 1. 기능 분석 및 명세 작성 (Claude)

기능 요구사항을 정리하고 명세서를 작성한다.

산출물 위치.

```
docs/domain/{도메인}/feature-definition.md
```

Phase 2 예시.

```
docs/domain/news/feature-definition.md     ← 이미 작성 완료
docs/domain/news/data-model.md
docs/domain/news/collection-design.md
docs/domain/news/risk-score-policy.md
```

---

### Step 2. DB / API 설계 (Claude)

데이터 모델과 API 스펙을 설계하고 필요 시 ADR을 작성한다.

산출물 위치.

```
docs/architecture/database-schema.md
docs/api/openapi.yaml
docs/decisions/{주제}.md
```

기술 선택이 필요한 경우 ADR 형식으로 기록한다. ADR 형식은 `docs/decisions/modular-monolith.md`를 참고한다.

---

### Step 3. 기능 구현 (Codex)

Claude가 작성한 명세와 하네스 구조(`src/modules/{도메인}`)를 기반으로 구현한다.

`throw new Error('Not implemented')` 스텁이 있는 파일부터 순서대로 채운다.

```
{도메인}.repository.ts   →  DB 접근 구현
{도메인}.service.ts      →  비즈니스 로직 구현
{도메인}.controller.ts   →  이미 선언된 엔드포인트 연결 확인
__tests__/*.spec.ts      →  단위 테스트 작성
```

구현 전 반드시 확인할 파일.

```
docs/domain/{도메인}/feature-definition.md
docs/domain/{도메인}/data-model.md
src/modules/{도메인}/interfaces/{도메인}.types.ts
src/modules/{도메인}/entities/{도메인}.entity.ts
```

---

### Step 4. 코드 리뷰 (Claude)

아래 기준으로 PR을 검토한다.

| 항목 | 확인 내용 |
|------|-----------|
| 구조 | Feature-first 원칙 준수, 레이어 책임 분리 여부 |
| 예외 처리 | 발생 가능한 예외만 처리하는지, 과도한 방어 코드 여부 |
| 테스트 | 핵심 로직 단위 테스트 포함 여부 |
| 성능 | N+1 쿼리, 불필요한 full scan 여부 |
| 과설계 여부 | MVP 범위를 벗어난 구현 여부 |

---

### Step 5. 리뷰 반영 (Codex)

Claude의 리뷰 코멘트를 반영하여 수정한다.

아키텍처 변경이 필요한 경우 임의로 결정하지 않고 사용자에게 질문한다.

---

### Step 6. 문서화 및 PR 초안 작성 (Claude)

구현 완료 후 아래 문서를 작성한다.

```
Notion Work Log     ←  기술 판단 과정, 선택 이유, 트레이드오프
docs/decisions/*.md ←  기술 선택이 있었다면 ADR 추가
GitHub PR Draft     ←  Summary / Changes / Test / Related Docs / Checklist
```

Work Log는 단순 작업 나열이 아니라 포트폴리오, 경력기술서에 활용할 수 있도록 문제 해결 과정과 기술 선택 이유를 담는다.

---

## Claude가 하지 않는 것

- 대규모 코드 생성.
- 승인 없는 리팩토링.
- 명세 없이 구현 진행.
- MVP 범위 밖 기능 구현.

---

## Codex가 하지 않는 것

- 아키텍처 결정.
- 기술 선택 및 라이브러리 추가.
- 요구사항 해석 및 기능 정의.
- ADR 작성.
- 명세 없이 구조 변경.

---

## 최종 결정권

모든 기술 선택과 구조 결정은 사용자(jimini)가 수행한다.

Claude와 Codex는 제안만 한다.

최종 승인 없이 결정하지 않는다.

---

## 참고 문서

- 프로젝트 전반 규칙 → `CLAUDE.md`
- 시스템 구조 → `docs/architecture/overview.md`
- Phase별 계획 → `docs/architecture/overview.md` Phase별 개발 계획 섹션
- ADR 작성 기준 → `docs/decisions/modular-monolith.md`
