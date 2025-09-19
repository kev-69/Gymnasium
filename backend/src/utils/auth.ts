import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '@/types';

export class AuthUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a JWT token
   */
  static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'ug-gym-api',
      audience: 'ug-gym-app'
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'ug-gym-api',
        audience: 'ug-gym-app'
      }) as AuthTokenPayload;
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Generate a random PIN for testing purposes
   */
  static generateRandomPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (Ghana)
   */
  static isValidGhanaPhone(phone: string): boolean {
    // Ghana phone numbers: +233XXXXXXXXX or 0XXXXXXXXX
    const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate university ID format (8 digits)
   */
  static isValidUniversityId(id: string): boolean {
    const idRegex = /^\d{8}$/;
    return idRegex.test(id);
  }

  /**
   * Sanitize user input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}