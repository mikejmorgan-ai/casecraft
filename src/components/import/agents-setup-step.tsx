'use client'

import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gavel,
  Scale,
  Shield,
  FileText,
  User,
  GraduationCap,
  Handshake,
  BookOpen,
  Archive,
  Mountain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentRole } from '@/lib/types'

const ROLE_ICONS: Record<AgentRole, React.ElementType> = {
  judge: Gavel,
  plaintiff_attorney: Scale,
  defense_attorney: Shield,
  court_clerk: FileText,
  witness: User,
  expert_witness: GraduationCap,
  mediator: Handshake,
  law_clerk: BookOpen,
  county_recorder: Archive,
  dogm_agent: Mountain,
}

interface AgentRoleConfig {
  role: AgentRole
  label: string
  description: string
  recommended: boolean
}

const AGENT_ROLES: AgentRoleConfig[] = [
  {
    role: 'judge',
    label: 'Judge',
    description: 'Presides over the case, makes rulings, and ensures proper procedure. Evaluates arguments and evidence from both sides impartially.',
    recommended: true,
  },
  {
    role: 'plaintiff_attorney',
    label: 'Plaintiff Attorney',
    description: 'Advocates for the plaintiff with compelling arguments, evidence citations, and legal theories. Identifies case strengths.',
    recommended: true,
  },
  {
    role: 'defense_attorney',
    label: 'Defense Attorney',
    description: 'Defends against claims by challenging evidence, presenting defenses, and identifying weaknesses in the opposition.',
    recommended: true,
  },
  {
    role: 'court_clerk',
    label: 'Court Clerk',
    description: 'Manages procedural matters, tracks deadlines, and maintains the official record of proceedings.',
    recommended: false,
  },
  {
    role: 'law_clerk',
    label: 'Law Clerk',
    description: 'Specializes in legal research, statutory interpretation, and providing verbatim citations to relevant law.',
    recommended: false,
  },
  {
    role: 'expert_witness',
    label: 'Expert Witness',
    description: 'Provides specialized testimony and analysis within a specific domain of expertise.',
    recommended: false,
  },
  {
    role: 'mediator',
    label: 'Mediator',
    description: 'Facilitates settlement discussions by helping parties find common ground and explore creative solutions.',
    recommended: false,
  },
  {
    role: 'witness',
    label: 'Witness',
    description: 'Provides fact-based testimony from personal knowledge of events relevant to the case.',
    recommended: false,
  },
  {
    role: 'county_recorder',
    label: 'County Recorder',
    description: 'Tracks property ownership, chain of title, mineral rights, and recorded declarations.',
    recommended: false,
  },
  {
    role: 'dogm_agent',
    label: 'DOGM Agent',
    description: 'Expertise in Utah mining permits, production records, and regulatory compliance.',
    recommended: false,
  },
]

interface AgentsSetupStepProps {
  selectedRoles: AgentRole[]
  onRolesChange: (roles: AgentRole[]) => void
}

export function AgentsSetupStep({ selectedRoles, onRolesChange }: AgentsSetupStepProps) {
  const toggleRole = (role: AgentRole) => {
    if (selectedRoles.includes(role)) {
      onRolesChange(selectedRoles.filter(r => r !== role))
    } else {
      onRolesChange([...selectedRoles, role])
    }
  }

  const selectRecommended = () => {
    const recommended = AGENT_ROLES.filter(r => r.recommended).map(r => r.role)
    onRolesChange(recommended)
  }

  const selectAll = () => {
    onRolesChange(AGENT_ROLES.map(r => r.role))
  }

  const clearAll = () => {
    onRolesChange([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Choose which AI agents to activate for this case. You can change these later.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectRecommended}
            className="text-xs text-primary hover:underline"
          >
            Recommended
          </button>
          <span className="text-xs text-muted-foreground">|</span>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-primary hover:underline"
          >
            All
          </button>
          <span className="text-xs text-muted-foreground">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-primary hover:underline"
          >
            None
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {AGENT_ROLES.map((agentConfig) => {
          const Icon = ROLE_ICONS[agentConfig.role]
          const isSelected = selectedRoles.includes(agentConfig.role)

          return (
            <Card
              key={agentConfig.role}
              className={cn(
                'transition-colors cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-muted hover:border-primary/30'
              )}
              onClick={() => toggleRole(agentConfig.role)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg shrink-0',
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-medium text-sm',
                        isSelected ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {agentConfig.label}
                      </span>
                      {agentConfig.recommended && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {agentConfig.description}
                    </p>
                  </div>

                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggleRole(agentConfig.role)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
        <strong>{selectedRoles.length}</strong> agent{selectedRoles.length !== 1 ? 's' : ''} selected.
        Agents will be created with default personas that you can customize after import.
      </div>
    </div>
  )
}
