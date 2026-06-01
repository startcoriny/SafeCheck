import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsService } from './news.service';

@Injectable()
export class NewsScheduler {
  private readonly logger = new Logger(NewsScheduler.name);

  constructor(private readonly newsService: NewsService) {}

  // TODO: Phase 2 구현 — 외부 뉴스 API 수집 크론
  // 수집 주기: 매 10분 (외부 API 요금제에 따라 조정)
  // @Cron(CronExpression.EVERY_10_MINUTES)
  // async collectNews(): Promise<void> {
  //   this.logger.log('뉴스 수집 시작');
  //   try {
  //     const rawNews = await this.fetchFromExternalApi();
  //     await this.newsService.collectAndSave(rawNews);
  //     this.logger.log('뉴스 수집 완료');
  //   } catch (error) {
  //     this.logger.error('뉴스 수집 실패', error);
  //   }
  // }

  // private async fetchFromExternalApi(): Promise<unknown[]> {
  //   // TODO: external.config.ts의 newsApiUrl, newsApiKey 사용
  //   throw new Error('Not implemented');
  // }
}
