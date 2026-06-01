// 뉴스 기능 모듈 — 엔티티, 컨트롤러, 서비스, 스케줄러 등록
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { NewsScheduler } from './news.scheduler';
import { NewsArticleEntity } from './entities/news.entity';
import { NewsCollectLogEntity } from './entities/news-collect-log.entity';
import { NewsCollectLockEntity } from './entities/news-collect-lock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsArticleEntity, NewsCollectLogEntity, NewsCollectLockEntity])],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository, NewsScheduler],
  exports: [NewsService],
})
export class NewsModule {}
