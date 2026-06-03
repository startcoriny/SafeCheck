// 뉴스 비즈니스 로직과 키워드 기반 위험도 계산을 처리한다.
import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsRepository } from './news.repository';
import { NewsQueryDto } from './dto/news-query.dto';
import { NewsListResponseDto, NewsResponseDto } from './dto/news-response.dto';
import { NewsArticleEntity } from './entities/news.entity';
import {
  AccidentType,
  AiAnalysisStatus,
  FilterReason,
  NewsFilter,
  RawNewsItem,
  RiskLevel,
  Source,
} from './interfaces/news.types';

type KeywordMap = Record<string, string[]>;
type ScoreMap = Record<string, number>;

interface RiskScoreRules {
  accidentTypeScores: Record<AccidentType, number>;
  casualtyKeywordScores: ScoreMap;
  scaleKeywordScores: ScoreMap;
  publicImpactKeywordScores: ScoreMap;
  locationWeightScores: ScoreMap;
  riskLevelThresholds: Record<RiskLevel, [number, number]>;
}

interface RiskScoreResult {
  score: number;
  riskLevel: RiskLevel;
  accidentType: AccidentType;
  matchedIncludeKeywords: string[];
  matchedExcludeKeywords: string[];
}

@Injectable()
export class NewsService {
  constructor(private readonly newsRepository: NewsRepository) {}

