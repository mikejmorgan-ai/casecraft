import { NextRequest, NextResponse } from 'next/server'
import {
  searchStatutes,
  findStatuteByCode,
  findStatutesByCategory,
  getCategories,
  getRelatedStatutes,
  STATUTE_DATABASE,
  type StatuteCategory,
  STATUTE_CATEGORY_LABELS,
} from '@/lib/legal/statute-database'
import { searchLegalStandards, getAllLegalStandards } from '@/lib/legal/standards'

/**
 * GET /api/statutes
 *
 * Search and browse the statute database.
 *
 * Query parameters:
 *   q           - Search term (keyword search across all fields)
 *   code        - Look up a specific statute by code (e.g., "17-41-501")
 *   category    - Filter by category (e.g., "mining_rights", "critical_infrastructure")
 *   jurisdiction - Filter by jurisdiction (e.g., "utah", "federal")
 *   id          - Look up a specific statute by ID and include related statutes
 *   type        - "statutes" (default), "standards", "categories"
 *   limit       - Maximum number of results (default: 20)
 *   offset      - Pagination offset (default: 0)
 *
 * Examples:
 *   /api/statutes?q=vested+mining&jurisdiction=utah
 *   /api/statutes?code=17-41-501
 *   /api/statutes?category=mining_rights
 *   /api/statutes?type=categories
 *   /api/statutes?type=standards&q=injunction
 *   /api/statutes?id=utah-17-41-501
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || ''
    const code = searchParams.get('code') || ''
    const category = searchParams.get('category') || ''
    const jurisdiction = searchParams.get('jurisdiction') || ''
    const id = searchParams.get('id') || ''
    const type = searchParams.get('type') || 'statutes'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // --- Return categories listing ---
    if (type === 'categories') {
      const categories = getCategories()
      return NextResponse.json({
        type: 'categories',
        data: categories,
        total: categories.length,
      })
    }

    // --- Return legal standards ---
    if (type === 'standards') {
      if (query) {
        const results = searchLegalStandards(query)
        return NextResponse.json({
          type: 'standards',
          query,
          data: results.slice(offset, offset + limit),
          total: results.length,
          limit,
          offset,
        })
      }

      const allStandards = getAllLegalStandards()
      return NextResponse.json({
        type: 'standards',
        data: allStandards.slice(offset, offset + limit),
        total: allStandards.length,
        limit,
        offset,
      })
    }

    // --- Lookup by ID with related statutes ---
    if (id) {
      const statute = STATUTE_DATABASE.find((s) => s.id === id)
      if (!statute) {
        return NextResponse.json(
          { error: 'Statute not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }

      const related = getRelatedStatutes(id)
      return NextResponse.json({
        type: 'statute_detail',
        data: statute,
        related,
      })
    }

    // --- Lookup by code ---
    if (code) {
      const statute = findStatuteByCode(code)
      if (!statute) {
        return NextResponse.json(
          {
            error: `No statute found matching code "${code}"`,
            code: 'NOT_FOUND',
            suggestion: 'Try searching with a partial code like "17-41" or use the q parameter for keyword search.',
          },
          { status: 404 }
        )
      }

      const related = getRelatedStatutes(statute.id)
      return NextResponse.json({
        type: 'statute_detail',
        data: statute,
        related,
      })
    }

    // --- Filter by category ---
    if (category && !query) {
      // Validate category
      if (!STATUTE_CATEGORY_LABELS[category as StatuteCategory]) {
        return NextResponse.json(
          {
            error: `Invalid category "${category}"`,
            code: 'INVALID_INPUT',
            validCategories: Object.keys(STATUTE_CATEGORY_LABELS),
          },
          { status: 400 }
        )
      }

      const statutes = findStatutesByCategory(category as StatuteCategory)
      return NextResponse.json({
        type: 'category_results',
        category,
        categoryLabel: STATUTE_CATEGORY_LABELS[category as StatuteCategory],
        data: statutes.slice(offset, offset + limit),
        total: statutes.length,
        limit,
        offset,
      })
    }

    // --- Keyword search ---
    if (query) {
      const results = searchStatutes(query, {
        jurisdiction: jurisdiction || undefined,
        category: (category as StatuteCategory) || undefined,
        limit: limit + offset,
      })

      const paginatedResults = results.slice(offset, offset + limit)

      return NextResponse.json({
        type: 'search_results',
        query,
        jurisdiction: jurisdiction || 'all',
        category: category || 'all',
        data: paginatedResults.map((r) => ({
          ...r.statute,
          relevanceScore: r.score,
        })),
        total: results.length,
        limit,
        offset,
      })
    }

    // --- No params: return all statutes (paginated) ---
    const allStatutes = STATUTE_DATABASE.slice(offset, offset + limit)
    return NextResponse.json({
      type: 'all_statutes',
      data: allStatutes,
      total: STATUTE_DATABASE.length,
      limit,
      offset,
    })
  } catch (err) {
    console.error('GET /api/statutes error:', err)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while searching statutes',
        code: 'INTERNAL_ERROR',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
