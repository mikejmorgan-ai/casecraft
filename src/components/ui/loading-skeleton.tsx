import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Base skeleton component for creating loading placeholders
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
}

/**
 * CaseCardSkeleton - Loading skeleton for case cards on the dashboard
 */
export function CaseCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {/* Case title */}
            <Skeleton className="h-5 w-48" />
            {/* Case metadata (number, type, jurisdiction) */}
            <Skeleton className="h-4 w-64" />
          </div>
          {/* Status badge */}
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Plaintiff v. Defendant */}
        <Skeleton className="h-4 w-40 mb-3" />
        {/* Stats row */}
        <div className="flex gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * CaseCardSkeletonList - Multiple case card skeletons for loading state
 */
export function CaseCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CaseCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * ChatMessageSkeleton - Loading skeleton for chat messages
 */
export function ChatMessageSkeleton({
  isUser = false,
  showAvatar = true,
}: {
  isUser?: boolean
  showAvatar?: boolean
}) {
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {showAvatar && (
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      )}
      <div className={cn('max-w-[70%] space-y-2', isUser && 'text-right')}>
        {/* Agent name (only for non-user) */}
        {!isUser && <Skeleton className="h-3 w-20" />}
        {/* Message card */}
        <Card className={cn(
          'inline-block w-full',
          isUser ? 'bg-secondary/10' : 'bg-white'
        )}>
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * ChatMessageSkeletonList - Multiple chat message skeletons for loading state
 */
export function ChatMessageSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChatMessageSkeleton key={i} isUser={i % 2 === 0} />
      ))}
    </div>
  )
}

/**
 * DocumentCardSkeleton - Loading skeleton for document cards
 */
export function DocumentCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Document icon */}
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              {/* Document name */}
              <Skeleton className="h-5 w-48" />
              {/* Badges row */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              {/* Content preview */}
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * DocumentCardSkeletonList - Multiple document card skeletons for loading state
 */
export function DocumentCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * StatCardSkeleton - Loading skeleton for stat cards on the dashboard
 */
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            {/* Value */}
            <Skeleton className="h-7 w-12" />
            {/* Label */}
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * AgentCardSkeleton - Loading skeleton for agent cards
 */
export function AgentCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              {/* Name */}
              <Skeleton className="h-5 w-32" />
              {/* Role badge */}
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
          {/* Toggle switch */}
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * FormFieldSkeleton - Loading skeleton for form fields
 */
export function FormFieldSkeleton({
  labelWidth = 'w-20',
  inputHeight = 'h-10',
}: {
  labelWidth?: string
  inputHeight?: string
}) {
  return (
    <div className="grid gap-2">
      <Skeleton className={cn('h-4', labelWidth)} />
      <Skeleton className={cn('w-full rounded-md', inputHeight)} />
    </div>
  )
}

/**
 * PageHeaderSkeleton - Loading skeleton for page headers
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  )
}

/**
 * TableRowSkeleton - Loading skeleton for table rows
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-32' : i === columns - 1 ? 'w-20' : 'flex-1'
          )}
        />
      ))}
    </div>
  )
}

/**
 * FullPageSkeleton - Loading skeleton for full page content
 */
export function FullPageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <CaseCardSkeletonList count={3} />
    </div>
  )
}
