'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Scale } from 'lucide-react'
import { ClaimCard } from '@/components/claims/claim-card'
import { CreateClaimDialog } from '@/components/claims/create-claim-dialog'
import type { ClaimForRelief } from '@/lib/types'

interface ClaimsListProps {
  caseId: string
  claims: ClaimForRelief[]
}

export function ClaimsList({ caseId, claims }: ClaimsListProps) {
  const [expandedClaims, setExpandedClaims] = useState<Set<string>>(new Set())

  const toggleExpand = (claimId: string) => {
    setExpandedClaims(prev => {
      const next = new Set(prev)
      if (next.has(claimId)) {
        next.delete(claimId)
      } else {
        next.add(claimId)
      }
      return next
    })
  }

  // Calculate the next claim number
  const nextClaimNumber = claims.length > 0
    ? Math.max(...claims.map(c => c.claim_number)) + 1
    : 1

  const alternativeCount = claims.filter(c => c.is_alternative).length

  return (
    <div id="claims-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Claims for Relief</h2>
          <p className="text-muted-foreground text-sm">
            {claims.length} claim{claims.length !== 1 ? 's' : ''}
            {alternativeCount > 0 && ` (${alternativeCount} alternative)`}
          </p>
        </div>
        <CreateClaimDialog caseId={caseId} nextClaimNumber={nextClaimNumber} />
      </div>

      <div className="grid gap-4">
        {claims.map((claim) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            caseId={caseId}
            isExpanded={expandedClaims.has(claim.id)}
            onToggleExpand={() => toggleExpand(claim.id)}
          />
        ))}
      </div>

      {claims.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No claims established</h3>
            <p className="text-muted-foreground mb-4">
              Add claims for relief to define what remedies are being sought in this case.
            </p>
            <CreateClaimDialog caseId={caseId} nextClaimNumber={1} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
