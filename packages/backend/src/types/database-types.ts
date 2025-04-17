// User and Authentication Interfaces
export interface User {
    id: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    phone?: string;
    address?: string;
    is_email_verified: boolean;
    verification_token?: string;
    reset_token?: string;
    reset_token_expires?: Date;
    last_login?: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Role {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface Permission {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface UserRole {
    user_id: string;
    role_id: number;
  }
  
  export interface RolePermission {
    role_id: number;
    permission_id: number;
  }
  
  // Professional Profile Interfaces
  export interface Professional {
    id: string;
    user_id: string;
    business_name?: string;
    business_description?: string;
    years_of_experience?: number;
    specializations?: string[];
    website?: string;
    social_media?: Record<string, string>;
    is_verified: boolean;
    verification_status: 'pending' | 'approved' | 'rejected';
    rating?: number;
    review_count: number;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ProfessionalType {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface ProfessionalProfessionalType {
    professional_id: string;
    professional_type_id: number;
  }
  
  export interface VerificationDocument {
    id: string;
    professional_id: string;
    document_type: string;
    document_url: string;
    verification_notes?: string;
    is_verified: boolean;
    verified_by?: string;
    verified_at?: Date;
    created_at: Date;
    updated_at: Date;
  }
  
  // Reference Data Interfaces
  export interface GemstoneFamily {
    id: number;
    name: string;
    category: string;
    description?: string;
    hardness_min?: number;
    hardness_max?: number;
    chemical_formula?: string;
    crystal_system?: string;
    refractive_index_min?: number;
    refractive_index_max?: number;
    specific_gravity_min?: number;
    specific_gravity_max?: number;
    cleavage?: string;
    luster?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CutShape {
    id: number;
    name: string;
    category: string;
    description?: string;
    image_url?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Color {
    id: number;
    name: string;
    display_name: string;
    hex_code: string;
    category?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ColorGrade {
    id: number;
    grade: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ClarityGrade {
    id: number;
    grade: string;
    description?: string;
    category: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface QualityStandard {
    id: number;
    name: string;
    description?: string;
    applies_to: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface MiningLocation {
    id: number;
    name: string;
    country: string;
    region?: string;
    locality?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  // Gemstone Interfaces
  export interface RoughStone {
    id: string;
    unique_id: string;
    owner_id?: string;
    gemstone_family_id?: number;
    color_id?: number;
    weight_carats?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    origin_id?: number;
    mining_method?: string;
    quality_grade?: string;
    potential_yield?: number;
    estimated_value?: number;
    currency: string;
    notes?: string;
    is_public: boolean;
    is_draft: boolean;
    is_verified: boolean;
    verified_by?: string;
    verified_at?: Date;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface RoughStoneImage {
    id: string;
    rough_stone_id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    created_at: Date;
  }
  
  export interface Gemstone {
    id: string;
    unique_id: string;
    owner_id?: string;
    gemstone_family_id?: number;
    cut_shape_id?: number;
    color_id?: number;
    color_grade_id?: number;
    clarity_grade_id?: number;
    weight_carats: number;
    dimensions?: {
      length?: number;
      width?: number;
      depth?: number;
    };
    origin_id?: number;
    rough_stone_id?: string;
    cut_grade?: string;
    treatment?: string;
    clarity_characteristics?: string[];
    is_certified: boolean;
    certification_details?: Record<string, any>;
    estimated_value?: number;
    currency: string;
    notes?: string;
    piece_count: number;
    is_public: boolean;
    is_draft: boolean;
    created_by?: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface GemstoneImage {
    id: string;
    gemstone_id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    created_at: Date;
  }
  
  export interface GemstoneDraft {
    id: string;
    user_id: string;
    data: Record<string, any>;
    created_at: Date;
    updated_at: Date;
  }
  
  // For Knex.js type safety
  declare module 'knex/types/tables' {
    interface Tables {
      users: User;
      roles: Role;
      permissions: Permission;
      user_roles: UserRole;
      role_permissions: RolePermission;
      professionals: Professional;
      professional_types: ProfessionalType;
      professional_professional_types: ProfessionalProfessionalType;
      verification_documents: VerificationDocument;
      gemstone_families: GemstoneFamily;
      cut_shapes: CutShape;
      colors: Color;
      color_grades: ColorGrade;
      clarity_grades: ClarityGrade;
      quality_standards: QualityStandard;
      mining_locations: MiningLocation;
      rough_stones: RoughStone;
      rough_stone_images: RoughStoneImage;
      gemstones: Gemstone;
      gemstone_images: GemstoneImage;
      gemstone_drafts: GemstoneDraft;
    }
  }