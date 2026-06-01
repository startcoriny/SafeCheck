import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Phase 5 auth 모듈 구현 시 passport-jwt 전략과 함께 활성화
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
