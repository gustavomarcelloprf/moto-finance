/**
 * Códigos de erro canônicos — ARCHITECTURE.md > AGENT-SECTION: api-contracts
 * Toda Server Action retorna { data, error } onde error.code é um destes.
 */
export const ERROR_CODES = [
  'AUTH_REQUIRED',
  'PLAN_LIMIT',
  'VALIDATION',
  'NOT_FOUND',
  'RATE_LIMITED',
  'CONFLICT',
  'EXTERNAL_FAILURE',
  'INTERNAL'
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type AppError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

export type Result<T> = { data: T; error: null } | { data: null; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

export function fail<T = never>(code: ErrorCode, message: string, details?: unknown): Result<T> {
  return { data: null, error: { code, message, details } };
}
