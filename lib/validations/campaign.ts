import { z } from 'zod';
import { urlSchema, dateSchema, positiveNumberSchema } from './common';

/**
 * Campaign validation schemas
 */

// Base campaign schema
export const campaignSchema = z.object({
  org_id: z.number().int().positive('Organization is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Health', 'Education', 'Environment', 'Poverty', 'Animals', 'Community', 'Emergency'], {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  funding_goal: positiveNumberSchema,
  current_funding: positiveNumberSchema.default(0),
  currency: z.string().length(3, 'Currency must be 3-letter code (e.g., USD)').default('USD'),
  start_date: dateSchema,
  end_date: dateSchema,
  image_url: urlSchema,
  status: z.enum(['Draft', 'Active', 'Completed', 'Cancelled']).default('Draft'),
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// Schema for creating a campaign
export const createCampaignSchema = campaignSchema.omit({
  current_funding: true,
  status: true
});

// Schema for updating a campaign
export const updateCampaignSchema = campaignSchema.partial();

// Schema for milestone
export const milestoneSchema = z.object({
  campaign_id: z.number().int().positive('Campaign is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  target_amount: positiveNumberSchema.optional(),
  target_date: dateSchema.optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']).default('Pending'),
});

// Schema for creating a milestone
export const createMilestoneSchema = milestoneSchema.omit({ status: true });

// Schema for updating a milestone
export const updateMilestoneSchema = milestoneSchema.partial();

// Type exports for TypeScript
export type CampaignFormData = z.infer<typeof campaignSchema>;
export type CreateCampaignData = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignData = z.infer<typeof updateCampaignSchema>;
export type MilestoneFormData = z.infer<typeof milestoneSchema>;
export type CreateMilestoneData = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneData = z.infer<typeof updateMilestoneSchema>;
