# SafeCheck 개발 워크플로우

새 기능을 만들 때 Claude와 Codex를 어떤 순서로 사용하는지 정리한 가이드.

---

## 전체 흐름

```
[사용자]  기능 요청
    │
    ▼
[Claude]  요구사항 분석 + 설계 문서 작성
    │
    ▼
[사용자]  설계 검토 및 승인
    │
    ▼
[Claude]  Codex 구현 지시서 작성 (codex-prompt.md)
    │
    ▼
[사용자]  Codex에 단계별 구현 요청
    │
    ▼
[Codex]   구현 + 테스트 + 빌드 확인
    │
    ▼
[사용자]  결과물을 Claude에 전달
    │
    ▼
[Claude]  코드 리뷰
    │
    ▼
[사용자]  리뷰 내용을 Codex에 전달
    │
    ▼
[Codex]   리뷰 반영
    │
    ▼
[Claude]  Work Log + PR 초안 작성 → 사용자에게 먼저 보여줌
    │
    ▼
[사용자]  승인
    │
    ▼
[Claude]  Notion 등록 + GitHub PR 생성
    │
    ▼
[사용자]  PR 머지
```

---

## 단계별 상세

### 1. 기능 요청 → Claude에게

Claude에게 기능을 설명한다.

Claude가 할 일.

- 기능 정의서 작성 → `docs/domain/{도메인}/feature-definition.md`
- 데이터 모델 설계 → `docs/domain/{도메인}/data-model.md`
- API 스펙 설계 → `docs/api/openapi.yaml`
- 필요 시 ADR 작성 → `docs/decisions/*.md`

---

### 2. 설계 검토 → 사용자

Claude가 작성한 설계 문서를 확인하고 방향을 승인한다.

수정이 필요하면 Claude에게 피드백한다.

---

### 3. Codex 지시서 작성 → Claude에게

설계가 확정되면 Claude에게 요청한다.

```
codex-prompt.md 작성해줘.
```

Claude가 할 일.

- 구현 대상 파일과 메서드 명시
- 참조 문서 경로 기재
- 완료 기준 명시
- `docs/onboarding/codex-prompt.md` 저장

---

### 4. Codex에 구현 요청 → Codex에게

지시서를 단계별로 하나씩 넘긴다.

```
docs/onboarding/codex-prompt.md 를 읽고 1번부터 시작해줘.
```

한 단계가 완료되면 다음 단계를 요청한다.

```
2번 진행해줘.
```

한 번에 전부 넘기지 않는다. 단계별로 확인하면서 진행한다.

---

### 5. 결과 확인 → Claude에게

Codex가 완료했다고 하면 Claude에게 확인을 요청한다.

```
Codex가 {파일명} 구현했다는데 확인해줘.
```

Claude가 할 일.

- 구현 내용이 설계 문서와 일치하는지 확인
- 누락 항목 또는 문제 지적

---

### 6. 코드 리뷰 → Claude에게

전체 구현이 완료되면 Claude에게 코드 리뷰를 요청한다.

```
PR 올리기 전에 코드 리뷰해줘.
```

Claude가 확인하는 항목.

- 구조 (Feature-first 원칙 준수 여부)
- 예외 처리 (과도한 방어 코드 여부)
- 테스트 (핵심 로직 커버 여부)
- 성능 (N+1, 불필요한 full scan 여부)
- 과설계 여부 (MVP 범위 초과 여부)

---

### 7. 리뷰 반영 → Codex에게

Claude의 리뷰 내용을 Codex에게 전달한다.

```
{리뷰 내용} 반영해줘.
```

아키텍처 변경이 필요한 경우 Codex가 임의로 결정하지 않고 Claude에게 먼저 확인한다.

---

### 8. Work Log + PR 초안 → Claude에게

```
PR이랑 노션 준비해줘.
```

Claude가 할 일.

- Work Log 초안 작성 후 사용자에게 먼저 보여줌
- PR 초안 작성 후 사용자에게 먼저 보여줌
- 승인 받은 뒤 Notion 등록 + GitHub PR 생성

---

## 빠른 참조

| 상황 | 누구에게 |
|------|---------|
| 기능을 새로 만들고 싶다 | Claude |
| 설계 문서를 수정하고 싶다 | Claude |
| 코드를 구현해야 한다 | Codex |
| 구현 결과를 확인하고 싶다 | Claude |
| 코드 리뷰가 필요하다 | Claude |
| 리뷰를 반영해야 한다 | Codex |
| PR/Work Log를 작성해야 한다 | Claude |
| 기술 선택을 결정해야 한다 | 사용자 (Claude 제안 참고) |

---

## 참고 문서

- 역할 정의 → `docs/onboarding/ai-orchestration.md`
- Codex 구현 지시서 → `docs/onboarding/codex-prompt.md`
- 프로젝트 규칙 (Claude용) → `CLAUDE.md`
- 프로젝트 규칙 (Codex용) → `AGENTS.md`
