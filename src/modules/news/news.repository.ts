// news_articles DB 접근 레이어.
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

  async findAll(filter: NewsFilter): Promise<PaginatedResult<NewsArticleEntity>> {
    const page = filter.page;
    const limit = filter.limit;
    const offset = (page - 1) * limit;

    const queryBuilder = this.repo
      .createQueryBuilder('news')
      .where('news.isFiltered = :isFiltered', { isFiltered: true });

    if (filter.region) {
      queryBuilder.andWhere('news.region = :region', { region: filter.region });
    }

    if (filter.district) {
      queryBuilder.andWhere('news.district = :district', { district: filter.district });
    }

    if (filter.riskLevel) {
      queryBuilder.andWhere('news.riskLevel = :riskLevel', { riskLevel: filter.riskLevel });
    }

    if (filter.accidentType) {
      queryBuilder.andWhere('news.accidentType = :accidentType', {
        accidentType: filter.accidentType,
      });
    }

    if (filter.keyword) {
      queryBuilder.andWhere('news.title ILIKE :keyword', { keyword: `%${filter.keyword}%` });
    }

    const [items, total] = await queryBuilder
      .orderBy('news.publishedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<NewsArticleEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByArticleKey(articleKey: string): Promise<NewsArticleEntity | null> {
    return this.repo.findOne({ where: { articleKey } });
  }

  async save(news: Partial<NewsArticleEntity>): Promise<NewsArticleEntity> {
    const entity = this.repo.create(news);
    return this.repo.save(entity);
  }
}
