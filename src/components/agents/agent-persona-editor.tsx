'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Loader2,
  RotateCcw,
  Play,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Thermometer,
  Brain,
  Shield,
  Scale,
  Gavel,
  FileText,
  User,
  GraduationCap,
  Handshake,
  BookOpen,
  Archive,
  Mountain,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  AGENT_PERSONAS,
  getPersona,
  getDefaultSystemPrompt,
  getDefaultTemperature,
  type AgentPersona,
} from '@/lib/agents/persona-library'
import type { Agent, AgentRole } from '@/lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const MODEL_OPTIONS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
]

const TEMPERATURE_PRESETS = [
  { value: 0.1, label: 'Very Precise', description: 'Ideal for procedural/factual roles' },
  { value: 0.3, label: 'Precise', description: 'Ideal for judges and researchers' },
  { value: 0.5, label: 'Balanced', description: 'Good for attorneys and advocates' },
  { value: 0.7, label: 'Creative', description: 'Good for witnesses and mediators' },
  { value: 0.9, label: 'Very Creative', description: 'Maximum variation in responses' },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AgentPersonaEditorProps {
  /** The case ID this agent belongs to */
  caseId: string
  /** The agent being edited (null for creating a new agent) */
  agent: Agent | null
  /** Whether the editor dialog is open */
  open: boolean
  /** Called when the editor should close */
  onClose: () => void
  /** Called after successful save */
  onSaved?: (agent: Agent) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgentPersonaEditor({
  caseId,
  agent,
  open,
  onClose,
  onSaved,
}: AgentPersonaEditorProps) {
  const router = useRouter()
  const isEditing = !!agent

  // Form state
  const [role, setRole] = useState<AgentRole>(agent?.role as AgentRole || 'judge')
  const [name, setName] = useState(agent?.name || '')
  const [personaPrompt, setPersonaPrompt] = useState(agent?.persona_prompt || '')
  const [temperature, setTemperature] = useState(agent?.temperature ?? 0.5)
  const [isActive, setIsActive] = useState(agent?.is_active ?? true)
  const [model, setModel] = useState('gpt-4o')

  // UI state
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testPrompt, setTestPrompt] = useState(
    'Introduce yourself and describe your role in this case.'
  )
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)

  const promptTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Track the current persona metadata
  const currentPersona = AGENT_PERSONAS[role]

  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      setRole(agent.role as AgentRole)
      setName(agent.name)
      setPersonaPrompt(agent.persona_prompt)
      setTemperature(agent.temperature)
      setIsActive(agent.is_active)
    }
  }, [agent])

  // Track unsaved changes
  useEffect(() => {
    if (isEditing && agent) {
      const changed =
        name !== agent.name ||
        personaPrompt !== agent.persona_prompt ||
        temperature !== agent.temperature ||
        isActive !== agent.is_active
      setHasUnsavedChanges(changed)
    } else {
      setHasUnsavedChanges(name.length > 0 || personaPrompt.length > 0)
    }
  }, [name, personaPrompt, temperature, isActive, agent, isEditing])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleRoleChange = useCallback(
    (newRole: AgentRole) => {
      setRole(newRole)
      if (!isEditing) {
        const persona = getPersona(newRole)
        setName(persona.name)
        setPersonaPrompt(persona.systemPrompt)
        setTemperature(persona.temperature)
      }
    },
    [isEditing]
  )

  const handleResetToDefault = useCallback(() => {
    const defaultPrompt = getDefaultSystemPrompt(role)
    const defaultTemp = getDefaultTemperature(role)
    const persona = getPersona(role)
    setPersonaPrompt(defaultPrompt)
    setTemperature(defaultTemp)
    if (!isEditing) {
      setName(persona.name)
    }
    setTestResult(null)
    setSaveSuccess(false)
  }, [role, isEditing])

  const validate = useCallback((): boolean => {
    const errors: string[] = []
    if (!name.trim()) errors.push('Agent name is required.')
    if (name.trim().length > 100) errors.push('Agent name must be 100 characters or fewer.')
    if (!personaPrompt.trim()) errors.push('Persona prompt is required.')
    if (personaPrompt.trim().length < 10)
      errors.push('Persona prompt must be at least 10 characters.')
    if (temperature < 0 || temperature > 1) errors.push('Temperature must be between 0 and 1.')
    setValidationErrors(errors)
    return errors.length === 0
  }, [name, personaPrompt, temperature])

  const handleSave = useCallback(async () => {
    if (!validate()) return

    setSaving(true)
    setSaveSuccess(false)
    try {
      const url = isEditing
        ? `/api/cases/${caseId}/agents?agentId=${agent!.id}`
        : `/api/cases/${caseId}/agents`

      const method = isEditing ? 'PATCH' : 'POST'

      const body = isEditing
        ? { name, persona_prompt: personaPrompt, temperature, is_active: isActive }
        : { role, name, persona_prompt: personaPrompt, temperature }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const savedAgent = await response.json()
        setSaveSuccess(true)
        setHasUnsavedChanges(false)
        if (onSaved) onSaved(savedAgent)
        router.refresh()

        // Auto-close after a brief success indication
        setTimeout(() => {
          onClose()
        }, 800)
      } else {
        const err = await response.json()
        setValidationErrors([err.error || 'Failed to save agent.'])
      }
    } catch {
      setValidationErrors(['Network error. Please try again.'])
    } finally {
      setSaving(false)
    }
  }, [
    validate,
    isEditing,
    caseId,
    agent,
    role,
    name,
    personaPrompt,
    temperature,
    isActive,
    onSaved,
    onClose,
    router,
  ])

  const handleTestAgent = useCallback(async () => {
    if (!testPrompt.trim()) return

    setTesting(true)
    setTestResult(null)
    try {
      // If the agent already exists, use its ID. Otherwise, test with a temporary prompt.
      const body = agent
        ? {
            messages: [{ role: 'user', content: testPrompt }],
            agent_id: agent.id,
            case_id: caseId,
          }
        : {
            messages: [
              { role: 'system', content: personaPrompt },
              { role: 'user', content: testPrompt },
            ],
            case_id: caseId,
          }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullResponse += decoder.decode(value, { stream: true })
        }

        // Parse streaming response to extract text
        const textParts = fullResponse.match(/"delta":"([^"]*)"/g)
        const text = textParts
          ? textParts
              .map((p) => p.replace(/"delta":"/, '').replace(/"$/, ''))
              .join('')
          : fullResponse

        setTestResult(text || 'No response received.')
      } else {
        setTestResult('Error: Failed to get a response from the agent.')
      }
    } catch {
      setTestResult('Error: Network failure while testing agent.')
    } finally {
      setTesting(false)
    }
  }, [testPrompt, agent, personaPrompt, caseId])

  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(personaPrompt)
  }, [personaPrompt])

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------

  const promptWordCount = personaPrompt.trim().split(/\s+/).filter(Boolean).length
  const promptCharCount = personaPrompt.length
  const Icon = ROLE_ICONS[role] || User

  const temperatureLabel = (() => {
    if (temperature <= 0.15) return 'Very Precise'
    if (temperature <= 0.35) return 'Precise'
    if (temperature <= 0.55) return 'Balanced'
    if (temperature <= 0.75) return 'Creative'
    return 'Very Creative'
  })()

  const isPromptCustomized =
    personaPrompt !== getDefaultSystemPrompt(role)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        id="agent-persona-editor"
        className="sm:max-w-[900px] h-[85vh] flex flex-col p-0"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isEditing ? `Edit ${agent!.name}` : 'Configure Agent Persona'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modify the agent\'s persona, behavior, and model settings.'
                  : 'Select a role and customize the agent\'s persona for this case.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body with Tabs */}
        <Tabs defaultValue="persona" className="flex-1 flex flex-col overflow-hidden px-6">
          <TabsList className="w-full">
            <TabsTrigger value="persona" className="flex-1">
              <Brain className="h-4 w-4 mr-1.5" />
              Persona
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex-1">
              <Shield className="h-4 w-4 mr-1.5" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="test" className="flex-1">
              <Play className="h-4 w-4 mr-1.5" />
              Test
            </TabsTrigger>
          </TabsList>

          {/* ============================================================= */}
          {/* TAB: Persona (System Prompt, Name, Role, Temperature)         */}
          {/* ============================================================= */}
          <TabsContent value="persona" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-5 py-4">
                {/* Role Selector (only for new agents) */}
                {!isEditing && (
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select
                      value={role}
                      onValueChange={(v) => handleRoleChange(v as AgentRole)}
                    >
                      <SelectTrigger id="select-persona-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(AGENT_PERSONAS) as Array<
                            [AgentRole, AgentPersona]
                          >
                        ).map(([roleKey, persona]) => {
                          const RIcon = ROLE_ICONS[roleKey as AgentRole] || User
                          return (
                            <SelectItem key={roleKey} value={roleKey}>
                              <div className="flex items-center gap-2">
                                <RIcon className="h-4 w-4" />
                                <span>{persona.roleLabel}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {currentPersona.description}
                    </p>
                  </div>
                )}

                {/* Agent Name */}
                <div className="grid gap-2">
                  <Label htmlFor="input-persona-name">Display Name</Label>
                  <Input
                    id="input-persona-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Hon. Judge Morrison"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {name.length}/100 characters
                  </p>
                </div>

                {/* Active Toggle (only when editing) */}
                {isEditing && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label>Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Inactive agents are excluded from case analysis and simulations.
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                )}

                {/* System Prompt */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="input-persona-prompt">System Prompt</Label>
                    <div className="flex items-center gap-1">
                      {isPromptCustomized && (
                        <Badge variant="outline" className="text-xs">
                          Customized
                        </Badge>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={handleCopyPrompt}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy prompt to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => setShowPromptPreview(!showPromptPreview)}
                            >
                              {showPromptPreview ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showPromptPreview ? 'Edit prompt' : 'Preview formatted prompt'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {showPromptPreview ? (
                    <div className="rounded-md border bg-muted/50 p-4 max-h-[300px] overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {personaPrompt}
                      </pre>
                    </div>
                  ) : (
                    <Textarea
                      ref={promptTextareaRef}
                      id="input-persona-prompt"
                      value={personaPrompt}
                      onChange={(e) => setPersonaPrompt(e.target.value)}
                      rows={12}
                      className="font-mono text-sm leading-relaxed"
                      placeholder="Enter the system prompt that defines this agent's persona, knowledge, and behavioral rules..."
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {promptWordCount.toLocaleString()} words | {promptCharCount.toLocaleString()} characters
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetToDefault}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset to Default
                    </Button>
                  </div>
                </div>

                {/* Temperature */}
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Thermometer className="h-4 w-4" />
                      Temperature: {temperature.toFixed(1)}
                    </Label>
                    <Badge variant="secondary" className="text-xs">
                      {temperatureLabel}
                    </Badge>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(v) => setTemperature(v[0])}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise (0.0)</span>
                    <span>Balanced (0.5)</span>
                    <span>Creative (1.0)</span>
                  </div>

                  {/* Temperature Presets */}
                  <div className="flex gap-1.5 flex-wrap">
                    {TEMPERATURE_PRESETS.map((preset) => (
                      <TooltipProvider key={preset.value}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={
                                Math.abs(temperature - preset.value) < 0.05
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setTemperature(preset.value)}
                            >
                              {preset.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{preset.description}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>

                  {/* Temperature recommendation */}
                  {Math.abs(temperature - currentPersona.temperature) > 0.3 && (
                    <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-xs">
                        The recommended temperature for the{' '}
                        <strong>{currentPersona.roleLabel}</strong> role is{' '}
                        <strong>{currentPersona.temperature}</strong>. The current
                        setting of <strong>{temperature}</strong> may produce less
                        reliable outputs for this role.
                      </p>
                    </div>
                  )}
                </div>

                {/* Model Selector */}
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Recommended: {currentPersona.suggestedModel}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ============================================================= */}
          {/* TAB: Behavior (Knowledge domains, rules, interaction style)   */}
          {/* ============================================================= */}
          <TabsContent value="behavior" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-5 py-4">
                {/* Behavioral Rules */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Behavioral Constraints
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Hard rules this agent must never violate.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {currentPersona.behavioralRules.constraints.map(
                        (rule, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-0.5 shrink-0 text-xs font-bold">
                              !!
                            </span>
                            {rule}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                {/* Communication Style */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Communication Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {currentPersona.behavioralRules.communicationStyle}
                    </p>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium">Formality:</span>{' '}
                        <Badge variant="outline" className="text-xs">
                          {currentPersona.interactionStyle.formality.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Response Length:</span>{' '}
                        <Badge variant="outline" className="text-xs">
                          {currentPersona.interactionStyle.responseLength}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Cites Authority:</span>{' '}
                        <Badge
                          variant={
                            currentPersona.interactionStyle.citesAuthority
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {currentPersona.interactionStyle.citesAuthority
                            ? 'Yes'
                            : 'No'}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Asks Questions:</span>{' '}
                        <Badge
                          variant={
                            currentPersona.interactionStyle.asksQuestions
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {currentPersona.interactionStyle.asksQuestions
                            ? 'Yes'
                            : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Knowledge Domains */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Knowledge Domains
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Areas of expertise for the {currentPersona.roleLabel} role.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium mb-1.5">Primary Expertise:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPersona.knowledgeDomains.primary.map(
                          (domain, i) => (
                            <Badge key={i} variant="default" className="text-xs">
                              {domain}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1.5">Secondary Expertise:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentPersona.knowledgeDomains.secondary.map(
                          (domain, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {domain}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Jurisdiction:</p>
                      <p className="text-sm text-muted-foreground">
                        {currentPersona.knowledgeDomains.jurisdiction}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision Framework */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Decision-Making Framework
                    </CardTitle>
                    <CardDescription className="text-xs">
                      The ordered steps this agent follows when making decisions or forming opinions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {currentPersona.decisionFramework.steps.map(
                        (step, i) => (
                          <li key={i} className="text-sm">
                            {step}
                          </li>
                        )
                      )}
                    </ol>
                    {currentPersona.decisionFramework.standardOfReview && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <p className="text-xs font-medium">Standard of Review:</p>
                          <p className="text-sm text-muted-foreground">
                            {currentPersona.decisionFramework.standardOfReview}
                          </p>
                        </div>
                      </>
                    )}
                    {currentPersona.decisionFramework.burdenOfProof && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Burden of Proof:</p>
                        <p className="text-sm text-muted-foreground">
                          {currentPersona.decisionFramework.burdenOfProof}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Uncertainty Protocol */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Uncertainty Protocol
                    </CardTitle>
                    <CardDescription className="text-xs">
                      How this agent handles gaps in knowledge or ambiguous situations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{currentPersona.behavioralRules.uncertaintyProtocol}&quot;
                    </p>
                  </CardContent>
                </Card>

                {/* Tags */}
                <div>
                  <p className="text-xs font-medium mb-1.5">Role Tags:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {currentPersona.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ============================================================= */}
          {/* TAB: Test (Send test prompt and see agent response)           */}
          {/* ============================================================= */}
          <TabsContent value="test" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs">
                    Send a test prompt to see how this agent responds with the current
                    persona configuration. {!agent && 'Save the agent first for the most accurate test using full case context.'}
                  </p>
                </div>

                {/* Test Prompt */}
                <div className="grid gap-2">
                  <Label htmlFor="input-test-prompt">Test Prompt</Label>
                  <Textarea
                    id="input-test-prompt"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    rows={3}
                    placeholder="Enter a message to send to the agent..."
                  />
                  {/* Quick prompts */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      'Introduce yourself and describe your role in this case.',
                      'What is your assessment of the key legal issues?',
                      'How would you handle an objection to hearsay testimony?',
                      'What are the strongest arguments for your position?',
                      'Explain the applicable standard of review.',
                    ].map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={() => setTestPrompt(prompt)}
                      >
                        {prompt.length > 50
                          ? prompt.substring(0, 47) + '...'
                          : prompt}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleTestAgent}
                  disabled={testing || !testPrompt.trim()}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing Agent...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Agent Response
                    </>
                  )}
                </Button>

                {/* Test Result */}
                {testResult && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        {name || currentPersona.roleLabel} responds:
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-[300px] overflow-y-auto">
                        {testResult}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-3 space-y-1">
              {validationErrors.map((err, i) => (
                <p
                  key={i}
                  className={`text-xs flex items-center gap-1.5 ${
                    err.startsWith('Warning:')
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Success message */}
          {saveSuccess && (
            <div className="mb-3 flex items-center gap-1.5 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <p className="text-xs font-medium">Agent saved successfully.</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            {hasUnsavedChanges && (
              <p className="text-xs text-amber-600 mr-auto flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Unsaved changes
              </p>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="btn-save-persona"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Create Agent'}
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
