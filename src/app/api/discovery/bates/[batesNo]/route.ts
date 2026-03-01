import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

const DISCOVERY_DIRS = [
  'data/discovery-0001',
  'data/discovery-0002',
  'data/discovery-0003',
  'data/discovery-0004',
  'data/discovery-0005',
  'data/discovery-0006',
]

// Bates number format: SLCo followed by exactly 6 digits
const BATES_PATTERN = /^SLCo\d{6}$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batesNo: string }> }
) {
  const { batesNo } = await params

  if (!BATES_PATTERN.test(batesNo)) {
    return NextResponse.json(
      { error: 'Invalid Bates number format. Expected: SLCo followed by 6 digits (e.g., SLCo002501)' },
      { status: 400 }
    )
  }

  const filename = `Tree Farm ${batesNo}.txt`
  const projectRoot = process.cwd()

  for (const dir of DISCOVERY_DIRS) {
    const filePath = join(projectRoot, dir, filename)
    try {
      const content = await readFile(filePath, 'utf-8')

      const format = request.nextUrl.searchParams.get('format')

      if (format === 'json') {
        return NextResponse.json({
          bates: batesNo,
          filename,
          content,
        })
      }

      // Default: return plain text
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `inline; filename="${filename}"`,
        },
      })
    } catch {
      // File not in this directory, try next
      continue
    }
  }

  return NextResponse.json(
    { error: `Document ${batesNo} not found` },
    { status: 404 }
  )
}
