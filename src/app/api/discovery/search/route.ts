import { NextRequest, NextResponse } from 'next/server'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

const DISCOVERY_DIRS = [
  'data/discovery-0001',
  'data/discovery-0002',
  'data/discovery-0003',
  'data/discovery-0004',
  'data/discovery-0005',
  'data/discovery-0006',
]

const BATES_FROM_FILENAME = /SLCo\d{6}/

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters' },
      { status: 400 }
    )
  }

  const searchTerm = query.trim().toLowerCase()
  const projectRoot = process.cwd()
  const matches: string[] = []

  for (const dir of DISCOVERY_DIRS) {
    const dirPath = join(projectRoot, dir)
    let files: string[]
    try {
      files = await readdir(dirPath)
    } catch {
      continue
    }

    for (const file of files) {
      if (!file.endsWith('.txt')) continue

      try {
        const content = await readFile(join(dirPath, file), 'utf-8')
        if (content.toLowerCase().includes(searchTerm)) {
          const batesMatch = file.match(BATES_FROM_FILENAME)
          if (batesMatch) {
            matches.push(batesMatch[0])
          }
        }
      } catch {
        continue
      }

      // Cap results at 200 to keep response times reasonable
      if (matches.length >= 200) break
    }

    if (matches.length >= 200) break
  }

  return NextResponse.json({
    query: query.trim(),
    count: matches.length,
    capped: matches.length >= 200,
    results: matches,
  })
}
