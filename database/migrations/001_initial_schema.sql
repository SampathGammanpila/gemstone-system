-- Initial schema migration for Enhanced Gemstone System
-- This script creates core tables for users, roles, and basic product types

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- USERS AND AUTHENTICATION --------------------------------------------------

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url VARCHAR(500),
  phone VARCHAR(50),
  address TEXT,
  is_email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table (customer, dealer, cutter, appraiser, admin)
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- User roles junction table (many-to-many)
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Permissions table
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- Role permissions junction table (many-to-many)
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- PROFESSIONAL PROFILES ----------------------------------------------------

-- Professional profiles for dealers, cutters, and appraisers
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  business_description TEXT,
  years_of_experience INTEGER,
  specializations TEXT[],
  website VARCHAR(255),
  social_media JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional types (dealer, cutter, appraiser)
CREATE TABLE professional_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- Professional to professional_types junction (many-to-many)
CREATE TABLE professional_professional_types (
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  professional_type_id INTEGER REFERENCES professional_types(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, professional_type_id)
);

-- Verification documents
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_url VARCHAR(500) NOT NULL,
  verification_notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REFERENCE DATA ---------------------------------------------------------

-- Gemstone families
CREATE TABLE gemstone_families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL, -- Silicate, Oxide, etc.
  description TEXT,
  hardness_min DECIMAL(4,2),
  hardness_max DECIMAL(4,2),
  chemical_formula VARCHAR(100),
  crystal_system VARCHAR(100),
  refractive_index_min DECIMAL(5,3),
  refractive_index_max DECIMAL(5,3),
  specific_gravity_min DECIMAL(4,2),
  specific_gravity_max DECIMAL(4,2),
  cleavage VARCHAR(100),
  luster VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cut shapes
CREATE TABLE cut_shapes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL, -- Faceted, Cabochon, Fantasy, etc.
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colors
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NOT NULL,
  category VARCHAR(50), -- Red, Blue, Green, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Color grades
CREATE TABLE color_grades (
  id SERIAL PRIMARY KEY,
  grade VARCHAR(10) NOT NULL, -- AAA, AA, A, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(grade)
);

-- Clarity grades
CREATE TABLE clarity_grades (
  id SERIAL PRIMARY KEY,
  grade VARCHAR(50) NOT NULL, -- VVS1, SI2, etc. for diamonds or Loupe Clean, Eye Clean, Slightly Included, etc. for colored stones
  description TEXT,
  category VARCHAR(50), -- Diamond, Colored Stone
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(grade, category)
);

-- Quality standards
CREATE TABLE quality_standards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  applies_to VARCHAR(50), -- Diamond, Colored Stone, All
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mining locations
CREATE TABLE mining_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  locality VARCHAR(100),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, country, region, locality)
);

-- GEMSTONE TABLES -------------------------------------------------------

-- Rough stones
CREATE TABLE rough_stones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id VARCHAR(50) UNIQUE NOT NULL, -- System-generated unique identifier
  owner_id UUID REFERENCES users(id),
  gemstone_family_id INTEGER REFERENCES gemstone_families(id),
  color_id INTEGER REFERENCES colors(id),
  weight_carats DECIMAL(10,2),
  dimensions JSONB, -- {length, width, height} in mm
  origin_id INTEGER REFERENCES mining_locations(id),
  mining_method VARCHAR(100),
  quality_grade VARCHAR(50),
  potential_yield DECIMAL(5,2), -- Estimated percentage yield after cutting
  estimated_value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rough stone images
