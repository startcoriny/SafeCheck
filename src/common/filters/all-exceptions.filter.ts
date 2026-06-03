// 처리되지 않은 예외를 공통 응답으로 변환하고 에러 로그로 저장한다.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogRepository } from '../../shared/error-log/error-log.repository';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorLogRepository: ErrorLogRepository) {}

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    void this.errorLogRepository.save({
      level: 'ERROR',
      service: AllExceptionsFilter.name,
      method: 'catch',
      message:
        exception instanceof Error
          ? exception.message
          : '처리되지 않은 예외가 발생했습니다.',
      stack: exception instanceof Error ? exception.stack : undefined,
      context: {
        path: request.url,
        method: request.method,
      },
    });

    response.status(500).json({
      success: false,
      statusCode: 500,
      message: '서버 내부 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
