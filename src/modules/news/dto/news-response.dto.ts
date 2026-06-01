// 뉴스 API 응답 DTO
import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel, AccidentType } from '../interfaces/news.types';

export class NewsResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  publisher: string;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty()
  collectedAt: Date;

  @ApiProperty({ enum: AccidentType })
  accidentType: AccidentType;

  @ApiProperty({ enum: RiskLevel })
  riskLevel: RiskLevel;

  @ApiProperty()
  riskScore: number;

  @ApiProperty({ nullable: true })
  region: string | null;

  @ApiProperty({ nullable: true })
  district: string | null;
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
