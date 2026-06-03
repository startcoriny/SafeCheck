import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from './news.service';
import { NaverNewsCollector } from './collector/naver-news.collector';

@Injectable()
export class NewsScheduler {
  private readonly logger = new Logger(NewsScheduler.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly naverNewsCollector: NaverNewsCollector,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async collectNews(): Promise<void> {
    this.logger.log('뉴스 수집 시작');

    try {
      const rawNews = await this.naverNewsCollector.collect();
      await this.newsService.collectAndSave(rawNews);
      this.logger.log(`뉴스 수집 완료. collected=${rawNews.length}`);
    } catch (error) {
      this.logger.error('뉴스 수집 실패', error);
    }
  }
}
