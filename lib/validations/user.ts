import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema, dateSchema } from './common';

/**
 * User validation schemas
 */

// Base user schema
export const userSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(1, 'Full name is required').max(255),
  phone: phoneSchema,
  country: z.number().int().positive('Country code is required'),
  city: z.string().max(100).optional(),
  birth_date: dateSchema.optional(),
  profile_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

// Schema for user registration (with password)
export const registerUserSchema = userSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Schema for user login
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Schema for updating user profile
export const updateUserSchema = userSchema.partial().extend({
  email: emailSchema.optional(), // Email can be changed but must be valid
});

// Schema for changing password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

// Type exports for TypeScript
export type UserFormData = z.infer<typeof userSchema>;
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type LoginUserData = z.infer<typeof loginUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
