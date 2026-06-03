// 네이버 사건사고 섹션에서 최신 기사 메타데이터를 수집한다.
import { Injectable, Logger } from '@nestjs/common';
import { NewsRepository } from '../news.repository';
import { RawNewsItem } from '../interfaces/news.types';

interface PersistMeta {
  cursor: string | null;
  hasNext: boolean;
  pageNo: number;
}

interface ParsedArticle {
  articleKey: string;
  pressCode: string;
  articleId: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: Date;
}

@Injectable()
export class NaverNewsCollector {
  private readonly logger = new Logger(NaverNewsCollector.name);
  private readonly sectionUrl: string;
  private readonly moreUrl: string;
  private readonly articleBaseUrl: string;
  private readonly maxPageCount = 3;
  private readonly maxCollectCount = 100;
  private readonly requestIntervalMs = 500;

  constructor(private readonly newsRepository: NewsRepository) {
    this.sectionUrl = this.getRequiredUrl(
      'BASE_NAVER_NEWS_URL',
      process.env.BASE_NAVER_NEWS_URL,
    );
    this.moreUrl = this.getRequiredUrl(
      'BASE_MORE_REQ_URL',
      process.env.BASE_MORE_REQ_URL,
    );
    this.articleBaseUrl = this.getRequiredUrl(
      'BASE_NAVER_ARTICLE_URL',
      process.env.BASE_NAVER_ARTICLE_URL,
    );
  }

  async collect(): Promise<RawNewsItem[]> {
    const targetDate = this.getKstDate();
    const initialHtml = await this.fetchHtml(
      `${this.sectionUrl}?date=${targetDate}`,
    );
    const collected: RawNewsItem[] = [];

    const initialCursor = this.extractInitialCursor(initialHtml);
    let shouldStop = await this.appendNewArticles(initialHtml, collected);

    if (!initialCursor || shouldStop) {
      return collected;
    }

    let cursor: string | null = initialCursor;
    let hasNext = true;
    let pageNo = 1;
    let requestedPageCount = 1;

    while (
      cursor &&
      hasNext &&
      requestedPageCount < this.maxPageCount &&
      collected.length < this.maxCollectCount
    ) {
      await this.delay(this.requestIntervalMs);

      const html = await this.fetchHtml(
        this.buildMoreUrl(targetDate, cursor, pageNo),
      );
      requestedPageCount += 1;

      shouldStop = await this.appendNewArticles(html, collected);
      if (shouldStop) {
        break;
      }

      const meta = this.extractPersistMeta(html);
      cursor = meta.cursor;
      hasNext = meta.hasNext;
      pageNo = meta.pageNo;
    }

    return collected;
  }

  private async appendNewArticles(
    html: string,
    collected: RawNewsItem[],
  ): Promise<boolean> {
    const articles = this.parseArticles(html);

    for (const article of articles) {
      if (collected.length >= this.maxCollectCount) {
        return true;
      }

      const existingNews = await this.newsRepository.findByArticleKey(
        article.articleKey,
      );
      if (existingNews) {
        return true;
      }

      collected.push(article);
    }

    return false;
  }

