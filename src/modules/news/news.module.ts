import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { NewsScheduler } from './news.scheduler';
import { NewsEntity } from './entities/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity])],
  controllers: [NewsController],
  providers: [NewsService, NewsRepository, NewsScheduler],
  exports: [NewsService],
})
export class NewsModule {}
