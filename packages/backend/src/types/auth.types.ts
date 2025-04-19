import { UserPublicProfile } from './user.types';

// Authentication token types
export interface TokenPayload {
  userId: number;
  email: string;
  roles: string[];
}

// Response with auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Authentication response with user info and tokens
export interface AuthResponse {
  user: UserPublicProfile;
  tokens: AuthTokens;
}

// Token verification response
export interface TokenVerificationResponse {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// JWT Config interface
export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

// Email verification request
export interface EmailVerificationRequest {
  token: string;
}

// Request with authenticated user
export interface AuthenticatedRequest {
  userId: number;
  email: string;
  roles: string[];
  permissions?: string[];
}

// Permission check interface
export interface PermissionCheck {
  resource: string;
  action: string;
}