// 뉴스 목록 조회 요청 파라미터 DTO
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel, AccidentType } from '../interfaces/news.types';

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

  @ApiPropertyOptional({ description: '시/도 필터 (예: 서울, 부산)' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '시/군/구 필터 (예: 강남구, 해운대구)' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ enum: RiskLevel, description: '위험도 필터' })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ enum: AccidentType, description: '사고 유형 필터' })
  @IsOptional()
  @IsEnum(AccidentType)
  accidentType?: AccidentType;

  @ApiPropertyOptional({ description: '키워드 검색 (기사 제목 기준)' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
