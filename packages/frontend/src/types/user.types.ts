// User related types
import { AuthRole, ProfessionalProfile } from './auth.types';

export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  marketplaceUpdates: boolean;
  certificateAlerts: boolean;
  transferNotifications: boolean;
  newMessageNotifications: boolean;
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
}

export interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email' | null;
  lastPasswordChange: string;
  sessionTimeout: number; // In minutes
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: File | null;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateSettingsData {
  emailNotifications?: boolean;
  marketplaceUpdates?: boolean;
  certificateAlerts?: boolean;
  transferNotifications?: boolean;
  newMessageNotifications?: boolean;
  language?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface UpdateSecurityData {
  twoFactorEnabled?: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email' | null;
  sessionTimeout?: number;
}

export interface UserState {
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: AuthRole[];
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: string;
    professionalProfile?: ProfessionalProfile;
  } | null;
  settings: UserSettings | null;
  security: SecuritySettings | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserContextState extends UserState {
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updatePassword: (data: UpdatePasswordData) => Promise<void>;
  updateSettings: (data: UpdateSettingsData) => Promise<void>;
  updateSecurity: (data: UpdateSecurityData) => Promise<void>;
  setupTwoFactor: (method: 'app' | 'sms' | 'email') => Promise<{ secret?: string, qrCode?: string }>;
  verifyTwoFactor: (code: string) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}