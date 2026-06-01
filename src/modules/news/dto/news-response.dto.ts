import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel, NewsCategory } from '../interfaces/news.types';

export class NewsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  source: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty({ enum: RiskLevel })
  riskLevel: RiskLevel;

  @ApiProperty({ enum: NewsCategory })
  category: NewsCategory;

  @ApiProperty()
  region: string;

  @ApiProperty()
  createdAt: Date;
}

export class NewsListResponseDto {
  @ApiProperty({ type: [NewsResponseDto] })
  items: NewsResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
