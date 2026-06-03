# AGENTS.md

SafeCheck 프로젝트에서 Codex가 따라야 할 규칙입니다.

---

## 코딩 규칙

- 요청받은 범위만 구현한다. 추측성 기능 추가 금지.
- 발생하지 않는 상황을 위한 에러 처리 금지.
- 기존 코드 스타일을 유지한다. 요청 없이 리팩토링 금지.
- TypeScript strict 기준을 유지한다.
- 과한 추상화보다 읽기 쉬운 구현을 우선한다.

## 파일 헤더 규칙

새로운 소스 파일의 첫 줄에 역할을 설명하는 한 줄짜리 한국어 주석을 작성한다.

```typescript
// 뉴스 수집기 — 네이버 사건사고 섹션 cursor 기반 증분 수집
```

config 파일(\*.config.ts, package.json 등)은 제외한다.

## 주석 규칙

- 복잡한 로직(조건 분기, 알고리즘, 외부 API 연동)에는 WHY를 설명하는 주석을 작성한다.
- 단순한 CRUD나 매핑 코드에는 주석을 작성하지 않는다.
- 주석은 무엇을 하는지(WHAT)가 아니라 왜 그렇게 했는지(WHY)를 설명한다.

## 프로젝트 구조

- 기능 코드는 `src/modules` 아래에 생성한다.
- 공통 코드는 `src/common` 또는 `src/shared`에 생성한다.
- DB는 PostgreSQL, ORM은 TypeORM을 사용한다.

## 작업 완료 기준

작업이 끝나면 아래 순서로 실행하고 모두 통과해야 완료다.

```
npx prettier --write .
npx tsc --noEmit
npm test
npm run build
```

## 커밋 규칙

구현 완료 후 Claude 리뷰를 받은 뒤 커밋한다. 리뷰 없이 커밋하지 않는다.

```
<type>: <변경 내용>
```

타입: feat / fix / refactor / docs / test / chore / perf

## 결과 보고

완료 후 아래 내용을 보고한다.

- 변경된 파일 목록
- 테스트 결과
- 구현하지 못한 항목 및 이유
- 남은 TODO
