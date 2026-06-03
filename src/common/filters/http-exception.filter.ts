import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogRepository } from '../../shared/error-log/error-log.repository';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogRepository: ErrorLogRepository) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as { message?: string | string[] }).message
        : exception.message;

    if (status >= 500) {
      void this.errorLogRepository.save({
        level: 'ERROR',
        service: HttpExceptionFilter.name,
        method: 'catch',
        message: Array.isArray(message) ? message.join(', ') : String(message),
        stack: exception.stack,
        context: {
          path: request.url,
          method: request.method,
        },
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
