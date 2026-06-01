// 뉴스 비즈니스 로직 — 조회, 수집 저장, 위험도 산정
import { Injectable } from '@nestjs/common';
import { NewsRepository } from './news.repository';
import { NewsQueryDto } from './dto/news-query.dto';
import { NewsListResponseDto, NewsResponseDto } from './dto/news-response.dto';

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  // TODO: Phase 2 구현 — docs/domain/news/feature-definition.md 참조
  async findAll(query: NewsQueryDto): Promise<NewsListResponseDto> {
    throw new Error('Not implemented');
  }

  async findById(id: number): Promise<NewsResponseDto> {
    throw new Error('Not implemented');
  }

  // news.scheduler.ts에서 호출
  async collectAndSave(rawNews: unknown[]): Promise<void> {
    throw new Error('Not implemented');
  }

  // 키워드 기반 위험도 산정 — docs/domain/news/risk-score-policy.md 참조
  private assignRiskLevel(title: string): string {
    throw new Error('Not implemented');
  }
}
