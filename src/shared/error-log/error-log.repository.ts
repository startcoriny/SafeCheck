// 에러 로그 저장 실패가 서비스 장애로 이어지지 않도록 격리하는 저장소.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLogEntity } from './entities/error-log.entity';

export interface CreateErrorLog {
  level: 'ERROR' | 'WARN';
  service: string;
  method: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class ErrorLogRepository {
  constructor(
    @InjectRepository(ErrorLogEntity)
    private readonly repo: Repository<ErrorLogEntity>,
  ) {}

  async save(data: CreateErrorLog): Promise<void> {
    try {
      const entity = this.repo.create({
        ...data,
        stack: data.stack ?? null,
        context: data.context ?? null,
      });
      await this.repo.save(entity);
    } catch (error) {
      console.error('에러 로그 저장 실패', error);
    }
  }
}
