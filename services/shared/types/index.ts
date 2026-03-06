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

// jti dùng để blacklist token trong Redis khi logout
export interface JwtPayload {
  sub: string;
  role: 'USER' | 'ADMIN';
  jti: string;
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

export interface AuthUser {
  id: string;
  role: 'USER' | 'ADMIN';
}

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
