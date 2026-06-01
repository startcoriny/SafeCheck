export const ERROR_CODES = {
  // ─── Common ───────────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 'COMMON_001',
  VALIDATION_FAILED: 'COMMON_002',
  NOT_FOUND: 'COMMON_003',
  FORBIDDEN: 'COMMON_004',

  // ─── Auth (Phase 5) ───────────────────────────────────────────────────────
  UNAUTHORIZED: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  INVALID_TOKEN: 'AUTH_003',
  INVALID_CREDENTIALS: 'AUTH_004',

  // ─── News (Phase 2) ───────────────────────────────────────────────────────
  NEWS_NOT_FOUND: 'NEWS_001',

  // ─── Shelter (Phase 3) ────────────────────────────────────────────────────
  SHELTER_NOT_FOUND: 'SHELTER_001',

  // ─── Disaster (Phase 4) ───────────────────────────────────────────────────
  DISASTER_ALERT_NOT_FOUND: 'DISASTER_001',

  // ─── Rescue (Phase 5) ─────────────────────────────────────────────────────
  RESCUE_NOT_FOUND: 'RESCUE_001',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
