# Configuración de Prisma ORM - PEVI Platform

## 📋 Resumen

Se ha configurado exitosamente Prisma ORM 7.4.0 con una base de datos SQLite3 (`pevi.db`) para la plataforma PEVI.

## 🗂️ Estructura de la Base de Datos

La base de datos incluye las siguientes tablas:

- **ORGANIZATION** - Organizaciones del sistema
- **USER** - Usuarios de la plataforma
- **CAMPAIGN** - Campañas creadas por las organizaciones
- **CAMPAIGN_BENEFICIARY** - Beneficiarios de las campañas
- **MILESTONE** - Hitos de las campañas
- **ORGANIZATION_STAFF** - Personal de las organizaciones
- **ACTIVITY** - Actividades de los beneficiarios
- **AWARD** - Premios/recompensas por actividades completadas
- **CAMPAIGN_STAFF** - Personal asignado a campañas específicas

## 📁 Archivos Creados

### Archivos de Configuración

1. **`prisma/schema.prisma`**
   - Define todos los modelos de datos
   - Configuración de relaciones entre tablas
   - Índices y constraints

2. **`prisma.config.ts`**
   - Configuración de conexión a la base de datos
   - Rutas de migraciones
   - Variable de entorno DATABASE_URL

3. **`.env`**
   - Variables de entorno
   - Contiene `DATABASE_URL="file:./pevi.db"`

### Archivos de Código

4. **`lib/prisma.ts`**
   - Cliente de Prisma singleton
   - Configuración optimizada para Next.js
   - Previene conexiones múltiples en desarrollo

5. **`lib/db-examples.ts`**
   - Ejemplos de funciones para interactuar con la base de datos
   - Casos de uso comunes
   - Ejemplo de uso en API Routes

## 🚀 Comandos Útiles de Prisma

```bash
# Generar el cliente de Prisma (después de cambios en schema.prisma)
pnpm prisma generate

# Sincronizar la base de datos con el schema (desarrollo)
pnpm prisma db push

# Abrir Prisma Studio (interfaz visual para la BD)
pnpm prisma studio

# Crear una migración
pnpm prisma migrate dev --name nombre_migracion

# Ver el estado de las migraciones
pnpm prisma migrate status

# Formatear el schema.prisma
pnpm prisma format
```

## 💻 Uso en la Aplicación

### Importar el Cliente

```typescript
import { prisma } from '@/lib/prisma'
```

### Ejemplo de Consultas

```typescript
// Obtener todos los usuarios
const users = await prisma.user.findMany()

// Crear una nueva organización
const org = await prisma.organization.create({
  data: {
    name: 'Mi Organización',
    type: 'NGO',
    country: 1
  }
})

// Buscar con relaciones
const campaigns = await prisma.campaign.findMany({
  include: {
    organization: true,
    milestones: true,
    campaignBeneficiaries: {
      include: {
        user: true
      }
    }
  }
})
```

### Ejemplo de API Route (Next.js)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await prisma.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}
```

## 🔍 TypeScript Intellisense

Prisma genera automáticamente tipos de TypeScript para todos tus modelos. Tendrás autocompletado completo al usar el cliente:

```typescript
// Los tipos están generados automáticamente
const user: User = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
})

// Prisma conoce todas las relaciones
const campaign = await prisma.campaign.findFirst({
  include: {
    organization: true, // ✅ TypeScript sabe que esto existe
    milestones: true,   // ✅ Relación válida
  }
})
```

## 📚 Documentación

Para más información sobre cómo usar Prisma ORM 7:

- [Prisma ORM Documentation](https://www.prisma.io/docs/orm)
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Upgrade Guide to Prisma 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

## ⚙️ Configuración de Prisma 7

Este proyecto usa Prisma ORM v7, que tiene algunos cambios importantes respecto a versiones anteriores:

- La URL de conexión se configura en `prisma.config.ts` en lugar de en el `schema.prisma`
- Se requiere el paquete `dotenv` para variables de entorno
- El schema.prisma solo contiene el `provider` en el bloque datasource

## 🎯 Próximos Pasos

1. **Crear APIs REST** - Implementar endpoints para CRUD de todas las tablas
2. **Validación** - Agregar Zod schemas para validar datos de entrada
3. **Migraciones** - Implementar sistema de migraciones para cambios de schema
4. **Seeders** - Crear datos de prueba para desarrollo
5. **Tests** - Agregar tests para las funciones de base de datos

## 🐛 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
pnpm prisma generate
```

### Base de datos desactualizada
```bash
pnpm prisma db push
```

### Ver datos en la base de datos
```bash
pnpm prisma studio
```
