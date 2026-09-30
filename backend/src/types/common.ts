/**
 * Shared TypeScript types for the backend.
 */

export type SkillKey =
  | "problemSolving"
  | "analyticalThinking"
  | "decisionMaking"
  | "creativity"
  | "communication"
  | "leadership"
  | "persistence"
  | "timeManagement";

export type SkillScores = Record<SkillKey, number>;

export type UserRole = "STUDENT" | "ADMIN";

export interface JwtPayload {
  sub: string;   // user id
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
