// 뉴스 REST API 컨트롤러
import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { NewsListResponseDto, NewsResponseDto } from './dto/news-response.dto';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // TODO: Phase 2 구현 — docs/domain/news/feature-definition.md 참조
  @ApiOperation({ summary: '뉴스 목록 조회 (페이지네이션, 필터)' })
  @ApiResponse({ status: 200, type: NewsListResponseDto })
  @Get()
  findAll(@Query() query: NewsQueryDto): Promise<NewsListResponseDto> {
    return this.newsService.findAll(query);
  }

  @ApiOperation({ summary: '뉴스 상세 조회' })
  @ApiResponse({ status: 200, type: NewsResponseDto })
  @ApiResponse({ status: 404, description: '뉴스를 찾을 수 없음' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NewsResponseDto> {
    return this.newsService.findById(id);
  }
}
