import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    next();
  };
};

// Validation schemas
export const publicUserRegistrationSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 100 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 100 characters',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^(\+233|0)[2-9]\d{8}$/).required().messages({
    'string.pattern.base': 'Please provide a valid Ghana phone number',
    'any.required': 'Phone number is required'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  })
});

export const universityUserRegistrationSchema = Joi.object({
  universityId: Joi.string().pattern(/^\d{8}$/).required().messages({
    'string.pattern.base': 'University ID must be exactly 8 digits',
    'any.required': 'University ID is required'
  }),
  pin: Joi.string().min(4).max(8).required().messages({
    'string.min': 'PIN must be at least 4 characters long',
    'string.max': 'PIN must not exceed 8 characters',
    'any.required': 'PIN is required'
  })
});

export const publicLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const universityLoginSchema = Joi.object({
  universityId: Joi.string().pattern(/^\d{8}$/).required(),
  pin: Joi.string().required()
});

export const idLookupSchema = Joi.object({
  universityId: Joi.string().pattern(/^\d{8}$/).required().messages({
    'string.pattern.base': 'University ID must be exactly 8 digits',
    'any.required': 'University ID is required'
  })
});