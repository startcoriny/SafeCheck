// 에러 로그 저장소를 전역에서 주입할 수 있도록 등록하는 모듈.
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLogRepository } from './error-log.repository';
import { ErrorLogEntity } from './entities/error-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ErrorLogEntity])],
  providers: [ErrorLogRepository],
  exports: [ErrorLogRepository],
})
export class ErrorLogModule {}
