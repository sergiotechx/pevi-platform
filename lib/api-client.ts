/**
 * API Client - High-level wrapper for PEVI Platform API
 *
 * This module provides typed functions for interacting with the REST API.
 * It uses Axios for HTTP requests and is designed to be used with SWR for data fetching.
 *
 * Usage with SWR:
 * ```tsx
 * import useSWR from 'swr';
 * import { api } from '@/lib/api-client';
 *
 * function MyComponent() {
 *   const { data, error, isLoading } = useSWR('/organizations', () => api.organizations.getAll());
 *   // ...
 * }
 * ```
 *
 * Usage without SWR (for mutations):
 * ```tsx
 * import { api } from '@/lib/api-client';
 *
 * async function createOrg(data) {
 *   try {
 *     const result = await api.organizations.create(data);
 *     console.log('Created:', result);
 *   } catch (error) {
 *     console.error('Error:', error);
 *   }
 * }
 * ```
 */

import { apiClient } from './axios-client';

// Types for API responses
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface IncludeParams {
  include?: 'basic' | 'full';
}

export type ListParams = PaginationParams & IncludeParams;

// Auth types
export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface SignupResponse {
  user_id: number;
  fullName: string;
  email: string;
  role: string;
  status: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  walletAddress?: string;
}

/**
 * Generic CRUD operations for a resource
 */
class ResourceClient<T> {
  constructor(private endpoint: string) {}

  /**
   * Get all resources with optional pagination and includes
   */
  async getAll(params?: ListParams): Promise<T[]> {
    const { data } = await apiClient.get(this.endpoint, { params });
    return data;
  }

  /**
   * Get a single resource by ID
   */
  async getById(id: number, params?: IncludeParams): Promise<T> {
    const { data } = await apiClient.get(`${this.endpoint}/${id}`, { params });
    return data;
  }

  /**
   * Create a new resource
   */
  async create(payload: Partial<T>): Promise<T> {
    const { data } = await apiClient.post(this.endpoint, payload);
    return data;
  }

  /**
   * Update a resource by ID
   */
  async update(id: number, payload: Partial<T>): Promise<T> {
    const { data } = await apiClient.put(`${this.endpoint}/${id}`, payload);
    return data;
  }

  /**
   * Delete a resource by ID
   */
  async delete(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${this.endpoint}/${id}`);
    return data;
  }
}

/**
 * API client with all resource endpoints
 *
 * Each resource has the following methods:
 * - getAll(params?) - Get all resources
 * - getById(id, params?) - Get a single resource
 * - create(data) - Create a new resource
 * - update(id, data) - Update a resource
 * - delete(id) - Delete a resource
 */
export const api = {
  organizations: new ResourceClient('/organizations'),
  users: new ResourceClient('/users'),
  campaigns: new ResourceClient('/campaigns'),
  milestones: new ResourceClient('/milestones'),
  organizationStaff: new ResourceClient('/organization-staff'),
  campaignBeneficiaries: new ResourceClient('/campaign-beneficiaries'),
  activities: new ResourceClient('/activities'),
  awards: new ResourceClient('/awards'),
  campaignStaff: new ResourceClient('/campaign-staff'),

  auth: {
    async signup(payload: SignupPayload): Promise<SignupResponse> {
      const { data } = await apiClient.post('/auth/signup', payload);
      return data;
    },
    async login(payload: LoginPayload): Promise<LoginResponse> {
      const { data } = await apiClient.post('/auth/login', payload);
      return data;
    },
  },
};

/**
 * Type-safe API client (when Prisma types are imported)
 *
 * TODO: Import Prisma types and create typed versions:
 * import type { Organization, User, Campaign, ... } from '@prisma/client';
 *
 * export const typedApi = {
 *   organizations: new ResourceClient<Organization>('/organizations'),
 *   users: new ResourceClient<User>('/users'),
 *   ...
 * };
 */
