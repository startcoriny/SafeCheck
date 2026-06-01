// news_collect_locks 테이블 엔티티 — 수집 작업 동시 실행 방지용 락
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Source } from '../interfaces/news.types';

@Entity('news_collect_locks')
export class NewsCollectLockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  source: Source;

  @Column({ name: 'lock_key', length: 100 })
  lockKey: string;

  @Column({ name: 'locked_at', type: 'timestamptz' })
  lockedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'locked_by', length: 100 })
  lockedBy: string;
}
