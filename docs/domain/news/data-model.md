# 뉴스 데이터 모델 설계서

## 1. 데이터 모델 설계 목적

실시간 뉴스 정보 페이지는 외부 뉴스 데이터를 그대로 보여주는 것이 아니라, SafeCheck 서비스 목적에 맞게 필터링하고 가공한 뒤 제공한다.

따라서 다음 목적을 만족하는 데이터 모델이 필요하다.

- 같은 기사 중복 저장 방지
- 사건사고 뉴스 필터링 결과 저장
- 위험도 산정 결과 저장
- 지역 기반 조회 지원
- 수집 실패 및 성공 이력 추적
- 향후 사건 단위 그룹핑 확장 가능

---

## 2. MVP 테이블 구조

초기 MVP에서는 `news_articles` 테이블 하나를 중심으로 시작한다.

### news_articles

| 컬럼명                   | 예시 데이터                                     | 설명                              |
| ------------------------ | ----------------------------------------------- | --------------------------------- |
| id                       | 1                                               | 내부 PK                           |
| source                   | NAVER_NEWS                                      | 데이터 수집 출처                  |
| article_key              | NAVER:003:0013976068                            | 중복 제거를 위한 기사 고유 식별값 |
| press_code               | 003                                             | 네이버 언론사 코드                |
| article_id               | 0013976068                                      | 네이버 기사 ID                    |
| title                    | 서울 도심서 가스 누출 사고…일대 통제            | 기사 제목                         |
| url                      | https://n.news.naver.com/article/003/0013976068 | 원문 기사 링크                    |
| publisher                | 뉴시스                                          | 언론사명                          |
| published_at             | 2026-05-29 15:31:00                             | 기사 발행 시각                    |
| collected_at             | 2026-05-29 15:35:00                             | SafeCheck 수집 시각               |
| matched_include_keywords | ["가스누출","사고","통제"]                      | 기사 제목에서 발견된 포함 키워드  |
| matched_exclude_keywords | []                                              | 기사 제목에서 발견된 제외 키워드  |
| is_filtered              | true                                            | SafeCheck 노출 대상 여부          |
| filter_reason            | INCLUDE_KEYWORD_MATCHED                         | 필터링 결과 및 판단 사유          |
| accident_type            | GAS_LEAK                                        | 사건 유형 분류 결과               |
| risk_level               | HIGH                                            | 위험도 등급                       |
| risk_score               | 12                                              | 위험도 계산 점수                  |
| region                   | 서울                                            | 시/도 정보                        |
| district                 | 중구                                            | 시/군/구 정보                     |
| latitude                 | NULL                                            | 위도                              |
| longitude                | NULL                                            | 경도                              |
| ai_summary               | NULL                                            | AI가 생성한 기사 요약             |
| ai_analysis_status       | PENDING                                         | AI 분석 상태                      |
| created_at               | 2026-05-29 15:35:00                             | 레코드 생성 시각                  |
| updated_at               | 2026-05-29 15:35:00                             | 레코드 수정 시각                  |

---

## 3. 사고 유형 값

| 값                 | 설명     |
| ------------------ | -------- |
| FIRE               | 화재     |
| EXPLOSION          | 폭발     |
| COLLISION          | 교통사고 |
| COLLAPSE           | 붕괴     |
| KNIFE_ATTACK       | 흉기난동 |
| GAS_LEAK           | 가스누출 |
| FLOOD              | 침수     |
| LANDSLIDE          | 산사태   |
| EARTHQUAKE         | 지진     |
| HAZARDOUS_MATERIAL | 유해물질 |
| PUBLIC_SAFETY      | 공공안전 |
| ETC                | 기타     |

---

## 4. 위험도 값

| 값       | 설명      |
| -------- | --------- |
| LOW      | 낮음      |
| MEDIUM   | 보통      |
| HIGH     | 높음      |
| CRITICAL | 매우 높음 |

---

## 5. AI 분석 상태 값

| 값         | 설명         |
| ---------- | ------------ |
| PENDING    | 분석 대기    |
| PROCESSING | 분석 진행 중 |
| COMPLETED  | 분석 완료    |
| FAILED     | 분석 실패    |
| SKIPPED    | 분석 제외    |

---

## 6. 주요 제약 조건

### 기사 중복 방지

```
UNIQUE(source, press_code, article_id)
```

선택 이유:

서비스 로직에서 중복 체크가 누락되더라도 DB 레벨에서 중복 저장을 막기 위해서이다.

장점:

- 중복 저장 방지
- 동시 수집 상황에서도 안정성 확보
- article_key 생성 로직이 있어도 DB에서 한 번 더 보호 가능

단점:

- 같은 사건을 여러 언론사가 보도한 경우까지 제거하지는 못한다.
- 사건 단위 중복 제거는 별도 그룹핑 로직이 필요하다.

---

## 7. 조회용 인덱스

실시간 뉴스 페이지에서는 최신순, 지역별, 위험도별, 사건 유형별 조회가 필요하다.

