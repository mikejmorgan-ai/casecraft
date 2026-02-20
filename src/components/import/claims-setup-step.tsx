'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, GripVertical } from 'lucide-react'

const RELIEF_TYPES = [
  { value: 'declaratory', label: 'Declaratory Relief', description: 'Court declaration of rights' },
  { value: 'injunctive', label: 'Injunctive Relief', description: 'Court order to act or stop acting' },
  { value: 'regulatory_taking', label: 'Regulatory Taking', description: 'Government taking of property' },
  { value: 'damages', label: 'Damages', description: 'Monetary compensation' },
  { value: 'restitution', label: 'Restitution', description: 'Restoration of property or money' },
  { value: 'specific_performance', label: 'Specific Performance', description: 'Enforcement of contract terms' },
  { value: 'attorneys_fees', label: "Attorney's Fees", description: 'Recovery of legal costs' },
  { value: 'other', label: 'Other', description: 'Other type of relief' },
] as const

export interface ClaimData {
  id: string
  title: string
  relief_type: string
  description: string
  legal_basis: string
}

interface ClaimsSetupStepProps {
  claims: ClaimData[]
  onClaimsChange: (claims: ClaimData[]) => void
}

export function ClaimsSetupStep({ claims, onClaimsChange }: ClaimsSetupStepProps) {
  const addClaim = () => {
    const newClaim: ClaimData = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      title: '',
      relief_type: 'other',
      description: '',
      legal_basis: '',
    }
    onClaimsChange([...claims, newClaim])
  }

  const removeClaim = (id: string) => {
    onClaimsChange(claims.filter(c => c.id !== id))
  }

  const updateClaim = (id: string, field: keyof ClaimData, value: string) => {
    onClaimsChange(
      claims.map(c => c.id === id ? { ...c, [field]: value } : c)
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Define the legal claims for this case. Claims can be added or modified later.
          </p>
        </div>
        <Button onClick={addClaim} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Claim
        </Button>
      </div>

      {claims.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <GripVertical className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No claims added</h3>
            <p className="text-muted-foreground text-sm text-center mb-4">
              Add claims to define the legal theories and relief sought in this case.
              <br />
              This step is optional -- you can configure claims later.
            </p>
            <Button variant="outline" onClick={addClaim} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Claim
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {claims.map((claim, index) => (
          <Card key={claim.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="text-xs">
                  Claim {index + 1}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeClaim(claim.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Claim Title</Label>
                    <Input
                      placeholder="e.g., Breach of Contract"
                      value={claim.title}
                      onChange={(e) => updateClaim(claim.id, 'title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type of Relief</Label>
                    <Select
                      value={claim.relief_type}
                      onValueChange={(value) => updateClaim(claim.id, 'relief_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELIEF_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <span>{type.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                -- {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the claim, including key facts and arguments..."
                    value={claim.description}
                    onChange={(e) => updateClaim(claim.id, 'description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Legal Basis (optional)</Label>
                  <Input
                    placeholder="e.g., Utah Code 17-41-501, breach of fiduciary duty..."
                    value={claim.legal_basis}
                    onChange={(e) => updateClaim(claim.id, 'legal_basis', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cite relevant statutes, case law, or legal theories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
