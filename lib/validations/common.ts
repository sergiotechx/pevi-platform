import { z } from 'zod';

/**
 * Common validation schemas used across multiple entities
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

// Password validation (for when auth is implemented)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''));

// Phone number validation (basic)
export const phoneSchema = z
  .string()
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''));

// Date validation
export const dateSchema = z.coerce.date();

// Positive number validation
export const positiveNumberSchema = z
  .number()
  .positive('Must be a positive number')
  .or(z.string().transform((val) => parseFloat(val)));

// ID validation (positive integer)
export const idSchema = z
  .number()
  .int('ID must be an integer')
  .positive('ID must be positive');

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// Search/filter schema
export const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
