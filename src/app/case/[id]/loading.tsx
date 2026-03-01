import { Card, CardContent, CardHeader } from '@/components/ui/card'

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className || ''}`} />
}

export default function CaseDetailLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back link + header */}
      <SkeletonPulse className="h-4 w-24" />
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-64" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-5 w-20" />
          <SkeletonPulse className="h-5 w-24" />
          <SkeletonPulse className="h-5 w-16" />
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonPulse key={i} className="h-8 w-24" />
        ))}
      </div>

      {/* Content area */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <SkeletonPulse className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <SkeletonPulse key={j} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SkeletonPulse className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((j) => (
              <SkeletonPulse key={j} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
