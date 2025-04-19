// Define user status enum
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
  }
  
  // Verification types for tokens
  export enum VerificationType {
    EMAIL_VERIFICATION = 'email_verification',
    PASSWORD_RESET = 'password_reset',
    TWO_FACTOR = 'two_factor',
  }
  
  // Role types for predefined roles
  export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    DEALER = 'dealer',
    CUTTER = 'cutter',
    APPRAISER = 'appraiser',
  }
  
  // User attributes interface
  export interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    status: UserStatus;
    profileImage?: string;
    isEmailVerified: boolean;
    refreshToken?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // User creation attributes interface for Sequelize
  export interface UserCreationAttributes {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    status: UserStatus;
    profileImage?: string;
    isEmailVerified: boolean;
    refreshToken?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
  }
  
  // Role attributes interface
  export interface RoleAttributes {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    permissions?: PermissionAttributes[]; // Added for role-permission associations
  }
  
  // Role creation attributes interface for Sequelize
  export interface RoleCreationAttributes {
    name: string;
    description?: string;
  }
  
  // Permission attributes interface
  export interface PermissionAttributes {
    id: number;
    name: string;
    resource: string;
    action: string; 
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Verification attributes interface
  export interface VerificationAttributes {
    id: number;
    userId: number;
    token: string;
    type: VerificationType;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // User with roles - extended interface
  export interface UserWithRoles extends UserAttributes {
    roles?: RoleAttributes[];
  }
  
  // User registration request
  export interface UserRegistrationRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }
  
  // User login request
  export interface UserLoginRequest {
    email: string;
    password: string;
  }
  
  // Password reset request
  export interface PasswordResetRequest {
    email: string;
  }
  
  // New password with token
  export interface NewPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
  }
  
  // User profile update request
  export interface UserProfileUpdateRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profileImage?: string;
  }
  
  // User with permissions - for authorization
  export interface UserWithPermissions extends UserAttributes {
    roles: RoleAttributes[];
    permissions: PermissionAttributes[];
  }
  
  // User public profile - safe to expose
  export interface UserPublicProfile {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
    roles: string[];
    createdAt: Date;
  }