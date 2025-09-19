import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { 
  validateRequest, 
  publicUserRegistrationSchema,
  universityUserRegistrationSchema,
  publicLoginSchema,
  universityLoginSchema,
  idLookupSchema
} from '@/middleware/validation';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Public user registration
router.post(
  '/register/public',
  validateRequest(publicUserRegistrationSchema),
  AuthController.registerPublic
);

// University ID lookup
router.post(
  '/lookup/university-id',
  validateRequest(idLookupSchema),
  AuthController.lookupUniversityId
);

// University member registration
router.post(
  '/register/university',
  validateRequest(universityUserRegistrationSchema),
  AuthController.registerUniversity
);

// Public user login
router.post(
  '/login/public',
  validateRequest(publicLoginSchema),
  AuthController.login
);

// University member login
router.post(
  '/login/university',
  validateRequest(universityLoginSchema),
  AuthController.login
);

// Combined login endpoint (auto-detect login type)
router.post('/login', AuthController.login);

// Get user profile (requires authentication)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Logout
router.post('/logout', AuthController.logout);

export default router;