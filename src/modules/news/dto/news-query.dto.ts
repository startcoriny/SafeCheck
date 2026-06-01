import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel, NewsCategory } from '../interfaces/news.types';

export class NewsQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 크기 (최대 50)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '지역 필터 (예: 서울, 부산)' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ enum: RiskLevel, description: '위험도 필터' })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ enum: NewsCategory, description: '카테고리 필터' })
  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;
}
