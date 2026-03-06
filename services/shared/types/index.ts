// ================================================
// SHARED TYPES — dùng chung cho cả 4 services
// ================================================

// Wrapper cho mọi API response
export interface ApiResponse<T = null> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// JWT payload — jti dùng làm Redis blacklist key khi logout
export interface JwtPayload {
  sub: string;              // userId
  role: 'USER' | 'ADMIN';
  jti: string;              // unique token ID
  iat: number;
  exp: number;
}

// Header cho internal calls giữa services (không qua Kong)
export interface InternalApiHeaders {
  'x-internal-secret': string;
  'x-user-id'?: string;
  'x-user-role'?: string;
  'content-type': 'application/json';
}

// Gắn vào req.user sau khi verify token
export interface AuthUser {
  id: string;
  role: 'USER' | 'ADMIN';
}

// Custom error — errorHandler middleware đọc statusCode
export class ServiceError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
