import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  skip: number
  take: number
  page: number
}

/**
 * Centralized error handling for API routes
 * Maps Prisma errors and other errors to appropriate HTTP responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          details: error.meta,
        },
        { status: 409 }
      )
    }

    // P2003: Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Invalid reference to related record',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: error.meta,
        },
        { status: 400 }
      )
    }

    // P2025: Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
          details: error.meta,
        },
        { status: 404 }
      )
    }

    // Other Prisma errors
    return NextResponse.json(
      {
        error: 'Database operation failed',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 400 }
    )
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Invalid data provided',
        code: 'VALIDATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 400 }
    )
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: 'Invalid JSON format',
        code: 'INVALID_JSON',
      },
      { status: 400 }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Validates and converts a string ID to a number
 * Returns null if the ID is invalid
 */
export function validateId(id: string): number | null {
  const numId = parseInt(id, 10)
  if (isNaN(numId) || numId <= 0) {
    return null
  }
  return numId
}

/**
 * Parses pagination parameters from URL search params
 * Defaults: page=1, limit=50
 * Max limit: 100
 */
export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  const skip = (page - 1) * limit
  const take = limit

  return { skip, take, page }
}

/**
 * Gets the include configuration for a model based on the include parameter
 * Returns undefined if include is 'none' or null
 */
export function getIncludeConfig(
  includeParam: string | null,
  modelName: string
): Record<string, boolean | object> | undefined {
  if (!includeParam || includeParam === 'none') {
    return undefined
  }

  // Import the includes configuration dynamically
  // This function will be called from route handlers that import api-includes
  // We use a switch statement to avoid circular dependencies

  // For now, return undefined - individual routes will handle includes directly
  // This allows for better type safety with Prisma
  return undefined
}
