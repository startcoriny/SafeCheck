// NewsService 조회, 수집 저장, 위험도 계산 단위 테스트
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from '../news.service';
import { NewsRepository } from '../news.repository';
import { NewsArticleEntity } from '../entities/news.entity';
import {
  AccidentType,
  AiAnalysisStatus,
  FilterReason,
  RawNewsItem,
  RiskLevel,
  Source,
} from '../interfaces/news.types';

type MockNewsRepository = {
  findAll: jest.Mock;
  findById: jest.Mock;
  findByArticleKey: jest.Mock;
  save: jest.Mock;
};

describe('NewsService', () => {
  let service: NewsService;
  let repository: MockNewsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: NewsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByArticleKey: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    repository = module.get<MockNewsRepository>(NewsRepository);
  });

  describe('findAll', () => {
    it('정상 조회 결과를 응답 DTO로 반환한다', async () => {
      const article = createNewsArticle({ id: 1, title: '서울 화재 발생' });
      repository.findAll.mockResolvedValue({
        items: [article],
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(repository.findAll).toHaveBeenCalledWith({
        region: undefined,
        district: undefined,
        riskLevel: undefined,
        accidentType: undefined,
        keyword: undefined,
        page: 1,
        limit: 20,
      });
      expect(result).toEqual({
        items: [
          {
            id: article.id,
            title: article.title,
            url: article.url,
            publisher: article.publisher,
            publishedAt: article.publishedAt,
            collectedAt: article.collectedAt,
            accidentType: article.accidentType,
            riskLevel: article.riskLevel,
            riskScore: article.riskScore,
            region: article.region,
            district: article.district,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('빈 결과를 반환한다', async () => {
      repository.findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await expect(service.findAll({})).resolves.toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('findById', () => {
    it('정상 조회 결과를 응답 DTO로 반환한다', async () => {
      const article = createNewsArticle({ id: 10, title: '교통사고 발생' });
      repository.findById.mockResolvedValue(article);

      const result = await service.findById(10);

      expect(repository.findById).toHaveBeenCalledWith(10);
      expect(result.id).toBe(10);
      expect(result.title).toBe('교통사고 발생');
    });

    it('기사 없으면 NotFoundException을 던진다', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('collectAndSave', () => {
    it('중복 기사는 저장하지 않는다', async () => {
      const rawNews = [
        createRawNewsItem({ articleKey: 'NAVER:001:0000000001' }),
      ];
      repository.findByArticleKey.mockResolvedValue(createNewsArticle());

      await service.collectAndSave(rawNews);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('신규 기사를 위험도 계산 결과와 함께 저장한다', async () => {
      const publishedAt = new Date('2026-06-01T01:00:00.000Z');
      const rawNews = [
        createRawNewsItem({
          articleKey: 'NAVER:001:0000000002',
          pressCode: '001',
          articleId: '0000000002',
          title: '서울 도로 충돌 사고로 부상',
          publishedAt,
        }),
      ];
      repository.findByArticleKey.mockResolvedValue(null);

      await service.collectAndSave(rawNews);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          source: Source.NAVER_NEWS,
          articleKey: 'NAVER:001:0000000002',
          pressCode: '001',
          articleId: '0000000002',
          title: '서울 도로 충돌 사고로 부상',
          publishedAt,
          matchedIncludeKeywords: expect.arrayContaining(['충돌', '부상']),
          matchedExcludeKeywords: [],
          isFiltered: true,
          filterReason: FilterReason.INCLUDE_KEYWORD_MATCHED,
          accidentType: AccidentType.COLLISION,
          riskLevel: expect.any(String),
          riskScore: expect.any(Number),
          aiAnalysisStatus: AiAnalysisStatus.PENDING,
        }),
      );

      const savedNews = repository.save.mock.calls[0][0] as {
        riskScore: number;
      };
      expect(savedNews.riskScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('assignRiskScore', () => {
    it.each([
      ['LOW', '오늘 서울 날씨 맑음', RiskLevel.LOW],
      ['MEDIUM', '도로 추돌 사고 발생', RiskLevel.MEDIUM],
      ['HIGH', '상가 화재로 중상 발생', RiskLevel.HIGH],
      ['CRITICAL', '공장 폭발로 사망자 발생 긴급대피', RiskLevel.CRITICAL],
    ])('%s 등급을 계산한다', (_caseName, title, expectedRiskLevel) => {
      const result = service.assignRiskScoreByTitle(title);

      expect(result.riskLevel).toBe(expectedRiskLevel);
    });
  });
});

function createRawNewsItem(overrides: Partial<RawNewsItem> = {}): RawNewsItem {
  return {
    articleKey: 'NAVER:001:0000000001',
    pressCode: '001',
    articleId: '0000000001',
    title: '서울 화재 발생',
    url: 'https://n.news.naver.com/article/001/0000000001',
    publisher: '테스트신문',
    publishedAt: new Date('2026-06-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createNewsArticle(
  overrides: Partial<NewsArticleEntity> = {},
): NewsArticleEntity {
  const date = new Date('2026-06-01T00:00:00.000Z');

  return {
    id: 1,
    source: Source.NAVER_NEWS,
    articleKey: 'NAVER:001:0000000001',
    pressCode: '001',
    articleId: '0000000001',
    title: '서울 화재 발생',
    url: 'https://n.news.naver.com/article/001/0000000001',
    publisher: '테스트신문',
    publishedAt: date,
    collectedAt: date,
    matchedIncludeKeywords: ['화재'],
    matchedExcludeKeywords: [],
    isFiltered: true,
    filterReason: FilterReason.INCLUDE_KEYWORD_MATCHED,
    accidentType: AccidentType.FIRE,
    riskLevel: RiskLevel.MEDIUM,
    riskScore: 8,
    region: null,
    district: null,
    latitude: null,
    longitude: null,
    aiSummary: null,
    aiAnalysisStatus: AiAnalysisStatus.PENDING,
    createdAt: date,
    updatedAt: date,
    ...overrides,
  };
}
