import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AppScheduleModule } from './shared/schedule/schedule.module';
import { appConfig, databaseConfig, jwtConfig, externalConfig } from './config';
import { NewsModule } from './modules/news/news.module';
import { ErrorLogModule } from './shared/error-log/error-log.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Phase별 기능 모듈 (구현 완료 시 주석 해제)
// import { ShelterModule } from './modules/shelter/shelter.module'; // Phase 3
// import { DisasterModule } from './modules/disaster/disaster.module'; // Phase 4
// import { RescueModule } from './modules/rescue/rescue.module';  // Phase 5
// import { AuthModule } from './modules/auth/auth.module';        // Phase 5
// import { CommunityModule } from './modules/community/community.module'; // Phase 6

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      load: [appConfig, databaseConfig, jwtConfig, externalConfig],
    }),
    DatabaseModule,
    AppScheduleModule,
    ErrorLogModule,
    NewsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
