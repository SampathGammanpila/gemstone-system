/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.raw(`
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
        verification_status VARCHAR(50) DEFAULT 'pending',
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
    `);
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.raw(`
      DROP TABLE IF EXISTS verification_documents;
      DROP TABLE IF EXISTS professional_professional_types;
      DROP TABLE IF EXISTS professional_types;
      DROP TABLE IF EXISTS professionals;
      DROP TABLE IF EXISTS role_permissions;
      DROP TABLE IF EXISTS permissions;
      DROP TABLE IF EXISTS user_roles;
      DROP TABLE IF EXISTS roles;
      DROP TABLE IF EXISTS users;
    `);
  };