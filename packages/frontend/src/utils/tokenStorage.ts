// Token storage utility for managing JWT tokens

import { AuthToken } from '../types/auth.types';

const TOKEN_KEY = 'gemstone_auth_token';

/**
 * Store authentication tokens securely
 */
export const storeTokens = (tokens: AuthToken): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

/**
 * Retrieve stored authentication tokens
 */
export const getTokens = (): AuthToken | null => {
  const tokensStr = localStorage.getItem(TOKEN_KEY);
  if (!tokensStr) return null;
  
  try {
    return JSON.parse(tokensStr) as AuthToken;
  } catch (error) {
    console.error('Error parsing auth tokens', error);
    return null;
  }
};

/**
 * Get the access token
 */
export const getAccessToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.token || null;
};

/**
 * Get the refresh token
 */
export const getRefreshToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.refreshToken || null;
};

/**
 * Check if the access token is expired
 */
export const isTokenExpired = (): boolean => {
  const tokens = getTokens();
  if (!tokens) return true;
  
  // Add a 30-second buffer to account for network latency
  const currentTime = Date.now();
  const expiryTime = tokens.expiresAt - 30000;
  
  return currentTime >= expiryTime;
};

/**
 * Remove stored tokens on logout
 */
export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Update the stored tokens (useful after refresh)
 */
export const updateTokens = (newTokens: Partial<AuthToken>): void => {
  const currentTokens = getTokens();
  if (!currentTokens) return;
  
  storeTokens({
    ...currentTokens,
    ...newTokens
  });
};