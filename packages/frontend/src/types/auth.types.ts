// Authentication related types

export type AuthRole = 'user' | 'admin' | 'dealer' | 'cutter' | 'appraiser';

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ProfessionalRegistrationData extends RegistrationData {
  professionalType: 'dealer' | 'cutter' | 'appraiser';
  businessName: string;
  businessAddress?: string;
  phone: string;
  website?: string;
  licenseNumber?: string;
  experience?: number; // Years of experience
  specialties?: string[];
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface AuthContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  roles: AuthRole[];
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  registerProfessional: (data: ProfessionalRegistrationData) => Promise<void>;
  logout: () => void;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  verifyEmail: (data: VerifyEmailData) => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<boolean>;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: AuthRole[];
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  professionalProfile?: ProfessionalProfile;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  professionalType: 'dealer' | 'cutter' | 'appraiser';
  businessName: string;
  businessAddress?: string;
  phone: string;
  website?: string;
  licenseNumber?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
}