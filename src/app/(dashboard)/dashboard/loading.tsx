import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <SkeletonPulse className="h-6 w-48" />
          <SkeletonPulse className="h-4 w-32" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <SkeletonPulse className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <SkeletonPulse className="h-8 w-16" />
              <SkeletonPulse className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <SkeletonPulse className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <SkeletonPulse key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
