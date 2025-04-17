// src/api/middlewares/csrf.middleware.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../../config/environment';
import { AppError } from './error.middleware';

// Store CSRF tokens (in memory for development, should use Redis or similar in production)
const csrfTokens = new Map<string, { token: string; expires: Date }>();

/**
 * Middleware to validate CSRF token
 */
export const validateCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF validation for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF validation for API endpoints when in development
  if (config.nodeEnv === 'development' && req.path.startsWith('/api/')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  
  if (!token) {
    next(new AppError(403, 'CSRF token missing'));
    return;
  }

  const storedToken = csrfTokens.get(token);
  
  if (!storedToken) {
    next(new AppError(403, 'Invalid CSRF token'));
    return;
  }

  // Check if token has expired
  if (storedToken.expires < new Date()) {
    csrfTokens.delete(token);
    next(new AppError(403, 'CSRF token expired'));
    return;
  }

  // Valid token, proceed
  next();
};

/**
 * Generate a new CSRF token
 * @returns CSRF token
 */
export const generateCsrfToken = (): { token: string; expires: Date } => {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiry (1 hour)
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  
  // Store token
  csrfTokens.set(token, { token, expires });
  
  return { token, expires };
};

/**
 * Clean up expired CSRF tokens
 */
export const cleanupCsrfTokens = (): void => {
  const now = new Date();
  
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
};

// Set up periodic cleanup (every 15 minutes)
setInterval(cleanupCsrfTokens, 15 * 60 * 1000);