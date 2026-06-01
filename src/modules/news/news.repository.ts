// news_articles DB 접근 레이어
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticleEntity } from './entities/news.entity';
import { NewsFilter, PaginatedResult } from './interfaces/news.types';

@Injectable()
export class NewsRepository {
  constructor(
    @InjectRepository(NewsArticleEntity)
    private readonly repo: Repository<NewsArticleEntity>,
  ) {}

  // TODO: Phase 2 구현
  async findAll(filter: NewsFilter): Promise<PaginatedResult<NewsArticleEntity>> {
    throw new Error('Not implemented');
  }

  async findById(id: number): Promise<NewsArticleEntity | null> {
    throw new Error('Not implemented');
  }

  async findByArticleKey(articleKey: string): Promise<NewsArticleEntity | null> {
    throw new Error('Not implemented');
  }

  async save(news: Partial<NewsArticleEntity>): Promise<NewsArticleEntity> {
    throw new Error('Not implemented');
  }
}
