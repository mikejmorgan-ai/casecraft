'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Scale,
  Home,
  Building2,
  Landmark,
  Shield,
  Pickaxe,
  Wind,
  Loader2,
  ArrowRight,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CaseTemplate {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  case_type: string
  default_agents: readonly string[]
  sample_facts: readonly string[]
  tags: readonly string[]
  featured?: boolean
}

// Case templates for common Utah case types
const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'property-rights',
    name: 'Property Rights Dispute',
    description: 'Disputes over property ownership, boundaries, easements, or zoning',
    icon: Home,
    color: 'bg-blue-500',
    case_type: 'property',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney'],
    sample_facts: [
      'Property dispute involving [PROPERTY_ADDRESS]',
      'Plaintiff claims ownership based on [BASIS]',
      'Defendant disputes based on [DEFENSE]',
    ],
    tags: ['property', 'real estate', 'zoning', 'easement'],
  },
  {
    id: 'vested-mining-rights',
    name: 'Vested Mining Rights',
    description: 'Mining claims, mineral rights, and vested rights doctrine cases',
    icon: Pickaxe,
    color: 'bg-amber-600',
    case_type: 'property',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney', 'expert_witness'],
    sample_facts: [
      'Mining claim filed on [DATE] for [MINERAL_TYPE]',
      'Plaintiff claims vested rights under [STATUTE]',
      'Government action affecting mining rights on [DATE]',
    ],
    tags: ['mining', 'mineral rights', 'vested rights', 'DOGM'],
    featured: true,
  },
  {
    id: 'fugitive-dust',
    name: 'Fugitive Dust / Air Quality',
    description: 'Environmental cases involving air quality violations and dust regulations',
    icon: Wind,
    color: 'bg-gray-500',
    case_type: 'administrative',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney', 'expert_witness'],
    sample_facts: [
      'Alleged fugitive dust violations at [LOCATION]',
      'Air quality measurements on [DATE] showed [READING]',
      'Regulatory action by [AGENCY] on [DATE]',
    ],
    tags: ['environmental', 'air quality', 'dust', 'EPA', 'DEQ'],
    featured: true,
  },
  {
    id: 'government-overreach',
    name: 'City/County Overreach',
    description: 'Regulatory takings, land use disputes, and government overreach',
    icon: Landmark,
    color: 'bg-red-500',
    case_type: 'constitutional',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney'],
    sample_facts: [
      'Government action by [ENTITY] on [DATE]',
      'Property/rights affected: [DESCRIPTION]',
      'Claimed constitutional violation under [AMENDMENT]',
    ],
    tags: ['takings', 'overreach', 'constitutional', 'zoning'],
    featured: true,
  },
  {
    id: 'contract-dispute',
    name: 'Contract Dispute',
    description: 'Breach of contract, performance disputes, and commercial litigation',
    icon: FileText,
    color: 'bg-green-500',
    case_type: 'contract',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney'],
    sample_facts: [
      'Contract executed on [DATE] between parties',
      'Alleged breach occurred on [DATE]',
      'Damages claimed: [AMOUNT]',
    ],
    tags: ['contract', 'breach', 'commercial'],
  },
  {
    id: 'civil-rights',
    name: 'Civil Rights',
    description: 'Section 1983 claims, civil rights violations, constitutional issues',
    icon: Shield,
    color: 'bg-purple-500',
    case_type: 'civil',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney'],
    sample_facts: [
      'Incident occurred on [DATE] at [LOCATION]',
      'Government actor involved: [ENTITY/PERSON]',
      'Rights allegedly violated: [RIGHTS]',
    ],
    tags: ['civil rights', '1983', 'constitutional'],
  },
  {
    id: 'land-use',
    name: 'Land Use / Zoning',
    description: 'Zoning appeals, variances, conditional use permits, development disputes',
    icon: Building2,
    color: 'bg-teal-500',
    case_type: 'administrative',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney'],
    sample_facts: [
      'Property located at [ADDRESS] in [JURISDICTION]',
      'Zoning classification: [ZONE]',
      'Requested action: [VARIANCE/PERMIT/APPEAL]',
    ],
    tags: ['zoning', 'land use', 'development', 'planning'],
  },
  {
    id: 'tort-negligence',
    name: 'Personal Injury / Negligence',
    description: 'Personal injury claims, negligence, premises liability',
    icon: Scale,
    color: 'bg-orange-500',
    case_type: 'tort',
    default_agents: ['judge', 'plaintiff_attorney', 'defense_attorney', 'expert_witness'],
    sample_facts: [
      'Incident occurred on [DATE] at [LOCATION]',
      'Injuries sustained: [INJURIES]',
      'Defendant duty of care: [DUTY]',
    ],
    tags: ['tort', 'negligence', 'injury', 'liability'],
  },
]

interface CaseTemplatesProps {
  onSelect?: (template: CaseTemplate, caseName: string) => void
  featured?: boolean
}

export function CaseTemplates({ onSelect, featured = false }: CaseTemplatesProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null)
  const [caseName, setCaseName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const templates = featured
    ? CASE_TEMPLATES.filter(t => t.featured)
    : CASE_TEMPLATES

  const handleCreateCase = async () => {
    if (!selectedTemplate || !caseName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: caseName.trim(),
          case_type: selectedTemplate.case_type,
          status: 'draft',
        }),
      })

      if (!response.ok) throw new Error('Failed to create case')

      const data = await response.json()

      if (onSelect) {
        onSelect(selectedTemplate, caseName)
      } else {
        router.push(`/case/${data.id}`)
      }
    } catch (err) {
      console.error('Error creating case:', err)
    } finally {
      setIsCreating(false)
      setSelectedTemplate(null)
      setCaseName('')
    }
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => {
          const Icon = template.icon
          return (
            <Card
              key={template.id}
              className="hover:border-primary/50 cursor-pointer transition-all group relative overflow-hidden"
              onClick={() => {
                setSelectedTemplate(template)
                setCaseName(`${template.name} - New Case`)
              }}
            >
              {template.featured && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform',
                    template.color
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && (
                <>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', selectedTemplate.color)}>
                    <selectedTemplate.icon className="h-5 w-5" />
                  </div>
                  Create {selectedTemplate.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Case Name</label>
              <Input
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="Enter case name..."
              />
            </div>

            {selectedTemplate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Template includes:</label>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm">
                    <strong>Case Type:</strong> {selectedTemplate.case_type}
                  </p>
                  <p className="text-sm">
                    <strong>Default Agents:</strong> {selectedTemplate.default_agents.length} pre-configured
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sample facts and structure will be available for customization.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCase} disabled={isCreating || !caseName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Case
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Compact template selector for quick case creation
export function QuickTemplateSelector({ onSelect }: { onSelect: (templateId: string) => void }) {
  const featuredTemplates = CASE_TEMPLATES.filter(t => t.featured)

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {featuredTemplates.map((template) => {
        const Icon = template.icon
        return (
          <Button
            key={template.id}
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => onSelect(template.id)}
          >
            <div className={cn('w-5 h-5 rounded flex items-center justify-center text-white', template.color)}>
              <Icon className="h-3 w-3" />
            </div>
            {template.name}
          </Button>
        )
      })}
    </div>
  )
}
