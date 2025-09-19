export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  userType: 'public';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UniversityUser {
  id: string;
  universityId: string; // 8-digit ID
  firstName: string;
  lastName: string;
  email: string;
  hallOfResidence?: string;
  userType: 'student' | 'staff';
  pinHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UniversityDatabase {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hallOfResidence?: string;
  userType: 'student' | 'staff';
  pinHash?: string;
  issueDate: Date;
  expiryDate?: Date; // NULL for staff
  academicYear?: string;
  program?: string;
  level?: string;
  faculty?: string;
  department?: string;
  status: 'active' | 'graduated' | 'suspended' | 'inactive';
  isActive: boolean;
}

export interface AuthTokenPayload {
  userId: string;
  userType: 'public' | 'student' | 'staff';
  email: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  universityId?: string;
  pin?: string;
}

export interface RegisterPublicUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUniversityUserRequest {
  universityId: string;
  pin: string;
}

export interface IdLookupRequest {
  universityId: string;
}

export interface IdLookupResponse {
  found: boolean;
  isExpired?: boolean;
  data?: {
    firstName: string;
    lastName: string;
    email: string;
    hallOfResidence?: string;
    userType: 'student' | 'staff';
    issueDate: string;
    expiryDate?: string;
    academicYear?: string;
    program?: string;
    level?: string;
    faculty?: string;
    department?: string;
    status: string;
  };
  message?: string;
}