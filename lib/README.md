# PEVI Platform - Frontend Library Setup

This directory contains all the frontend utilities and configurations for consuming the REST APIs.

## 📦 Installed Libraries

- **SWR** `^2.4.0` - Data fetching and caching
- **React Hook Form** `^7.54.1` - Form management
- **Zod** `^3.24.1` - Schema validation
- **Axios** `^1.13.5` - HTTP client
- **date-fns** `4.1.0` - Date utilities
- **Zustand** `^5.0.11` - Global state management
- **@hookform/resolvers** `^3.9.1` - Integration between React Hook Form and Zod

## 📁 File Structure

```
lib/
├── axios-client.ts          # Configured Axios instance
├── swr-config.ts            # SWR configuration and fetcher
├── store.ts                 # Zustand stores (auth, UI, settings)
├── api-client.ts            # High-level API wrapper
├── date-utils.ts            # Date formatting and manipulation
├── validations/             # Zod validation schemas
│   ├── index.ts            # Main export file
│   ├── common.ts           # Reusable validation schemas
│   ├── organization.ts     # Organization schemas
│   ├── user.ts             # User schemas
│   └── campaign.ts         # Campaign schemas
└── README.md               # This file
```

## 🚀 Usage Examples

### 1. Data Fetching with SWR

```tsx
'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';

export default function OrganizationsList() {
  // Basic usage
  const { data: organizations, error, isLoading } = useSWR(
    '/organizations',
    () => api.organizations.getAll()
  );

  // With pagination
  const { data: paginatedOrgs } = useSWR(
    '/organizations?page=1&limit=10',
    () => api.organizations.getAll({ page: 1, limit: 10 })
  );

  // With relationships
  const { data: orgsWithData } = useSWR(
    '/organizations?include=full',
    () => api.organizations.getAll({ include: 'full' })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading organizations</div>;

  return (
    <ul>
      {organizations?.map((org) => (
        <li key={org.org_id}>{org.name}</li>
      ))}
    </ul>
  );
}
```

### 2. Single Resource Fetching

```tsx
'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';

export default function OrganizationDetail({ id }: { id: number }) {
  const { data: org, error, isLoading, mutate } = useSWR(
    `/organizations/${id}`,
    () => api.organizations.getById(id, { include: 'full' })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Organization not found</div>;

  return (
    <div>
      <h1>{org.name}</h1>
      <p>{org.description}</p>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}
```

### 3. Forms with React Hook Form + Zod

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema, type CreateOrganizationData } from '@/lib/validations';
import { api } from '@/lib/api-client';
import { mutate } from 'swr';

