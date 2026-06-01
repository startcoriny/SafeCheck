import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from './entities/news.entity';
import { NewsFilter, PaginatedResult } from './interfaces/news.types';

@Injectable()
export class NewsRepository {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
  ) {}

  // TODO: Phase 2 구현
  async findAll(filter: NewsFilter): Promise<PaginatedResult<NewsEntity>> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<NewsEntity | null> {
    throw new Error('Not implemented');
  }

  async findByUrl(url: string): Promise<NewsEntity | null> {
    throw new Error('Not implemented');
  }

  async save(news: Partial<NewsEntity>): Promise<NewsEntity> {
    throw new Error('Not implemented');
  }

  async softDelete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
