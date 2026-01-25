'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, User, Gavel, Scale, Shield, FileText, GraduationCap, Handshake, Loader2, BookOpen, Archive, Mountain } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Agent, AgentRole, Message as StoredMessage } from '@/lib/types'

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

const ROLE_COLORS: Record<AgentRole, string> = {
  judge: 'bg-red-600',
  plaintiff_attorney: 'bg-blue-600',
  defense_attorney: 'bg-green-600',
  court_clerk: 'bg-gray-600',
  witness: 'bg-purple-600',
  expert_witness: 'bg-orange-600',
  mediator: 'bg-teal-600',
  law_clerk: 'bg-amber-600',
  county_recorder: 'bg-indigo-600',
  dogm_agent: 'bg-lime-600',
}

interface ChatInterfaceProps {
  caseId: string
  conversationId: string
  agents: Agent[]
  initialMessages: StoredMessage[]
}

// Get text content from message parts
function getMessageContent(message: { content?: string; parts?: Array<{ type: string; text?: string }> }): string {
  if (message.content) return message.content
  if (message.parts) {
    return message.parts
      .filter((part): part is { type: string; text: string } => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('')
  }
  return ''
}

export function ChatInterface({
  caseId,
  conversationId,
  agents,
  initialMessages,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '')
  const [inputValue, setInputValue] = useState('')

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    body: {
      conversation_id: conversationId,
      case_id: caseId,
      agent_id: selectedAgentId,
    },
  }), [conversationId, caseId, selectedAgentId])

  const {
    messages,
    sendMessage,
    status,
  } = useChat({
    transport,
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: m.content }],
    })),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const text = inputValue
    setInputValue('')
    await sendMessage({ text })
  }

  if (agents.length === 0) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No active agents</h3>
          <p className="text-muted-foreground">
            Activate at least one agent to start chatting.
          </p>
        </CardContent>
      </Card>
    )
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <Card id="chat-interface-container" className="h-[calc(100vh-200px)] flex flex-col">
      {/* Agent Selector */}
      <div id="chat-agent-selector" className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Responding Agent:</span>
          <Select
            value={selectedAgentId}
            onValueChange={setSelectedAgentId}
          >
            <SelectTrigger id="select-responding-agent" className="w-64">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => {
                const Icon = ROLE_ICONS[agent.role as AgentRole] || User
                return (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea id="chat-messages-container" className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Start the conversation by sending a message.</p>
              <p className="text-sm mt-2">
                The selected agent will respond based on case context and documents.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user'
            const agent = !isUser ? selectedAgent : null
            const Icon = agent ? (ROLE_ICONS[agent.role as AgentRole] || User) : User
            const bgColor = agent ? ROLE_COLORS[agent.role as AgentRole] : 'bg-primary'
            const content = getMessageContent(message)

            return (
              <div
                key={message.id}
                id={`chat-message-${message.id}`}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className={isUser ? 'bg-secondary' : bgColor}>
                  <AvatarFallback className="text-white">
                    {isUser ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className={`max-w-[70%] ${isUser ? 'text-right' : ''}`}>
                  {!isUser && agent && (
                    <p className="text-xs font-medium text-primary mb-1">
                      {agent.name}
                    </p>
                  )}
                  <Card
                    className={`inline-block ${
                      isUser
                        ? 'bg-secondary/10 border-secondary/30'
                        : 'bg-white'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div id="chat-loading-indicator" className="flex gap-3">
              <Avatar className={selectedAgent ? ROLE_COLORS[selectedAgent.role as AgentRole] : 'bg-primary'}>
                <AvatarFallback className="text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        id="chat-input-form"
        onSubmit={handleSubmit}
        className="p-4 border-t bg-white flex-shrink-0"
      >
        <div className="flex gap-2">
          <Textarea
            id="chat-message-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="min-h-[60px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            id="btn-send-message"
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </Card>
  )
}
