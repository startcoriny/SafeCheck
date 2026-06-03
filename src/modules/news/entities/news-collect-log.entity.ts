// news_collect_logs 테이블 엔티티 — 뉴스 수집 실행 이력 저장
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Source, CollectStatus } from '../interfaces/news.types';

@Entity('news_collect_logs')
export class NewsCollectLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  source: Source;

  @Column({ name: 'target_date', type: 'date' })
  targetDate: string;

  @Column({ type: 'enum', enum: CollectStatus })
  status: CollectStatus;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'requested_page_count', default: 0 })
  requestedPageCount: number;

  @Column({ name: 'collected_count', default: 0 })
  collectedCount: number;

  @Column({ name: 'inserted_count', default: 0 })
  insertedCount: number;

  @Column({ name: 'duplicated_count', default: 0 })
  duplicatedCount: number;

  @Column({ name: 'filtered_count', default: 0 })
  filteredCount: number;

  @Column({ name: 'failed_reason', type: 'text', nullable: true })
  failedReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
