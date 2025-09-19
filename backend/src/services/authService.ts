import { PublicUserModel, UniversityUserModel, UniversityDatabaseModel } from '@/models/User';
import { AuthUtils } from '@/utils/auth';
import {
  PublicUser,
  UniversityUser,
  UniversityDatabase,
  RegisterPublicUserRequest,
  RegisterUniversityUserRequest,
  LoginRequest,
  IdLookupRequest,
  IdLookupResponse,
  AuthTokenPayload
} from '@/types';

export class AuthService {
  /**
   * Register a new public user
   */
  static async registerPublicUser(userData: RegisterPublicUserRequest): Promise<{ user: Omit<PublicUser, 'passwordHash'>, token: string }> {
    // Check if user already exists
    const existingUser = await PublicUserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate input
    if (!AuthUtils.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    if (!AuthUtils.isValidGhanaPhone(userData.phone)) {
      throw new Error('Invalid phone number format');
    }

    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(userData.password);

    // Create user
    const user = await PublicUserModel.create({
      firstName: AuthUtils.sanitizeString(userData.firstName),
      lastName: AuthUtils.sanitizeString(userData.lastName),
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      passwordHash,
      userType: 'public',
      isActive: true
    });

    // Generate token
    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      userType: user.userType,
      email: user.email
    };
    const token = AuthUtils.generateToken(tokenPayload);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Look up university member by ID
   */
  static async lookupUniversityId(request: IdLookupRequest): Promise<IdLookupResponse> {
    if (!AuthUtils.isValidUniversityId(request.universityId)) {
      throw new Error('Invalid university ID format');
    }

    const universityMember = await UniversityDatabaseModel.findByUniversityId(request.universityId);
    
    if (!universityMember) {
      return { 
        found: false,
        message: 'University ID not found'
      };
    }

    // Check if student is expired
    const isExpired = await UniversityDatabaseModel.isStudentExpired(request.universityId);
    
    if (isExpired) {
      return {
        found: true,
        isExpired: true,
        message: 'Student ID has expired or status is inactive. Please contact the university registrar.',
        data: {
          firstName: universityMember.firstName,
          lastName: universityMember.lastName,
          email: universityMember.email,
          hallOfResidence: universityMember.hallOfResidence,
          userType: universityMember.userType,
          issueDate: universityMember.issueDate.toISOString().split('T')[0],
          expiryDate: universityMember.expiryDate?.toISOString().split('T')[0],
          academicYear: universityMember.academicYear,
          program: universityMember.program,
          level: universityMember.level,
          faculty: universityMember.faculty,
          department: universityMember.department,
          status: universityMember.status
        }
      };
    }

    return {
      found: true,
      isExpired: false,
      data: {
        firstName: universityMember.firstName,
        lastName: universityMember.lastName,
        email: universityMember.email,
        hallOfResidence: universityMember.hallOfResidence,
        userType: universityMember.userType,
        issueDate: universityMember.issueDate.toISOString().split('T')[0],
        expiryDate: universityMember.expiryDate?.toISOString().split('T')[0],
        academicYear: universityMember.academicYear,
        program: universityMember.program,
        level: universityMember.level,
        faculty: universityMember.faculty,
        department: universityMember.department,
        status: universityMember.status
      }
    };
  }

  /**
   * Register a university member
   */
  static async registerUniversityUser(userData: RegisterUniversityUserRequest): Promise<{ user: Omit<UniversityUser, 'pinHash'>, token: string }> {
    if (!AuthUtils.isValidUniversityId(userData.universityId)) {
      throw new Error('Invalid university ID format');
    }

    if (userData.pin.length < 4) {
      throw new Error('PIN must be at least 4 characters long');
    }

    // Check if user already exists
    const existingUser = await UniversityUserModel.findByUniversityId(userData.universityId);
    if (existingUser) {
      throw new Error('User already registered with this university ID');
    }

    // Look up university member details
    const universityMember = await UniversityDatabaseModel.findByUniversityId(userData.universityId);
    if (!universityMember) {
      throw new Error('University ID not found in university database');
    }

    // Check if student is expired
    const isExpired = await UniversityDatabaseModel.isStudentExpired(userData.universityId);
    if (isExpired) {
      throw new Error('Cannot register with expired or inactive student ID. Please contact the university registrar.');
    }

    // Hash PIN
    const pinHash = await AuthUtils.hashPassword(userData.pin);

    // Create user
    const user = await UniversityUserModel.create({
      universityId: userData.universityId,
      firstName: universityMember.firstName,
      lastName: universityMember.lastName,
      email: universityMember.email,
      hallOfResidence: universityMember.hallOfResidence,
      userType: universityMember.userType,
      pinHash,
      isActive: true
    });

    // Generate token
    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      userType: user.userType,
      email: user.email
    };
    const token = AuthUtils.generateToken(tokenPayload);

    // Return user without PIN hash
    const { pinHash: _, ...userWithoutPin } = user;
    return { user: userWithoutPin, token };
  }

  /**
   * Login user (public or university member)
   */
  static async login(credentials: LoginRequest): Promise<{ user: any, token: string }> {
    // Public user login
    if (credentials.email && credentials.password) {
      const user = await PublicUserModel.findByEmail(credentials.email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await AuthUtils.comparePassword(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const tokenPayload: AuthTokenPayload = {
        userId: user.id,
        userType: user.userType,
        email: user.email
      };
      const token = AuthUtils.generateToken(tokenPayload);

      const { passwordHash: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    }

    // University member login
    if (credentials.universityId && credentials.pin) {
      if (!AuthUtils.isValidUniversityId(credentials.universityId)) {
        throw new Error('Invalid university ID format');
      }

      const user = await UniversityUserModel.findByUniversityId(credentials.universityId);
      if (!user) {
        throw new Error('Invalid university ID or PIN');
      }

      const isPinValid = await AuthUtils.comparePassword(credentials.pin, user.pinHash);
      if (!isPinValid) {
        throw new Error('Invalid university ID or PIN');
      }

      const tokenPayload: AuthTokenPayload = {
        userId: user.id,
        userType: user.userType,
        email: user.email
      };
      const token = AuthUtils.generateToken(tokenPayload);

      const { pinHash: _, ...userWithoutPin } = user;
      return { user: userWithoutPin, token };
    }

    throw new Error('Invalid login credentials provided');
  }

  /**
   * Verify authentication token and get user
   */
  static async verifyToken(token: string): Promise<PublicUser | UniversityUser> {
    const payload = AuthUtils.verifyToken(token);
    
    if (payload.userType === 'public') {
      const user = await PublicUserModel.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } else {
      const user = await UniversityUserModel.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }
  }
}