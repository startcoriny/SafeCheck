import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// TypeORM CLI 전용 DataSource (migration:generate, migration:run에서 사용)
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'safe_check',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
