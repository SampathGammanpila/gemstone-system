// Type definitions for express-session
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    adminUser?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    pendingMfaUser?: {
      id: string;
      email: string;
    };
    tempMfaSecret?: string;
    returnTo?: string;
  }
}