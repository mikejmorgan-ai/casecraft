'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Gavel, Scale, Shield, FileText, User, GraduationCap, Handshake, Loader2, Pencil, BookOpen, Archive, Mountain, MessageCircle, Play, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { AGENT_ROLE_TEMPLATES, AGENT_ROLE_LABELS } from '@/lib/ai/prompts'
import type { Agent, AgentRole } from '@/lib/types'

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

interface AgentsListProps {
  caseId: string
  agents: Agent[]
}

export function AgentsList({ caseId, agents }: AgentsListProps) {
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [chattingAgent, setChattingAgent] = useState<Agent | null>(null)
  const [runningAnalysis, setRunningAnalysis] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{ agent: string; response: string }[]>([])
  const router = useRouter()

  const runCaseAnalysis = async () => {
    setRunningAnalysis(true)
    setAnalysisResults([])

    const activeAgents = agents.filter(a => a.is_active)
    const analysisPrompt = "Analyze this case based on the facts and documents. Provide your professional assessment, key observations, and recommended next steps from your role's perspective."

    for (const agent of activeAgents) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: analysisPrompt }],
            agent_id: agent.id,
            case_id: caseId,
          }),
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
            ? textParts.map(p => p.replace(/"delta":"/, '').replace(/"$/, '')).join('')
            : fullResponse

          setAnalysisResults(prev => [...prev, { agent: agent.name, response: text }])
        }
      } catch (err) {
        console.error(`Analysis failed for ${agent.name}:`, err)
      }
    }

    setRunningAnalysis(false)
  }

  return (
    <div id="agents-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Case Agents</h2>
          <p className="text-muted-foreground text-sm">Configure AI agents for this case</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={runCaseAnalysis}
            disabled={runningAnalysis || agents.filter(a => a.is_active).length === 0}
          >
            {runningAnalysis ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Run Case Analysis</>
            )}
          </Button>
          <AddAgentDialog caseId={caseId} />
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Case Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResults.map((result, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">{result.agent}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.response}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const Icon = ROLE_ICONS[agent.role as AgentRole] || User
          return (
            <Card key={agent.id} id={`agent-card-${agent.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <CardDescription>{AGENT_ROLE_LABELS[agent.role as AgentRole]}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {agent.persona_prompt.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Temperature: {agent.temperature}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setChattingAgent(agent)}
                      title="Chat with agent"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAgent(agent)}
                      title="Edit agent"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {agents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents configured</h3>
            <p className="text-muted-foreground mb-4">
              Add agents to participate in case simulations.
            </p>
            <AddAgentDialog caseId={caseId} />
          </CardContent>
        </Card>
      )}

      {editingAgent && (
        <EditAgentDialog
          caseId={caseId}
          agent={editingAgent}
          open={!!editingAgent}
          onClose={() => {
            setEditingAgent(null)
            router.refresh()
          }}
        />
      )}

      {chattingAgent && (
        <QuickChatDialog
          caseId={caseId}
          agent={chattingAgent}
          open={!!chattingAgent}
          onClose={() => setChattingAgent(null)}
        />
      )}
    </div>
  )
}

function AddAgentDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<AgentRole>('witness')
  const [name, setName] = useState('')
  const [personaPrompt, setPersonaPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const router = useRouter()

  const handleRoleChange = (newRole: AgentRole) => {
    setRole(newRole)
    const template = AGENT_ROLE_TEMPLATES[newRole]
    setName(template.defaultName)
    setPersonaPrompt(template.defaultPrompt)
    setTemperature(template.defaultTemperature)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name,
          persona_prompt: personaPrompt,
          temperature,
        }),
      })

      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="btn-add-agent">
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent id="add-agent-dialog" className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Create an AI agent to participate in case simulations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => handleRoleChange(v as AgentRole)}>
              <SelectTrigger id="select-agent-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGENT_ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input-agent-name">Name</Label>
            <Input
              id="input-agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Judge Morrison"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input-agent-persona">Persona Instructions</Label>
            <Textarea
              id="input-agent-persona"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              rows={6}
              placeholder="Describe how this agent should behave..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Temperature: {temperature}</Label>
            <Slider
              value={[temperature]}
              onValueChange={(v) => setTemperature(v[0])}
              min={0}
              max={2}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Lower = more focused, Higher = more creative
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button id="btn-submit-agent" onClick={handleSubmit} disabled={loading || !name || !personaPrompt}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditAgentDialog({
  caseId,
  agent,
  open,
  onClose,
}: {
  caseId: string
  agent: Agent
  open: boolean
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(agent.name)
  const [personaPrompt, setPersonaPrompt] = useState(agent.persona_prompt)
  const [temperature, setTemperature] = useState(agent.temperature)
  const [isActive, setIsActive] = useState(agent.is_active)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/agents?agentId=${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          persona_prompt: personaPrompt,
          temperature,
          is_active: isActive,
        }),
      })

      if (response.ok) {
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent id="edit-agent-dialog" className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Modify {agent.name}&apos;s configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input-edit-agent-name">Name</Label>
            <Input
              id="input-edit-agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input-edit-agent-persona">Persona Instructions</Label>
            <Textarea
              id="input-edit-agent-persona"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid gap-2">
            <Label>Temperature: {temperature}</Label>
            <Slider
              value={[temperature]}
              onValueChange={(v) => setTemperature(v[0])}
              min={0}
              max={2}
              step={0.1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button id="btn-save-agent" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuickChatDialog({
  caseId,
  agent,
  open,
  onClose,
}: {
  caseId: string
  agent: Agent
  open: boolean
  onClose: () => void
}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const audioRef = useState<HTMLAudioElement | null>(null)
  const Icon = ROLE_ICONS[agent.role as AgentRole] || User

  const playVoice = async (text: string, index: number) => {
    if (playingIndex === index) {
      // Stop current playback
      if (audioRef[0]) {
        audioRef[0].pause()
        audioRef[0] = null
      }
      setPlayingIndex(null)
      return
    }

    setPlayingIndex(index)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.substring(0, 1000), // Limit text length
          agentRole: agent.role,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audioRef[0] = audio

        audio.onended = () => {
          setPlayingIndex(null)
          URL.revokeObjectURL(audioUrl)
        }

        audio.play()
      }
    } catch (err) {
      console.error('Voice playback error:', err)
      setPlayingIndex(null)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = message.trim()
    setMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          agent_id: agent.id,
          case_id: caseId,
        }),
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

        // Parse streaming response
        const textParts = fullResponse.match(/"delta":"([^"]*)"/g)
        const text = textParts
          ? textParts.map(p => p.replace(/"delta":"/, '').replace(/"$/, '')).join('')
          : fullResponse

        const newMessages = [...messages, { role: 'user', content: userMessage }, { role: 'assistant', content: text }]
        setMessages(newMessages)

        // Auto-play voice if enabled
        if (voiceEnabled && text) {
          setTimeout(() => playVoice(text, newMessages.length - 1), 100)
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get response' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent id="quick-chat-dialog" className="sm:max-w-[700px] h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              Chat with {agent.name}
            </DialogTitle>
            <Button
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
          <DialogDescription>
            {AGENT_ROLE_LABELS[agent.role as AgentRole]} {voiceEnabled && '• Voice enabled'}
          </DialogDescription>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm">
              Start a conversation with {agent.name}
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-white border mr-8'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 px-2"
                  onClick={() => playVoice(msg.content, i)}
                >
                  {playingIndex === i ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Playing...</>
                  ) : (
                    <><Volume2 className="h-3 w-3 mr-1" /> Play</>
                  )}
                </Button>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{agent.name} is thinking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ask ${agent.name} a question...`}
            rows={2}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <Button onClick={sendMessage} disabled={loading || !message.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
