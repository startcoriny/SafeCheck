import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { RiskLevel, NewsCategory } from '../interfaces/news.types';

@Entity('news')
@Index(['region', 'riskLevel'])
@Index(['publishedAt'])
export class NewsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: Phase 2 구현 시 컬럼 확정
  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 200 })
  source: string;

  @Column({ length: 1000, unique: true })
  url: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ type: 'enum', enum: RiskLevel, default: RiskLevel.LOW })
  riskLevel: RiskLevel;

  @Column({ type: 'enum', enum: NewsCategory, default: NewsCategory.OTHER })
  category: NewsCategory;

  @Column({ length: 100, nullable: true })
  region: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