추천 인덱스:

```
INDEX idx_news_latest (published_at)
INDEX idx_news_region_latest (region, district, published_at)
INDEX idx_news_type_latest (accident_type, published_at)
INDEX idx_news_risk_latest (risk_level, published_at)
INDEX idx_news_filtered_latest (is_filtered, published_at)
```

선택 이유:

- 최신순 목록 조회가 많다.
- 지역 기반 필터링이 핵심 기능이다.
- 위험도 높은 뉴스만 조회하는 기능이 필요하다.
- 노출 대상 뉴스만 빠르게 조회해야 한다.

트레이드오프:

- 인덱스가 많아질수록 insert/update 비용이 증가한다.
- MVP에서는 필요한 조회 패턴을 기준으로 최소 인덱스만 먼저 생성한다.
- 실제 조회 쿼리를 만든 뒤 EXPLAIN으로 인덱스 사용 여부를 확인한다.

---

## 8. 수집 로그 테이블

뉴스 수집기는 외부 페이지 구조나 네트워크 상태에 영향을 받기 때문에 수집 이력을 저장해야 한다.

### news_collect_logs

| 컬럼명               | 설명                             |
| -------------------- | -------------------------------- |
| id                   | 내부 PK                          |
| source               | 수집 출처                        |
| target_date          | 수집 대상 날짜                   |
| status               | SUCCESS, FAILED, PARTIAL_SUCCESS |
| started_at           | 수집 시작 시각                   |
| ended_at             | 수집 종료 시각                   |
| requested_page_count | 요청한 페이지 수                 |
| collected_count      | 파싱한 기사 수                   |
| inserted_count       | 신규 저장 기사 수                |
| duplicated_count     | 기존 기사로 판단한 수            |
| filtered_count       | 필터링 후 노출 대상이 된 수      |
| failed_reason        | 실패 사유                        |
| created_at           | 생성 시각                        |

수집 로그가 필요한 이유:

- 스케줄러가 정상 실행됐는지 확인 가능
- 수집 실패 원인 추적 가능
- 네이버 HTML 구조 변경 감지 가능
- 신규 기사 수 급증/급감 확인 가능
- 운영 안정성 판단 가능

---

## 9. 수집 락 테이블

스케줄러가 5분마다 실행될 경우 이전 작업이 끝나기 전에 다음 작업이 시작될 수 있다.

이를 방지하기 위해 수집 락을 사용한다.

### news_collect_locks

| 컬럼명     | 설명                       |
| ---------- | -------------------------- |
| id         | 내부 PK                    |
| source     | 수집 출처                  |
| lock_key   | 수집 작업 식별자           |
| locked_at  | 락 획득 시각               |
| expires_at | 락 만료 시각               |
| locked_by  | 실행 서버 또는 프로세스 ID |

락 정책:

```
동일 source에 대해 동시에 1개 수집 작업만 실행한다.
lock이 이미 존재하고 만료되지 않았다면 해당 회차 수집은 skip한다.
lock이 만료되었다면 이전 작업이 비정상 종료된 것으로 보고 새 작업이 lock을 획득한다.
```

MVP에서는 DB 기반 lock을 사용한다.

선택 이유:

- 별도 Redis 없이 구현 가능하다.
- 단일 서버와 다중 서버 환경 모두에서 동작 가능하다.
- 수집 작업의 중복 실행을 막을 수 있다.

트레이드오프:

- DB write가 추가된다.
- 서버 장애 시 lock 만료 처리가 필요하다.
- Redis lock보다 빠르지는 않다.

---

## 10. 고도화 테이블 구조

향후 같은 사건을 여러 기사에서 묶는 기능이 필요해지면 다음 구조로 확장한다.

### incidents

| 컬럼명                    | 설명                |
| ------------------------- | ------------------- |
| id                        | 사건 PK             |
| representative_article_id | 대표 기사 ID        |
| title                     | 대표 제목           |
| accident_type             | 사건 유형           |
| risk_level                | 위험도              |
| risk_score                | 위험도 점수         |
| region                    | 시/도               |
| district                  | 시/군/구            |
| occurred_at               | 사건 발생 추정 시각 |
| created_at                | 생성 시각           |
| updated_at                | 수정 시각           |

### incident_articles

| 컬럼명            | 설명                |
| ----------------- | ------------------- |
| id                | 내부 PK             |
| incident_id       | 사건 ID             |
| article_id        | 기사 ID             |
| similarity_score  | 같은 사건 판단 점수 |
| is_representative | 대표 기사 여부      |
| created_at        | 생성 시각           |

초기 MVP에서는 `news_articles` 단일 테이블로 시작하고, 동일 사건 묶기 기능이 필요해지면 `incidents`, `incident_articles` 구조로 분리한다.

## 관련 문서

- collection-design.md
- incident-grouping.md

incident 관련 테이블은 incident-grouping 설계서와 함께 관리한다.