  private parseArticles(html: string): ParsedArticle[] {
    const articles = new Map<string, ParsedArticle>();
    const articleUrlPattern =
      /(?:https?:)?\/\/n\.news\.naver\.com\/article\/(\d{3})\/(\d{10})[^"'<\s]*/g;
    let match: RegExpExecArray | null;

    while ((match = articleUrlPattern.exec(html)) !== null) {
      const pressCode = match[1];
      const articleId = match[2];
      const url = `${this.articleBaseUrl}/${pressCode}/${articleId}`;
      const articleKey = `NAVER:${pressCode}:${articleId}`;

      if (articles.has(articleKey)) {
        continue;
      }

      const block = this.extractArticleBlock(html, match.index);
      const title = this.extractTitle(block);

      if (!title) {
        this.logger.warn(
          `네이버 기사 제목 파싱 실패. articleKey=${articleKey}`,
        );
        continue;
      }

      articles.set(articleKey, {
        articleKey,
        pressCode,
        articleId,
        title,
        url,
        publisher: this.extractPublisher(block),
        publishedAt: this.extractPublishedAt(block),
      });
    }

    return [...articles.values()];
  }

  private extractArticleBlock(html: string, articleUrlIndex: number): string {
    const start = Math.max(0, html.lastIndexOf('<li', articleUrlIndex));
    const nextStart = html.indexOf('<li', articleUrlIndex + 1);
    const end =
      nextStart === -1
        ? Math.min(html.length, articleUrlIndex + 5000)
        : nextStart;

    return html.slice(start, end);
  }

  private extractTitle(block: string): string {
    const titleByClass = block.match(
      /<(?:strong|span|a)[^>]+class=["'][^"']*(?:sa_text_strong|cluster_text_headline|news_tit)[^"']*["'][^>]*>([\s\S]*?)<\/(?:strong|span|a)>/i,
    );

    if (titleByClass?.[1]) {
      return this.cleanText(titleByClass[1]);
    }

    const titleByAttribute = block.match(/title=["']([^"']+)["']/i);
    if (titleByAttribute?.[1]) {
      return this.decodeHtml(titleByAttribute[1]).trim();
    }

    const linkedText = block.match(
      /<a[^>]+n\.news\.naver\.com\/article\/\d{3}\/\d{10}[^>]*>([\s\S]*?)<\/a>/i,
    );
    return linkedText?.[1] ? this.cleanText(linkedText[1]) : '';
  }

  private extractPublisher(block: string): string {
    const publisher = block.match(
      /<(?:span|div)[^>]+class=["'][^"']*(?:press|sa_text_press|writing)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div)>/i,
    );

    return publisher?.[1] ? this.cleanText(publisher[1]) : '';
  }

  private extractPublishedAt(block: string): Date {
    const datetime = block.match(/datetime=["']([^"']+)["']/i);
    if (datetime?.[1]) {
      return this.parseDate(datetime[1]);
    }

    const dataDate = block.match(/data-date-time=["']([^"']+)["']/i);
    if (dataDate?.[1]) {
      return this.parseDate(dataDate[1]);
    }

    return new Date();
  }

  private extractInitialCursor(html: string): string | null {
    const cursor = html.match(
      /data-cursor-name=["']next["'][^>]*data-cursor=["']([^"']+)["']/i,
    );
    if (cursor?.[1]) {
      return cursor[1];
    }

    const reversedCursor = html.match(
      /data-cursor=["']([^"']+)["'][^>]*data-cursor-name=["']next["']/i,
    );
    return reversedCursor?.[1] ?? null;
  }

  private extractPersistMeta(html: string): PersistMeta {
    const metaMatch = html.match(/data-persist-meta=["']([^"']+)["']/i);

    if (!metaMatch?.[1]) {
      return {
        cursor: null,
        hasNext: false,
        pageNo: 1,
      };
    }

    const meta = JSON.parse(this.decodeHtml(metaMatch[1])) as {
      cursor?: string;
      'has-next'?: boolean;
      'page-no'?: number;
    };

    return {
      cursor: meta.cursor ?? null,
      hasNext: meta['has-next'] ?? false,
      pageNo: meta['page-no'] ?? 1,
    };
  }

  private buildMoreUrl(date: string, cursor: string, pageNo: number): string {
    const url = new URL(this.moreUrl);
    url.searchParams.set('sid', '102');
    url.searchParams.set('sid2', '249');
    url.searchParams.set('cluid', '');
    url.searchParams.set('pageNo', String(pageNo));
    url.searchParams.set('date', date);
    url.searchParams.set('next', cursor);
    url.searchParams.set('_', String(Date.now()));

    return url.toString();
  }

  private getRequiredUrl(name: string, value: string | undefined): string {
    const url = value?.trim();

    if (!url) {
      throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
    }

    return url;
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`네이버 뉴스 요청 실패. status=${response.status}`);
    }

    return response.text();
  }

  private parseDate(value: string): Date {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private cleanText(value: string): string {
    return this.decodeHtml(value.replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim();
  }

  private decodeHtml(value: string): string {
    return value
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }

  private getKstDate(): string {
    const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
