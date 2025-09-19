import { gymDb, universityDb } from '@/config/database';
import { PublicUser, UniversityUser, UniversityDatabase } from '@/types';

export class PublicUserModel {
  static async create(userData: Omit<PublicUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<PublicUser> {
    const query = `
      INSERT INTO public_users (first_name, last_name, email, phone, password_hash, user_type, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.phone,
      userData.passwordHash,
      userData.userType,
      userData.isActive
    ];

    const result = await gymDb.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  static async findByEmail(email: string): Promise<PublicUser | null> {
    const query = 'SELECT * FROM public_users WHERE email = $1 AND is_active = true';
    const result = await gymDb.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  static async findById(id: string): Promise<PublicUser | null> {
    const query = 'SELECT * FROM public_users WHERE id = $1 AND is_active = true';
    const result = await gymDb.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  static async updateById(id: string, updates: Partial<PublicUser>): Promise<PublicUser | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${this.camelToSnake(key)} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE public_users 
      SET ${setClause}
      WHERE id = $1 AND is_active = true
      RETURNING *
    `;
    
    const values = [id, ...Object.values(updates)];
    const result = await gymDb.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  private static mapRowToUser(row: any): PublicUser {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      userType: row.user_type,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export class UniversityUserModel {
  static async create(userData: Omit<UniversityUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<UniversityUser> {
    const query = `
      INSERT INTO university_users (university_id, first_name, last_name, email, hall_of_residence, user_type, pin_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      userData.universityId,
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.hallOfResidence,
      userData.userType,
      userData.pinHash,
      userData.isActive
    ];

    const result = await gymDb.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  static async findByUniversityId(universityId: string): Promise<UniversityUser | null> {
    const query = 'SELECT * FROM university_users WHERE university_id = $1 AND is_active = true';
    const result = await gymDb.query(query, [universityId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  static async findByEmail(email: string): Promise<UniversityUser | null> {
    const query = 'SELECT * FROM university_users WHERE email = $1 AND is_active = true';
    const result = await gymDb.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  static async findById(id: string): Promise<UniversityUser | null> {
    const query = 'SELECT * FROM university_users WHERE id = $1 AND is_active = true';
    const result = await gymDb.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }

  private static mapRowToUser(row: any): UniversityUser {
    return {
      id: row.id,
      universityId: row.university_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      hallOfResidence: row.hall_of_residence,
      userType: row.user_type,
      pinHash: row.pin_hash,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export class UniversityDatabaseModel {
  static async findByUniversityId(universityId: string): Promise<UniversityDatabase | null> {
    const query = `
      SELECT id, first_name, last_name, email, hall_of_residence, member_type, 
             pin_hash, issue_date, expiry_date, academic_year, program, level, 
             faculty, department, status, is_active, created_at, updated_at
      FROM university_members 
      WHERE id = $1 AND is_active = true
    `;
    const result = await universityDb.query(query, [universityId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      hallOfResidence: row.hall_of_residence,
      userType: row.member_type,
      pinHash: row.pin_hash,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date,
      academicYear: row.academic_year,
      program: row.program,
      level: row.level,
      faculty: row.faculty,
      department: row.department,
      status: row.status,
      isActive: row.is_active
    };
  }

  static async isStudentExpired(universityId: string): Promise<boolean> {
    const member = await this.findByUniversityId(universityId);
    
    if (!member) {
      return false;
    }

    // Staff members don't expire
    if (member.userType === 'staff') {
      return false;
    }

    // Only students can expire
    if (member.userType === 'student') {
      // Check if student has expired or graduated
      if (member.status === 'graduated' || member.status === 'inactive' || member.status === 'suspended') {
        return true;
      }

      // Check expiry date
      if (member.expiryDate && new Date(member.expiryDate) < new Date()) {
        return true;
      }
    }

    return false;
  }
}