export default function CreateOrganizationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationData>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const onSubmit = async (data: CreateOrganizationData) => {
    try {
      await api.organizations.create(data);
      // Revalidate the list after creating
      mutate('/organizations');
      alert('Organization created successfully!');
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Organization Name</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Type</label>
        <select {...register('type')}>
          <option value="NGO">NGO</option>
          <option value="Foundation">Foundation</option>
          <option value="Corporation">Corporation</option>
          <option value="Government">Government</option>
        </select>
        {errors.type && <span>{errors.type.message}</span>}
      </div>

      <div>
        <label>Country Code</label>
        <input type="number" {...register('country', { valueAsNumber: true })} />
        {errors.country && <span>{errors.country.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('contact_email')} />
        {errors.contact_email && <span>{errors.contact_email.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Organization'}
      </button>
    </form>
  );
}
```

### 4. Update/Delete Operations

```tsx
'use client';

import { api } from '@/lib/api-client';
import { mutate } from 'swr';

export default function OrganizationActions({ id }: { id: number }) {
  const handleUpdate = async () => {
    try {
      await api.organizations.update(id, {
        name: 'Updated Name',
        description: 'Updated description',
      });
      // Revalidate single resource and list
      mutate(`/organizations/${id}`);
      mutate('/organizations');
      alert('Updated successfully!');
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;

    try {
      await api.organizations.delete(id);
      // Revalidate list
      mutate('/organizations');
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div>
      <button onClick={handleUpdate}>Update</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

### 5. Using Zustand Stores

```tsx
'use client';

import { useAuthStore, useUIStore, useSettingsStore } from '@/lib/store';

export default function UserProfile() {
  // Auth store
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // UI store
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  // Settings store
  const { language, setLanguage } = useSettingsStore();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.full_name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login({ user_id: 1, email: 'test@example.com', full_name: 'Test User' })}>
          Login
        </button>
      )}

      <button onClick={toggleSidebar}>
        Toggle Sidebar (currently {isSidebarOpen ? 'open' : 'closed'})
      </button>

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
```

### 6. Date Utilities

```tsx
'use client';

import {
  formatDate,
  formatDateTime,
  getRelativeTime,
  isCampaignActive,
  getDaysRemaining,
  getCampaignStatusText,
} from '@/lib/date-utils';

export default function CampaignCard({ campaign }: { campaign: any }) {
  return (
    <div>
      <h3>{campaign.title}</h3>

      {/* Format dates */}
      <p>Start: {formatDate(campaign.start_date)}</p>
      <p>End: {formatDateTime(campaign.end_date)}</p>

      {/* Relative time */}
      <p>Created {getRelativeTime(campaign.created_at)}</p>

      {/* Campaign status */}
      <p>Status: {getCampaignStatusText(campaign.start_date, campaign.end_date)}</p>

      {/* Days remaining */}
      {isCampaignActive(campaign.start_date, campaign.end_date) && (
        <p>{getDaysRemaining(campaign.end_date)} days left</p>
      )}
    </div>
  );
}
```

### 7. Global SWR Configuration (in app layout)

```tsx
// app/layout.tsx
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SWRConfig value={swrConfig}>
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
```

### 8. Custom Validation Schema

```tsx
// Create a custom validation schema
import { z } from 'zod';
import { emailSchema, positiveNumberSchema } from '@/lib/validations/common';

const myCustomSchema = z.object({
  email: emailSchema,
  amount: positiveNumberSchema,
  customField: z.string().min(5, 'At least 5 characters'),
});

type MyFormData = z.infer<typeof myCustomSchema>;
```

## 🎯 API Client Methods

All resources have the same methods:

```typescript
api.organizations.getAll(params?)      // GET /api/organizations
api.organizations.getById(id, params?) // GET /api/organizations/:id
api.organizations.create(data)         // POST /api/organizations
api.organizations.update(id, data)     // PUT /api/organizations/:id
api.organizations.delete(id)           // DELETE /api/organizations/:id
```

Available resources:
- `api.organizations`
- `api.users`
- `api.campaigns`
- `api.milestones`
- `api.organizationStaff`
- `api.campaignBeneficiaries`
- `api.activities`
- `api.awards`
- `api.campaignStaff`

## 📝 Available Validation Schemas

### Common Schemas
- `emailSchema` - Email validation
- `passwordSchema` - Password validation (8+ chars, uppercase, lowercase, number)
- `urlSchema` - URL validation
- `phoneSchema` - Phone number validation
- `dateSchema` - Date validation
- `positiveNumberSchema` - Positive number validation
- `idSchema` - ID validation (positive integer)

### Organization Schemas
- `organizationSchema` - Base organization validation
- `createOrganizationSchema` - For creating new organizations
- `updateOrganizationSchema` - For updating organizations (all fields optional)

### User Schemas
- `userSchema` - Base user validation
- `registerUserSchema` - User registration with password
- `loginUserSchema` - Login credentials
- `updateUserSchema` - Update user profile
- `changePasswordSchema` - Change password

### Campaign Schemas
- `campaignSchema` - Base campaign validation
- `createCampaignSchema` - Create new campaign
- `updateCampaignSchema` - Update campaign
- `milestoneSchema` - Milestone validation

## 🔒 Authentication (To be implemented)

The `axios-client.ts` and `store.ts` are prepared for authentication. When auth is implemented:

1. Update the request interceptor in `axios-client.ts` to add the token
2. Use `useAuthStore` to manage authentication state
3. Add token to localStorage automatically via Zustand persistence

## 📚 Next Steps

When implementing UI components:

1. Wrap your app in `<SWRConfig value={swrConfig}>` in the root layout
2. Use `api.*` methods for all API calls
3. Use React Hook Form + Zod for all forms
4. Use Zustand stores for global state
5. Use date-utils for all date formatting
6. Import validation schemas from `@/lib/validations`

## 🛠️ Configuration Files

- **axios-client.ts**: Axios instance with interceptors and base URL
- **swr-config.ts**: SWR global configuration
- **store.ts**: Zustand stores (persisted to localStorage)
- **api-client.ts**: High-level typed API wrapper

All configurations are ready to use. No additional setup required!
