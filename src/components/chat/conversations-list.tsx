'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Plus, MessageSquare, Loader2, Trash2, ArrowRight } from 'lucide-react'
import type { Conversation, ConversationType, Agent } from '@/lib/types'

const CONV_TYPE_LABELS: Record<ConversationType, string> = {
  hearing: 'Hearing',
  deposition: 'Deposition',
  mediation: 'Mediation',
  strategy_session: 'Strategy Session',
  research: 'Research',
  general: 'General',
}

const CONV_TYPE_COLORS: Record<ConversationType, string> = {
  hearing: 'bg-red-100 text-red-800',
  deposition: 'bg-orange-100 text-orange-800',
  mediation: 'bg-green-100 text-green-800',
  strategy_session: 'bg-blue-100 text-blue-800',
  research: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800',
}

interface ConversationsListProps {
  caseId: string
  conversations: Conversation[]
  agents: Agent[]
}

export function ConversationsList({ caseId, conversations, agents }: ConversationsListProps) {
  const router = useRouter()

  const handleDelete = async (convId: string) => {
    if (!confirm('Delete this conversation? All messages will be lost.')) return

    await fetch(`/api/cases/${caseId}/conversations?convId=${convId}`, {
      method: 'DELETE',
    })
    router.refresh()
  }

  return (
    <div id="conversations-list-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Conversations</h2>
          <p className="text-muted-foreground text-sm">Simulated proceedings and discussions</p>
        </div>
        <NewConversationDialog caseId={caseId} agents={agents} />
      </div>

      <div className="grid gap-4">
        {conversations.map((conv) => (
          <Card key={conv.id} id={`conversation-card-${conv.id}`} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{conv.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={CONV_TYPE_COLORS[conv.conversation_type as ConversationType]}>
                        {CONV_TYPE_LABELS[conv.conversation_type as ConversationType]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/case/${caseId}/conversation/${conv.id}`}>
                    <Button>
                      Open
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(conv.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {conversations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a new conversation to simulate legal proceedings.
            </p>
            <NewConversationDialog caseId={caseId} agents={agents} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function NewConversationDialog({ caseId, agents }: { caseId: string; agents: Agent[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [convType, setConvType] = useState<ConversationType>('general')
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          conversation_type: convType,
          participants: agents.filter(a => a.is_active).map(a => a.id),
        }),
      })

      if (response.ok) {
        const conv = await response.json()
        setOpen(false)
        router.push(`/case/${caseId}/conversation/${conv.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="btn-new-conversation">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent id="new-conversation-dialog" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Create a new simulation session with case agents.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="input-conv-name">Conversation Name *</Label>
            <Input
              id="input-conv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Motion Hearing - Jan 15"
            />
          </div>

          <div className="grid gap-2">
            <Label>Conversation Type</Label>
            <Select value={convType} onValueChange={(v) => setConvType(v as ConversationType)}>
              <SelectTrigger id="select-conv-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONV_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {agents.filter(a => a.is_active).length} active agents will participate.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button id="btn-start-conversation" onClick={handleSubmit} disabled={loading || !name}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Conversation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
