// src/types/custom-session.d.ts

import 'express-session';

declare module 'express-session' {
  interface Session {
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