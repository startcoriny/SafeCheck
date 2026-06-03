// 애플리케이션 에러 로그를 PostgreSQL에 저장하는 엔티티.
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('error_logs')
export class ErrorLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  level: 'ERROR' | 'WARN';

  @Column({ type: 'varchar', length: 100 })
  service: string;

  @Column({ type: 'varchar', length: 100 })
  method: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  stack: string | null;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
