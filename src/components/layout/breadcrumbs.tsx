'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Auto-generate breadcrumbs from pathname if items not provided
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Build breadcrumb items from path segments
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`

    // Skip route groups like (dashboard) and (auth)
    if (segment.startsWith('(') && segment.endsWith(')')) continue

    // Format the label
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      // Don't capitalize UUIDs
      .replace(/^[0-9a-f]{8}-[0-9a-f]{4}/i, segment)

    breadcrumbs.push({
      label,
      href: currentPath,
    })
  }

  // Last item should not be a link
  if (breadcrumbs.length > 0) {
    delete breadcrumbs[breadcrumbs.length - 1].href
  }

  return breadcrumbs
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()
  const breadcrumbs = items || generateBreadcrumbs(pathname)

  if (breadcrumbs.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}
    >
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors truncate max-w-[150px]"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
