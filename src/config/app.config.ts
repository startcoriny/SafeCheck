import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.NODE_ENV ?? 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3001'],
}));