  async findAll(query: NewsQueryDto): Promise<NewsListResponseDto> {
    const filter: NewsFilter = {
      region: query.region,
      district: query.district,
      riskLevel: query.riskLevel,
      accidentType: query.accidentType,
      keyword: query.keyword,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };

    const result = await this.newsRepository.findAll(filter);

    return {
      items: result.items.map((item) => this.toResponseDto(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async findById(id: number): Promise<NewsResponseDto> {
    const news = await this.newsRepository.findById(id);

    if (!news) {
      throw new NotFoundException(`뉴스를 찾을 수 없습니다. id=${id}`);
    }

    return this.toResponseDto(news);
  }

  async collectAndSave(rawNews: RawNewsItem[]): Promise<void> {
    const includeKeywords = this.readJsonFile<KeywordMap>(
      'include-keywords.json',
    );
    const excludeKeywords = this.readJsonFile<string[]>(
      'exclude-keywords.json',
    );
    const accidentTypeKeywords = this.readJsonFile<
      Record<AccidentType, string[]>
    >('accident-type-keywords.json');
    const rules = this.readJsonFile<RiskScoreRules>('risk-score-rules.json');

    for (const rawItem of rawNews) {
      const existingNews = await this.newsRepository.findByArticleKey(
        rawItem.articleKey,
      );

      if (existingNews) {
        continue;
      }

      const risk = this.assignRiskScore(
        rawItem.title,
        includeKeywords,
        excludeKeywords,
        accidentTypeKeywords,
        rules,
      );
      const filterReason = this.resolveFilterReason(risk);

      await this.newsRepository.save({
        source: Source.NAVER_NEWS,
        articleKey: rawItem.articleKey,
        pressCode: rawItem.pressCode,
        articleId: rawItem.articleId,
        title: rawItem.title,
        url: rawItem.url,
        publisher: rawItem.publisher,
        publishedAt: rawItem.publishedAt,
        collectedAt: new Date(),
        matchedIncludeKeywords: risk.matchedIncludeKeywords,
        matchedExcludeKeywords: risk.matchedExcludeKeywords,
        isFiltered: filterReason === FilterReason.INCLUDE_KEYWORD_MATCHED,
        filterReason,
        accidentType: risk.accidentType,
        riskLevel: risk.riskLevel,
        riskScore: risk.score,
        region: null,
        district: null,
        latitude: null,
        longitude: null,
        aiSummary: null,
        aiAnalysisStatus: AiAnalysisStatus.PENDING,
      });
    }
  }

  assignRiskScoreByTitle(title: string): RiskScoreResult {
    return this.assignRiskScore(title);
  }

  private assignRiskScore(
    title: string,
    includeKeywords = this.readJsonFile<KeywordMap>('include-keywords.json'),
    excludeKeywords = this.readJsonFile<string[]>('exclude-keywords.json'),
    accidentTypeKeywords = this.readJsonFile<Record<AccidentType, string[]>>(
      'accident-type-keywords.json',
    ),
    rules = this.readJsonFile<RiskScoreRules>('risk-score-rules.json'),
  ): RiskScoreResult {
    const matchedIncludeKeywords = this.findMatchedKeywords(
      title,
      Object.values(includeKeywords).flat(),
    );
    const matchedExcludeKeywords = this.findMatchedKeywords(
      title,
      excludeKeywords,
    );
    const accidentType = this.resolveAccidentType(
      title,
      accidentTypeKeywords,
      rules.accidentTypeScores,
    );
    const score =
      rules.accidentTypeScores[accidentType] +
      this.sumMatchedKeywordScores(title, rules.casualtyKeywordScores) +
      this.sumMatchedKeywordScores(title, rules.scaleKeywordScores) +
      this.sumMatchedKeywordScores(title, rules.publicImpactKeywordScores);

    return {
      score,
      riskLevel: this.resolveRiskLevel(score, rules.riskLevelThresholds),
      accidentType,
      matchedIncludeKeywords,
      matchedExcludeKeywords,
    };
  }

  private resolveFilterReason(risk: RiskScoreResult): FilterReason {
    if (risk.matchedIncludeKeywords.length === 0) {
      return FilterReason.NO_INCLUDE_KEYWORD;
    }

    if (risk.matchedExcludeKeywords.length > 0) {
      return FilterReason.EXCLUDE_KEYWORD_MATCHED;
    }

    if (risk.riskLevel === RiskLevel.LOW) {
      return FilterReason.LOW_RISK_SCORE;
    }

    return FilterReason.INCLUDE_KEYWORD_MATCHED;
  }

  private toResponseDto(news: NewsArticleEntity): NewsResponseDto {
    return {
      id: news.id,
      title: news.title,
      url: news.url,
      publisher: news.publisher,
      publishedAt: news.publishedAt,
      collectedAt: news.collectedAt,
      accidentType: news.accidentType,
      riskLevel: news.riskLevel,
      riskScore: news.riskScore,
      region: news.region,
      district: news.district,
    };
  }

  private resolveAccidentType(
    title: string,
    accidentTypeKeywords: Record<AccidentType, string[]>,
    accidentTypeScores: Record<AccidentType, number>,
  ): AccidentType {
    let selectedType = AccidentType.ETC;
    let selectedScore = accidentTypeScores[AccidentType.ETC] ?? 0;

    for (const [type, keywords] of Object.entries(accidentTypeKeywords) as [
      AccidentType,
      string[],
    ][]) {
      if (
        type === AccidentType.ETC ||
        this.findMatchedKeywords(title, keywords).length === 0
      ) {
        continue;
      }

      const score = accidentTypeScores[type] ?? 0;
      if (score > selectedScore) {
        selectedType = type;
        selectedScore = score;
      }
    }

    return selectedType;
  }

  private resolveRiskLevel(
    score: number,
    thresholds: Record<RiskLevel, [number, number]>,
  ): RiskLevel {
    for (const level of [
      RiskLevel.LOW,
      RiskLevel.MEDIUM,
      RiskLevel.HIGH,
      RiskLevel.CRITICAL,
    ]) {
      const [min, max] = thresholds[level];
      if (score >= min && score <= max) {
        return level;
      }
    }

    return RiskLevel.CRITICAL;
  }

  private sumMatchedKeywordScores(
    title: string,
    keywordScores: ScoreMap,
  ): number {
    return Object.entries(keywordScores).reduce((sum, [keyword, score]) => {
      return this.includesKeyword(title, keyword) ? sum + score : sum;
    }, 0);
  }

  private findMatchedKeywords(title: string, keywords: string[]): string[] {
    return [
      ...new Set(
        keywords.filter((keyword) => this.includesKeyword(title, keyword)),
      ),
    ];
  }

  private includesKeyword(title: string, keyword: string): boolean {
    return title.toLowerCase().includes(keyword.toLowerCase());
  }

  private readJsonFile<T>(fileName: string): T {
    const filePath = join(process.cwd(), 'keywords', fileName);
    const content = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(content) as T;
  }
}
