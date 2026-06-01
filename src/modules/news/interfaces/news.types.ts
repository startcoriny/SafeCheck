export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NewsCategory {
  DISASTER = 'DISASTER',
  ACCIDENT = 'ACCIDENT',
  CRIME = 'CRIME',
  WEATHER = 'WEATHER',
  OTHER = 'OTHER',
}

export interface NewsFilter {
  region?: string;
  riskLevel?: RiskLevel;
  category?: NewsCategory;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
