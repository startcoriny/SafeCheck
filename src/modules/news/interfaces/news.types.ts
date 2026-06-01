// 뉴스 도메인 공통 타입, 열거형, 인터페이스 정의

export enum Source {
  NAVER_NEWS = 'NAVER_NEWS',
}

export enum AccidentType {
  FIRE = 'FIRE',
  EXPLOSION = 'EXPLOSION',
  COLLISION = 'COLLISION',
  COLLAPSE = 'COLLAPSE',
  KNIFE_ATTACK = 'KNIFE_ATTACK',
  GAS_LEAK = 'GAS_LEAK',
  FLOOD = 'FLOOD',
  LANDSLIDE = 'LANDSLIDE',
  EARTHQUAKE = 'EARTHQUAKE',
  HAZARDOUS_MATERIAL = 'HAZARDOUS_MATERIAL',
  PUBLIC_SAFETY = 'PUBLIC_SAFETY',
  ETC = 'ETC',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AiAnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum FilterReason {
  INCLUDE_KEYWORD_MATCHED = 'INCLUDE_KEYWORD_MATCHED',
  EXCLUDE_KEYWORD_MATCHED = 'EXCLUDE_KEYWORD_MATCHED',
  NO_INCLUDE_KEYWORD = 'NO_INCLUDE_KEYWORD',
  LOW_RISK_SCORE = 'LOW_RISK_SCORE',
}

export enum CollectStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
}

export interface NewsFilter {
  region?: string;
  district?: string;
  riskLevel?: RiskLevel;
  accidentType?: AccidentType;
  keyword?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
