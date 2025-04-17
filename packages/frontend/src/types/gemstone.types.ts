export interface GemstoneType {
    id: string;
    unique_id: string;
    owner_id?: string;
    gemstone_family_id?: number;
    gemstone_family_name?: string;
    gemstone_category?: string;
    cut_shape_id?: number;
    cut_shape_name?: string;
    cut_shape_category?: string;
    color_id?: number;
    color_name?: string;
    color_display_name?: string;
    color_hex_code?: string;
    color_grade_id?: number;
    color_grade?: string;
    clarity_grade_id?: number;
    clarity_grade?: string;
    weight_carats: number;
    dimensions?: {
      length?: number;
      width?: number;
      depth?: number;
    };
    origin_id?: number;
    origin_name?: string;
    origin_country?: string;
    rough_stone_id?: string;
    rough_stone_unique_id?: string;
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
    created_at: string;
    updated_at: string;
    images?: GemstoneImageType[];
    primary_image?: GemstoneImageType;
    owner_name?: string;
  }
  
  export interface GemstoneImageType {
    id: string;
    gemstone_id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    created_at: string;
  }
  
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
    created_at: string;
    updated_at: string;
  }
  
  export interface CutShape {
    id: number;
    name: string;
    category: string;
    description?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Color {
    id: number;
    name: string;
    display_name: string;
    hex_code: string;
    category?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ColorGrade {
    id: number;
    grade: string;
    description?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ClarityGrade {
    id: number;
    grade: string;
    description?: string;
    category: string;
    created_at: string;
    updated_at: string;
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
    created_at: string;
    updated_at: string;
  }
  
  export interface GemstoneCertificate {
    id: string;
    gemstone_id: string;
    certificate_number: string;
    issuer: string;
    issue_date: string;
    expiry_date?: string;
    certificate_url?: string;
    blockchain_record_id?: string;
    is_verified: boolean;
    verification_date?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface GemstoneTransfer {
    id: string;
    gemstone_id: string;
    from_user_id: string;
    to_user_id: string;
    transaction_date: string;
    notes?: string;
    blockchain_record_id?: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface GemstoneFilterParams {
    gemstone_family_id?: number;
    cut_shape_id?: number;
    color_id?: number;
    min_weight?: number;
    max_weight?: number;
    origin_id?: number;
    is_certified?: boolean;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    search_term?: string;
  }