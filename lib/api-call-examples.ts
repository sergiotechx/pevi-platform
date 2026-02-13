/**
 * API CALL EXAMPLES - PEVI Platform
 *
 * Este archivo contiene ejemplos de cómo hacer llamadas a la API usando:
 * 1. Axios directo (para mutaciones: POST, PUT, DELETE)
 * 2. SWR (para fetching de datos: GET)
 * 3. API Client (wrapper de alto nivel)
 *
 * Los ejemplos incluyen manejo de errores, loading states, y mejores prácticas.
 */

import { apiClient } from './axios-client';
import { api } from './api-client';
import useSWR, { mutate } from 'swr';
import { swrFetcher, realtimeConfig, staticConfig } from './swr-config';

// ============================================================================
// EJEMPLO 1: LLAMADAS CON AXIOS DIRECTO
// ============================================================================
// Usa Axios directo para mutaciones (crear, actualizar, eliminar)

/**
 * Ejemplo: Crear una nueva organización usando Axios directo
 */
export async function createOrganizationWithAxios() {
  try {
    const payload = {
      name: 'Nueva Organización',
      email: 'contacto@org.com',
      phone: '+51999888777',
      address: 'Av. Principal 123',
      city: 'Lima',
      country: 'Perú',
      website: 'https://org.com',
      status: 'active',
    };

    // POST request
    const response = await apiClient.post('/organizations', payload);

    console.log('Organización creada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear organización:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ejemplo: Actualizar una organización usando Axios directo
 */
export async function updateOrganizationWithAxios(id: number) {
  try {
    const payload = {
      name: 'Organización Actualizada',
      status: 'inactive',
    };

    // PUT request
    const response = await apiClient.put(`/organizations/${id}`, payload);

    console.log('Organización actualizada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar organización:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ejemplo: Eliminar una organización usando Axios directo
 */
export async function deleteOrganizationWithAxios(id: number) {
  try {
    // DELETE request
    const response = await apiClient.delete(`/organizations/${id}`);

    console.log('Organización eliminada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al eliminar organización:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ejemplo: Obtener datos usando Axios directo (GET)
 * Nota: Para GET es mejor usar SWR, pero aquí está el ejemplo
 */
export async function getOrganizationsWithAxios() {
  try {
    // GET request con query params
    const response = await apiClient.get('/organizations', {
      params: {
        page: 1,
        limit: 10,
        include: 'full',
      },
    });

    console.log('Organizaciones obtenidas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener organizaciones:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ejemplo: Obtener una organización específica por ID
 */
export async function getOrganizationByIdWithAxios(id: number) {
  try {
    const response = await apiClient.get(`/organizations/${id}`, {
      params: { include: 'full' },
    });

    console.log('Organización obtenida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener organización:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================================
// EJEMPLO 2: LLAMADAS CON API CLIENT (High-level wrapper)
// ============================================================================
// El API Client es un wrapper más limpio que usa Axios internamente

/**
 * Ejemplo: CRUD completo con API Client
 */
export async function organizationCrudWithApiClient() {
  try {
    // 1. Obtener todas las organizaciones
    const allOrgs = await api.organizations.getAll({ page: 1, limit: 10 });
    console.log('Todas las organizaciones:', allOrgs);

    // 2. Obtener una organización específica con includes
    const singleOrg = await api.organizations.getById(1, { include: 'full' });
    console.log('Organización específica:', singleOrg);

    // 3. Crear una nueva organización
    const newOrg = await api.organizations.create({
      name: 'Org con API Client',
      email: 'api@client.com',
      phone: '+51999777666',
      address: 'Calle Falsa 123',
      city: 'Arequipa',
      country: 'Perú',
      status: 'active',
    });
    console.log('Nueva organización creada:', newOrg);

    // 4. Actualizar la organización
    const updatedOrg = await api.organizations.update(newOrg.id, {
      name: 'Org Actualizada',
      status: 'inactive',
    });
    console.log('Organización actualizada:', updatedOrg);

    // 5. Eliminar la organización
    const deleteResult = await api.organizations.delete(newOrg.id);
    console.log('Resultado de eliminación:', deleteResult);

  } catch (error) {
    console.error('Error en operaciones CRUD:', error);
  }
}

/**
 * Ejemplo: Trabajar con diferentes recursos
 */
export async function multipleResourcesExample() {
  try {
    // Usuarios
    const users = await api.users.getAll({ limit: 5 });
    console.log('Usuarios:', users);

    // Campañas
    const campaigns = await api.campaigns.getAll({ include: 'full' });
    console.log('Campañas:', campaigns);

    // Milestones
    const milestone = await api.milestones.getById(1);
    console.log('Milestone:', milestone);

    // Actividades
    const activities = await api.activities.getAll();
    console.log('Actividades:', activities);

  } catch (error) {
    console.error('Error obteniendo recursos:', error);
  }
}

// ============================================================================
// EJEMPLO 3: USANDO SWR PARA FETCHING DE DATOS
// ============================================================================
// SWR es ideal para GET requests porque maneja cache, revalidación automática, etc.

/**
 * Hook personalizado: Obtener todas las organizaciones con SWR
 */
export function useOrganizations(params?: { page?: number; limit?: number; include?: 'basic' | 'full' }) {
  const query = new URLSearchParams(params as any).toString();
  const url = `/organizations${query ? `?${query}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher);

  return {
    organizations: data,
    isLoading,
    isError: error,
    refresh: mutate, // Función para refrescar los datos manualmente
  };
}

/**
 * Hook personalizado: Obtener una organización específica con SWR
 */
export function useOrganization(id: number | null, includeParam?: 'basic' | 'full') {
  const query = includeParam ? `?include=${includeParam}` : '';
  const url = id ? `/organizations/${id}${query}` : null;

  const { data, error, isLoading, mutate } = useSWR(url, swrFetcher);

  return {
    organization: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook personalizado: Obtener usuarios con SWR
 */
export function useUsers() {
  const { data, error, isLoading } = useSWR('/users', swrFetcher);

  return {
    users: data,
    isLoading,
    isError: error,
  };
}

/**
 * Hook personalizado: Obtener campañas con configuración de tiempo real
 */
export function useCampaignsRealtime() {
  // Usa realtimeConfig para refrescar datos cada 5 segundos
  const { data, error, isLoading } = useSWR(
    '/campaigns?include=full',
    swrFetcher,
    realtimeConfig
  );

  return {
    campaigns: data,
    isLoading,
    isError: error,
  };
}

/**
 * Hook personalizado: Obtener datos estáticos (no se revalidan frecuentemente)
 */
export function useStaticData() {
  // Usa staticConfig para datos que rara vez cambian
  const { data, error, isLoading } = useSWR('/awards', swrFetcher, staticConfig);

  return {
    awards: data,
    isLoading,
    isError: error,
  };
}

// ============================================================================
// EJEMPLO 4: COMPONENTES REACT USANDO SWR
// ============================================================================

/**
 * Componente de ejemplo: Lista de organizaciones usando SWR
 */
export function OrganizationsListExample() {
  const { organizations, isLoading, isError, refresh } = useOrganizations({
    limit: 10,
    include: 'full'
  });

  if (isLoading) return <div>Cargando organizaciones...</div>;
  if (isError) return <div>Error al cargar organizaciones: {isError.message}</div>;
  if (!organizations) return <div>No hay organizaciones</div>;

  return (
    <div>
      <h1>Organizaciones</h1>
      <button onClick={() => refresh()}>Refrescar</button>
      <ul>
        {organizations.map((org: any) => (
          <li key={org.id}>
            {org.name} - {org.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Componente de ejemplo: Detalle de organización con loading y error states
 */
export function OrganizationDetailExample({ id }: { id: number }) {
  const { organization, isLoading, isError } = useOrganization(id, 'full');

  if (isLoading) {
    return (
      <div className="loading">
        <p>Cargando organización...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error">
        <p>Error al cargar organización</p>
        <code>{isError.message}</code>
      </div>
    );
  }

  if (!organization) {
    return <div>Organización no encontrada</div>;
  }

  return (
    <div className="organization-detail">
      <h1>{organization.name}</h1>
      <p>Email: {organization.email}</p>
      <p>Teléfono: {organization.phone}</p>
      <p>Ciudad: {organization.city}</p>
      <p>Estado: {organization.status}</p>
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: MUTACIONES CON SWR (Optimistic Updates)
// ============================================================================

/**
 * Componente de ejemplo: Crear organización con mutación optimista
 */
export function CreateOrganizationForm() {
  const handleSubmit = async (formData: any) => {
    try {
      // 1. Crear la organización usando API Client
      const newOrg = await api.organizations.create(formData);

      // 2. Revalidar la cache de SWR para actualizar la lista
      mutate('/organizations');

      console.log('Organización creada y cache actualizada:', newOrg);
      return newOrg;
    } catch (error) {
      console.error('Error al crear organización:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Crear Organización</h2>
      <button onClick={() => handleSubmit({
        name: 'Nueva Org',
        email: 'nueva@org.com',
        phone: '+51999666555',
        address: 'Dirección',
        city: 'Lima',
        country: 'Perú',
        status: 'active',
      })}>
        Crear
      </button>
    </div>
  );
}

/**
 * Componente de ejemplo: Actualizar organización con optimistic update
 */
export function UpdateOrganizationButton({ id }: { id: number }) {
  const { organization, refresh } = useOrganization(id);

  const handleUpdate = async () => {
    try {
      // Actualizar usando API Client
      const updated = await api.organizations.update(id, {
        status: organization.status === 'active' ? 'inactive' : 'active',
      });

      // Refrescar la data local
      refresh();

      // También revalidar la lista general
      mutate('/organizations');

      console.log('Organización actualizada:', updated);
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  return (
    <button onClick={handleUpdate}>
      Toggle Estado ({organization?.status})
    </button>
  );
}

/**
 * Componente de ejemplo: Eliminar organización con confirmación
 */
export function DeleteOrganizationButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta organización?')) {
      return;
    }

    try {
      // Eliminar usando API Client
      await api.organizations.delete(id);

      // Revalidar la cache para actualizar la lista
      mutate('/organizations');

      console.log('Organización eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <button onClick={handleDelete} className="btn-danger">
      Eliminar
    </button>
  );
}

// ============================================================================
// EJEMPLO 6: MANEJO AVANZADO DE ERRORES
// ============================================================================

/**
 * Ejemplo: Función helper para manejar errores de forma consistente
 */
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  errorMessage?: string
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiFunction();
    return { data };
  } catch (error: any) {
    const message = errorMessage || error.response?.data?.error || error.message;
    console.error('API Error:', message);
    return { error: message };
  }
}

/**
 * Ejemplo: Uso del helper de errores
 */
export async function createOrganizationSafely() {
  const { data, error } = await safeApiCall(
    () => api.organizations.create({
      name: 'Test Org',
      email: 'test@org.com',
      phone: '+51999111222',
      address: 'Test Address',
      city: 'Lima',
      country: 'Perú',
      status: 'active',
    }),
    'No se pudo crear la organización'
  );

  if (error) {
    alert(`Error: ${error}`);
    return null;
  }

  console.log('Organización creada:', data);
  return data;
}

// ============================================================================
// EJEMPLO 7: PAGINACIÓN Y FILTROS
// ============================================================================

/**
 * Hook personalizado: Lista paginada de organizaciones
 */
export function usePaginatedOrganizations(page: number = 1, limit: number = 10) {
  const { data, error, isLoading } = useSWR(
    `/organizations?page=${page}&limit=${limit}`,
    swrFetcher
  );

  return {
    organizations: data,
    isLoading,
    isError: error,
    page,
    limit,
  };
}

/**
 * Componente de ejemplo: Paginación
 */
export function PaginatedOrganizationsList() {
  const [page, setPage] = React.useState(1);
  const { organizations, isLoading, isError } = usePaginatedOrganizations(page, 10);

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar</div>;

  return (
    <div>
      <ul>
        {organizations?.map((org: any) => (
          <li key={org.id}>{org.name}</li>
        ))}
      </ul>
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
        <span>Página {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Siguiente</button>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 8: LLAMADAS PARALELAS
// ============================================================================

/**
 * Ejemplo: Cargar múltiples recursos en paralelo
 */
export async function loadDashboardData() {
  try {
    // Ejecutar todas las llamadas en paralelo usando Promise.all
    const [organizations, users, campaigns, activities] = await Promise.all([
      api.organizations.getAll({ limit: 5 }),
      api.users.getAll({ limit: 5 }),
      api.campaigns.getAll({ limit: 5 }),
      api.activities.getAll({ limit: 10 }),
    ]);

    console.log('Dashboard data loaded:', {
      organizations,
      users,
      campaigns,
      activities,
    });

    return { organizations, users, campaigns, activities };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}

/**
 * Componente de ejemplo: Dashboard con múltiples recursos usando SWR
 */
export function DashboardExample() {
  const { data: organizations } = useSWR('/organizations?limit=5', swrFetcher);
  const { data: users } = useSWR('/users?limit=5', swrFetcher);
  const { data: campaigns } = useSWR('/campaigns?limit=5', swrFetcher);

  // SWR hace las llamadas en paralelo automáticamente
  const isLoading = !organizations || !users || !campaigns;

  if (isLoading) return <div>Cargando dashboard...</div>;

  return (
    <div className="dashboard">
      <section>
        <h2>Organizaciones ({organizations.length})</h2>
        {/* Renderizar organizaciones */}
      </section>
      <section>
        <h2>Usuarios ({users.length})</h2>
        {/* Renderizar usuarios */}
      </section>
      <section>
        <h2>Campañas ({campaigns.length})</h2>
        {/* Renderizar campañas */}
      </section>
    </div>
  );
}

// ============================================================================
// NOTAS FINALES Y MEJORES PRÁCTICAS
// ============================================================================

/**
 * CUÁNDO USAR QUÉ:
 *
 * 1. USA SWR para:
 *    - Obtener datos (GET requests)
 *    - Datos que necesitas mostrar en la UI
 *    - Datos que quieres cachear y revalidar automáticamente
 *    - Listas, detalles, dashboards
 *
 * 2. USA AXIOS DIRECTO o API CLIENT para:
 *    - Mutaciones (POST, PUT, DELETE)
 *    - Crear, actualizar, eliminar recursos
 *    - Operaciones que no necesitan cache
 *    - Event handlers (onClick, onSubmit)
 *
 * 3. USA API CLIENT (preferido sobre Axios directo) porque:
 *    - Tiene métodos tipados y más limpios
 *    - Maneja la URL construction automáticamente
 *    - Es más fácil de mantener y testear
 *
 * FLUJO TÍPICO:
 * 1. Cargar datos con SWR (hook personalizado)
 * 2. Mostrar datos en la UI
 * 3. Usuario hace una acción (crear, editar, eliminar)
 * 4. Llamar a API Client para la mutación
 * 5. Revalidar la cache de SWR con mutate()
 * 6. La UI se actualiza automáticamente
 */

// Importa React para los ejemplos de componentes
import React from 'react';