CREATE TABLE rough_stone_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rough_stone_id UUID REFERENCES rough_stones(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cut gemstones
CREATE TABLE gemstones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id VARCHAR(50) UNIQUE NOT NULL, -- System-generated unique identifier
  owner_id UUID REFERENCES users(id),
  gemstone_family_id INTEGER REFERENCES gemstone_families(id),
  cut_shape_id INTEGER REFERENCES cut_shapes(id),
  color_id INTEGER REFERENCES colors(id),
  color_grade_id INTEGER REFERENCES color_grades(id),
  clarity_grade_id INTEGER REFERENCES clarity_grades(id),
  weight_carats DECIMAL(10,3) NOT NULL,
  dimensions JSONB, -- {length, width, depth} in mm
  origin_id INTEGER REFERENCES mining_locations(id),
  rough_stone_id UUID REFERENCES rough_stones(id), -- If cut from a rough stone in the system
  cut_grade VARCHAR(50), -- Excellent, Very Good, Good, Fair, Poor
  treatment VARCHAR(255),
  clarity_characteristics TEXT[], -- Inclusions, blemishes, etc.
  is_certified BOOLEAN DEFAULT FALSE,
  certification_details JSONB,
  estimated_value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  piece_count INTEGER DEFAULT 1, -- For matching sets
  is_public BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gemstone images
CREATE TABLE gemstone_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gemstone_id UUID REFERENCES gemstones(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gemstone drafts (for saving incomplete gemstone entries)
CREATE TABLE gemstone_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- All gemstone fields in JSON format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INITIAL DATA INSERTS --------------------------------------------------

-- Insert roles
INSERT INTO roles (name, description) VALUES
  ('customer', 'Regular user who can buy gemstones and jewelry'),
  ('dealer', 'Professional who can sell gemstones and jewelry'),
  ('cutter', 'Professional who can cut rough stones into gemstones'),
  ('appraiser', 'Professional who can appraise and certify gemstones'),
  ('admin', 'System administrator');

-- Insert professional types
INSERT INTO professional_types (name, description) VALUES
  ('dealer', 'Buys and sells gemstones and jewelry'),
  ('cutter', 'Specializes in cutting and polishing rough stones'),
  ('appraiser', 'Evaluates and certifies gemstones');

-- Insert permissions
INSERT INTO permissions (name, description) VALUES
  ('user:read', 'View user information'),
  ('user:write', 'Edit user information'),
  ('gemstone:read', 'View gemstone information'),
  ('gemstone:write', 'Edit gemstone information'),
  ('gemstone:delete', 'Delete gemstone entries'),
  ('rough-stone:read', 'View rough stone information'),
  ('rough-stone:write', 'Edit rough stone information'),
  ('rough-stone:delete', 'Delete rough stone entries'),
  ('professional:verify', 'Verify professional accounts'),
  ('admin:access', 'Access admin functionality');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
  (1, 1), -- customer can view user info
  (1, 3), -- customer can view gemstone info
  (1, 5), -- customer can view rough stone info
  (2, 1), -- dealer can view user info
  (2, 3), -- dealer can view gemstone info
  (2, 4), -- dealer can edit gemstone info
  (2, 5), -- dealer can view rough stone info
  (2, 6), -- dealer can edit rough stone info
  (3, 1), -- cutter can view user info
  (3, 3), -- cutter can view gemstone info
  (3, 4), -- cutter can edit gemstone info
  (3, 5), -- cutter can view rough stone info
  (3, 6), -- cutter can edit rough stone info
  (4, 1), -- appraiser can view user info
  (4, 3), -- appraiser can view gemstone info
  (4, 4), -- appraiser can edit gemstone info
  (4, 5), -- appraiser can view rough stone info
  (5, 1), -- admin can view user info
  (5, 2), -- admin can edit user info
  (5, 3), -- admin can view gemstone info
  (5, 4), -- admin can edit gemstone info
  (5, 5), -- admin can view rough stone info
  (5, 6), -- admin can edit rough stone info
  (5, 7), -- admin can delete rough stone entries
  (5, 8), -- admin can delete gemstone entries
  (5, 9), -- admin can verify professional accounts
  (5, 10); -- admin can access admin functionality

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_gemstones_owner_id ON gemstones(owner_id);
CREATE INDEX idx_gemstones_family_id ON gemstones(gemstone_family_id);
CREATE INDEX idx_gemstones_public ON gemstones(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_rough_stones_owner_id ON rough_stones(owner_id);
CREATE INDEX idx_rough_stones_family_id ON rough_stones(gemstone_family_id);
CREATE INDEX idx_rough_stones_public ON rough_stones(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_verified ON professionals(is_verified) WHERE is_verified = TRUE;

-- Create admin user (password is 'admin123' - change in production)
INSERT INTO users (email, password, first_name, last_name, is_email_verified, is_active)
VALUES ('admin@example.com', '$2b$10$NzB4IH0fs2NcTsIHl0qO/eYMzj.nt1QBbsKdvwz3KVQRcF0F2ETDq', 'Admin', 'User', TRUE, TRUE);

-- Get the ID of the admin user
DO $$
DECLARE
  admin_id UUID;
  admin_role_id INTEGER;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Assign admin role to admin user
  INSERT INTO user_roles (user_id, role_id) VALUES (admin_id, admin_role_id);
END $$;