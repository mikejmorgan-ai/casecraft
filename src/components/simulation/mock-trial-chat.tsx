'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Gavel,
  Scale,
  User,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  role: string
  name: string
  temperature: number
}

interface Message {
  id: string
  role: 'judge' | 'plaintiff_attorney' | 'defense_attorney' | 'system'
  speaker: string
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface MockTrialChatProps {
  caseId: string
  caseName: string
  agents: Agent[]
  plaintiffName?: string
  defendantName?: string
}

const roleConfig = {
  judge: {
    icon: Gavel,
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    bgLight: 'bg-purple-500/10',
    label: 'Judge',
  },
  plaintiff_attorney: {
    icon: User,
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgLight: 'bg-blue-500/10',
    label: 'Plaintiff',
  },
  defense_attorney: {
    icon: User,
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    bgLight: 'bg-amber-500/10',
    label: 'Defense',
  },
  system: {
    icon: Scale,
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    bgLight: 'bg-gray-500/10',
    label: 'System',
  },
}

export function MockTrialChat({
  caseId,
  caseName,
  agents,
  plaintiffName,
  defendantName,
}: MockTrialChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
    }])
  }

  const startSimulation = async () => {
    // PAYMENT GATEKEEPER - Verify subscription/credits before starting any agents
    try {
      const paymentStatus = await fetch('/api/payment-status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const { hasAccess, reason } = await paymentStatus.json()

      if (!hasAccess) {
        // Redirect to pricing if payment required
        window.location.href = `/pricing?reason=${encodeURIComponent(reason || 'Payment required')}`
        return
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      addMessage({
        role: 'system',
        speaker: 'System',
        content: 'Unable to verify subscription status. Please try again or contact support.',
      })
      return
    }

    setIsRunning(true)
    setIsPaused(false)
    setMessages([])
    setCurrentTurn(0)

    // Opening message
    addMessage({
      role: 'system',
      speaker: 'Court',
      content: `Mock hearing simulation for ${caseName}. ${plaintiffName || 'Plaintiff'} v. ${defendantName || 'Defendant'}. All rise.`,
    })

    await new Promise(r => setTimeout(r, 1500))

    // Run the hearing
    abortRef.current = new AbortController()
    
    try {
      const response = await fetch(`/api/hearing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          mode: 'full_hearing',
          maxTurns: 12,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error('Hearing failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'message') {
                // Add typing indicator
                const typingId = Math.random().toString(36).slice(2)
                setMessages(prev => [...prev, {
                  id: typingId,
                  role: data.role,
                  speaker: data.speaker,
                  content: '',
                  timestamp: new Date(),
                  isTyping: true,
                }])

                // Simulate typing delay
                await new Promise(r => setTimeout(r, 500 + Math.random() * 1000))

                // Replace with actual message
                setMessages(prev => prev.map(m =>
                  m.id === typingId
                    ? { ...m, content: data.content, isTyping: false }
                    : m
                ))

                setCurrentTurn(data.turn || currentTurn + 1)

                // Pause check
                while (isPaused && isRunning) {
                  await new Promise(r => setTimeout(r, 100))
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Closing
      addMessage({
        role: 'system',
        speaker: 'Court',
        content: 'The hearing has concluded. Court is adjourned.',
      })

    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Simulation error:', err)
        addMessage({
          role: 'system',
          speaker: 'System',
          content: 'Simulation encountered an error.',
        })
      }
    }

    setIsRunning(false)
    setIsPaused(false)
  }

  const stopSimulation = () => {
    abortRef.current?.abort()
    setIsRunning(false)
    setIsPaused(false)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const skipTurn = () => {
    // Signal to skip current turn (would need backend support)
  }

  const reset = () => {
    stopSimulation()
    setMessages([])
    setCurrentTurn(0)
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <CardHeader className="shrink-0 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gavel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Mock Trial Simulation</CardTitle>
              <p className="text-xs text-muted-foreground">
                {caseName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Turn {currentTurn}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-4 mt-3">
          {agents.slice(0, 3).map(agent => {
            const config = roleConfig[agent.role as keyof typeof roleConfig] || roleConfig.system
            return (
              <div key={agent.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={cn(config.color, 'text-white text-xs')}>
                    {agent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Start the simulation to begin the mock trial</p>
            </div>
          ) : (
            messages.map(msg => {
              const config = roleConfig[msg.role] || roleConfig.system
              const Icon = config.icon
              const isLeft = msg.role === 'plaintiff_attorney' || msg.role === 'system'

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    !isLeft && msg.role !== 'judge' && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={cn(config.color, 'text-white')}>
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className={cn(
                    'flex-1 max-w-[80%]',
                    !isLeft && msg.role !== 'judge' && 'flex flex-col items-end'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-sm font-medium', config.textColor)}>
                        {msg.speaker}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className={cn(
                      'rounded-2xl px-4 py-2.5',
                      msg.role === 'judge' ? 'bg-purple-500/10 border border-purple-500/20' :
                      msg.role === 'system' ? 'bg-muted' :
                      config.bgLight
                    )}>
                      {msg.isTyping ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Controls */}
      <div className="shrink-0 p-4 border-t bg-muted/30">
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <Button onClick={startSimulation} className="gap-2 px-6">
              <Play className="h-4 w-4" />
              Start Simulation
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePause}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={skipTurn}
                disabled
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                onClick={stopSimulation}
                className="gap-2"
              >
                Stop
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            disabled={isRunning && !isPaused}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {isRunning && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            {isPaused ? 'Paused' : 'Simulation in progress...'}
          </p>
        )}
      </div>
    </Card>
  )
}
