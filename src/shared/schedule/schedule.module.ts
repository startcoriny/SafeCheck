import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// ScheduleModule.forRoot()는 앱 전체에서 한 번만 등록
// 각 도메인의 *.scheduler.ts에서 @Cron, @Interval 데코레이터 사용
@Module({
  imports: [ScheduleModule.forRoot()],
  exports: [ScheduleModule],
})
export class AppScheduleModule {}
