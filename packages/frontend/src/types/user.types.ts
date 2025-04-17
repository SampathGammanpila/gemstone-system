export interface UserType {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    phone?: string;
    is_email_verified: boolean;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
    roles: string[];
  }
  
  export interface Role {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface UserProfileUpdateType {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }
  
  export interface PasswordUpdateType {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }
  
  export interface PasswordResetType {
    token: string;
    password: string;
    confirm_password: string;
  }
  
  export interface UserRegistrationType {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }
  
  export interface ProfessionalRegistrationType extends UserRegistrationType {
    business_name?: string;
    business_description?: string;
    years_of_experience?: number;
    specializations?: string[];
    website?: string;
    professional_types: string[]; // "dealer", "cutter", "appraiser"
  }