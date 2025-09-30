import { Pool, PoolClient, QueryResult } from 'pg';
import { db } from '../config/database';
import { AdminUser } from '../types';

export class AdminUserModel {
  static async findByEmail(email: string): Promise<AdminUser | null> {
    const query = `
      SELECT 
        id,
        email,
        password_hash as "passwordHash",
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM admin_users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result: QueryResult = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToAdminUser(result.rows[0]);
  }

  static async findById(id: string): Promise<AdminUser | null> {
    const query = `
      SELECT 
        id,
        email,
        password_hash as "passwordHash",
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM admin_users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result: QueryResult = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToAdminUser(result.rows[0]);
  }

  static async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE admin_users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    
    await db.query(query, [id]);
  }

  static async findAll(): Promise<AdminUser[]> {
    const query = `
      SELECT 
        id,
        email,
        password_hash as "passwordHash",
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM admin_users 
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    
    const result: QueryResult = await db.query(query);
    return result.rows.map(row => this.mapRowToAdminUser(row));
  }

  static async create(adminData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'super_admin';
  }): Promise<AdminUser> {
    const query = `
      INSERT INTO admin_users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        email,
        password_hash as "passwordHash",
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    
    const result: QueryResult = await db.query(query, [
      adminData.email,
      adminData.passwordHash,
      adminData.firstName,
      adminData.lastName,
      adminData.role
    ]);
    
    return this.mapRowToAdminUser(result.rows[0]);
  }

  static async updateProfile(id: string, updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<AdminUser | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.firstName) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(updates.firstName);
      paramCount++;
    }

    if (updates.lastName) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(updates.lastName);
      paramCount++;
    }

    if (updates.email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(updates.email);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE admin_users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING 
        id,
        email,
        password_hash as "passwordHash",
        first_name as "firstName",
        last_name as "lastName",
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result: QueryResult = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToAdminUser(result.rows[0]);
  }

  static async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const query = `
      UPDATE admin_users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    const result: QueryResult = await db.query(query, [passwordHash, id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async deactivate(id: string): Promise<boolean> {
    const query = `
      UPDATE admin_users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    const result: QueryResult = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  private static mapRowToAdminUser(row: any): AdminUser {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      isActive: row.isActive,
      lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}