// news_articles 테이블 엔티티 — 수집한 사건사고 뉴스 기사 단위 저장
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import {
  Source,
  AccidentType,
  RiskLevel,
  AiAnalysisStatus,
  FilterReason,
} from '../interfaces/news.types';

@Entity('news_articles')
@Unique(['source', 'pressCode', 'articleId'])
@Index('idx_news_latest', ['publishedAt'])
@Index('idx_news_region_latest', ['region', 'district', 'publishedAt'])
@Index('idx_news_type_latest', ['accidentType', 'publishedAt'])
@Index('idx_news_risk_latest', ['riskLevel', 'publishedAt'])
@Index('idx_news_filtered_latest', ['isFiltered', 'publishedAt'])
export class NewsArticleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  source: Source;

  @Column({ name: 'article_key', length: 100 })
  articleKey: string;

  @Column({ name: 'press_code', length: 10 })
  pressCode: string;

  @Column({ name: 'article_id', length: 20 })
  articleId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 100 })
  publisher: string;

  @Column({ name: 'published_at', type: 'timestamptz' })
  publishedAt: Date;

  @Column({ name: 'collected_at', type: 'timestamptz' })
  collectedAt: Date;

  @Column({ name: 'matched_include_keywords', type: 'jsonb', default: '[]' })
  matchedIncludeKeywords: string[];

  @Column({ name: 'matched_exclude_keywords', type: 'jsonb', default: '[]' })
  matchedExcludeKeywords: string[];

  @Column({ name: 'is_filtered', default: false })
  isFiltered: boolean;

  @Column({ name: 'filter_reason', type: 'varchar', length: 50, nullable: true })
  filterReason: FilterReason | null;

  @Column({ name: 'accident_type', type: 'enum', enum: AccidentType, default: AccidentType.ETC })
  accidentType: AccidentType;

  @Column({ name: 'risk_level', type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  riskLevel: RiskLevel;

  @Column({ name: 'risk_score', default: 0 })
  riskScore: number;

  @Column({ length: 50, nullable: true })
  region: string | null;

  @Column({ length: 50, nullable: true })
  district: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'ai_summary', type: 'text', nullable: true })
  aiSummary: string | null;

  @Column({
    name: 'ai_analysis_status',
    type: 'enum',
    enum: AiAnalysisStatus,
    default: AiAnalysisStatus.PENDING,
  })
  aiAnalysisStatus: AiAnalysisStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
