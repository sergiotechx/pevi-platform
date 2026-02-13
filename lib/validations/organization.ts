import { z } from 'zod';
import { emailSchema, urlSchema, phoneSchema } from './common';

/**
 * Organization validation schemas
 */

// Base organization schema
export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  type: z.enum(['NGO', 'Foundation', 'Corporation', 'Government'], {
    errorMap: () => ({ message: 'Invalid organization type' }),
  }),
  country: z.number().int().positive('Country code is required'),
  description: z.string().optional(),
  website: urlSchema,
  contact_email: emailSchema.optional().or(z.literal('')),
  contact_phone: phoneSchema,
  address: z.string().max(500).optional(),
  logo_url: urlSchema,
});

// Schema for creating a new organization
export const createOrganizationSchema = organizationSchema;

// Schema for updating an organization (all fields optional)
export const updateOrganizationSchema = organizationSchema.partial();

// Schema for organization with staff
export const organizationWithStaffSchema = organizationSchema.extend({
  staff: z.array(z.object({
    user_id: z.number().int().positive(),
    role: z.string().min(1),
    joined_at: z.coerce.date(),
  })).optional(),
});

// Type exports for TypeScript
export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationData = z.infer<typeof updateOrganizationSchema>;
