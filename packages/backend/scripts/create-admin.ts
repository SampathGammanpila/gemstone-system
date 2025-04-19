import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from '../src/db';
import { hashPassword } from '../src/utils/encryption';

// Load admin env variables
dotenv.config({ path: path.resolve(__dirname, '../.env.admin') });

// Validate required variables
const requiredVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_FIRST_NAME', 'ADMIN_LAST_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

async function createSecureAdminUser() {
  try {
    // Test database connection
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connection established');
    
    // Get columns for users table
    const userColumns = await db.raw(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    
    console.log('Available columns in users table:', userColumns.rows.map((r: any) => r.column_name));
    
    // Get columns for roles table
    const rolesColumns = await db.raw(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'roles' AND table_schema = 'public'
    `);
    
    console.log('Available columns in roles table:', rolesColumns.rows.map((r: any) => r.column_name));
    
    // Get columns for user_roles table
    const userRolesColumns = await db.raw(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'user_roles' AND table_schema = 'public'
    `);
    
    console.log('Available columns in user_roles table:', userRolesColumns.rows.map((r: any) => r.column_name));
    
    // Start a transaction
    const trx = await db.transaction();
    
    try {
      const email = process.env.ADMIN_EMAIL || '';
      const password = process.env.ADMIN_PASSWORD || '';
      const firstName = process.env.ADMIN_FIRST_NAME || '';
      const lastName = process.env.ADMIN_LAST_NAME || '';
      
      // Check if admin already exists
      const existingUsers = await trx('users').where({ email }).select('id');
      
      if (existingUsers.length > 0) {
        console.log('Admin user already exists');
        await trx.rollback();
        return;
      }
      
      // Generate password hash
      const hashedPassword = await hashPassword(password);
      
      // Construct user object based on available columns
      const userObj: Record<string, any> = {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName
      };
      
      // Add timestamp fields if they exist
      if (userColumns.rows.find((r: any) => r.column_name === 'created_at')) {
        userObj.created_at = new Date();
      }
      
      if (userColumns.rows.find((r: any) => r.column_name === 'updated_at')) {
        userObj.updated_at = new Date();
      }
      
      // Insert user
      console.log('Inserting user...');
      const userInsertResult = await trx('users').insert(userObj).returning('id');
      console.log('User insert result:', userInsertResult);
      
      // Extract userId - handle both object and primitive return types
      let userId;
      if (typeof userInsertResult[0] === 'object' && userInsertResult[0] !== null) {
        userId = userInsertResult[0].id;
      } else {
        userId = userInsertResult[0];
      }
      
      console.log('User ID:', userId);
      
      // Check if roles table exists
      const roleTableExists = await trx.schema.hasTable('roles');
      
      if (roleTableExists) {
        // Find admin role
        const adminRoles = await trx('roles').where({ name: 'admin' }).select('id');
        let roleId;
        
        if (adminRoles.length === 0) {
          // Create admin role with correct columns
          const roleObj: Record<string, any> = {
            name: 'admin',
            description: 'System administrator'
          };
          
          console.log('Inserting role...');
          const roleInsertResult = await trx('roles').insert(roleObj).returning('id');
          console.log('Role insert result:', roleInsertResult);
          
          // Extract roleId - handle both object and primitive return types
          if (typeof roleInsertResult[0] === 'object' && roleInsertResult[0] !== null) {
            roleId = roleInsertResult[0].id;
          } else {
            roleId = roleInsertResult[0];
          }
        } else {
          // Extract roleId - handle both object and primitive return types
          if (typeof adminRoles[0] === 'object' && adminRoles[0] !== null) {
            roleId = adminRoles[0].id;
          } else {
            roleId = adminRoles[0];
          }
        }
        
        console.log('Role ID:', roleId);
        
        // Check if user_roles table exists
        const userRolesTableExists = await trx.schema.hasTable('user_roles');
        
        if (userRolesTableExists) {
          console.log('Inserting user_role relationship with:', { user_id: userId, role_id: roleId });
          
          // Assign role to user
          await trx('user_roles').insert({
            user_id: userId,
            role_id: roleId
          });
        }
      }
      
      await trx.commit();
      
      console.log('Admin user created successfully:', {
        id: userId,
        email
      });
    } catch (error) {
      await trx.rollback();
      console.error('Error creating admin user:', error);
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    // Close connection
    await db.destroy();
    
    // Clean up env file
    try {
      if (process.argv.includes('--delete-env')) {
        fs.unlinkSync(path.resolve(__dirname, '../.env.admin'));
        console.log('.env.admin file has been deleted for security');
      } else {
        console.warn('Remember to delete the .env.admin file for security reasons');
      }
    } catch (error) {
      console.error('Could not delete .env.admin file:', error);
    }
  }
}

createSecureAdminUser();