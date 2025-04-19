import jwt from 'jsonwebtoken';
import { TokenPayload, TokenVerificationResponse } from '../types/auth.types';
import config from '../config/auth';

/**
 * Generate an access token with user information
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  // Using explicit any typing to bypass TypeScript checks for the jsonwebtoken library
  // This is necessary because of the complex typing in the library
  return jwt.sign(
    payload as any, 
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessTokenExpiry } as any
  );
};

/**
 * Generate a refresh token with user information
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload as any, 
    config.jwt.refreshTokenSecret,
    { expiresIn: config.jwt.refreshTokenExpiry } as any
  );
};

/**
 * Verify an access token and return decoded payload
 */
export const verifyAccessToken = (token: string): TokenVerificationResponse => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as TokenPayload;
    return {
      isValid: true,
      payload: decoded,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
};

/**
 * Verify a refresh token and return decoded payload
 */
export const verifyRefreshToken = (token: string): TokenVerificationResponse => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshTokenSecret) as TokenPayload;
    return {
      isValid: true,
      payload: decoded,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: getExpiryTime(config.jwt.accessTokenExpiry),
  };
};

/**
 * Calculate expiry time in seconds
 */
export const getExpiryTime = (expiryString: string): number => {
  // Parse the expiry string (e.g., '15m', '1h', '7d')
  const match = expiryString.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default to 1 hour if format is invalid
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 3600;
  }
};

/**
 * Extract JWT token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};