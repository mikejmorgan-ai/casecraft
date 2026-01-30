'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Play, Square, Volume2, VolumeX, Loader2, Gavel, Scale, Shield, FileText, User, GraduationCap, Handshake, Download, BookOpen, Archive, Mountain, FileDown } from 'lucide-react'
import type { Agent, AgentRole } from '@/lib/types'
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts'
import { generateTranscriptPDF } from '@/lib/pdf/transcript-pdf'

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

interface HearingTurn {
  role: AgentRole
  agentId: string
  agentName: string
  content: string
  phase: string
  timestamp: string
}

interface HearingRunnerProps {
  caseId: string
  conversationId: string
  agents: Agent[]
  caseName?: string
  caseNumber?: string
  jurisdiction?: string
  plaintiffName?: string
  defendantName?: string
}

export function HearingRunner({
  caseId,
  conversationId,
  agents,
  caseName = 'Mock Legal Case',
  caseNumber,
  jurisdiction,
  plaintiffName,
  defendantName,
}: HearingRunnerProps) {
  const [hearingType, setHearingType] = useState('motion_hearing')
  const [isRunning, setIsRunning] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [transcript, setTranscript] = useState<HearingTurn[]>([])
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  const playAudio = useCallback(async (text: string, agentRole: AgentRole): Promise<void> => {
    if (!voiceEnabled) return

    try {
      // Use up to 4000 chars for TTS (OpenAI limit is 4096)
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 4000), agentRole }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        if (audioRef.current) {
          audioRef.current.pause()
        }

        audioRef.current = new Audio(audioUrl)

        // Wait for audio to finish playing before returning
        await new Promise<void>((resolve, reject) => {
          if (!audioRef.current) {
            resolve()
            return
          }
          audioRef.current.onended = () => resolve()
          audioRef.current.onerror = () => reject(new Error('Audio playback failed'))
          audioRef.current.play().catch(reject)
        })
      }
    } catch (err) {
      console.error('Audio playback error:', err)
    }
  }, [voiceEnabled])

  const startHearing = useCallback(async () => {
    setIsRunning(true)
    setTranscript([])
    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/hearing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          conversation_id: conversationId,
          hearing_type: hearingType,
          max_turns: 30,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to start hearing')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))

        for (const line of lines) {
          const data = JSON.parse(line.slice(6))

          if (data.type === 'complete') {
            setIsRunning(false)
            setCurrentSpeaker(null)
            break
          }

          const turn = data as HearingTurn
          setTranscript((prev) => [...prev, turn])
          setCurrentSpeaker(turn.agentName)

          // Play audio for this turn
          await playAudio(turn.content, turn.role)
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Hearing error:', err)
      }
    } finally {
      setIsRunning(false)
      setCurrentSpeaker(null)
    }
  }, [caseId, conversationId, hearingType, playAudio])

  const stopHearing = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsRunning(false)
    setCurrentSpeaker(null)
  }, [])

  const downloadTranscript = () => {
    if (transcript.length === 0) return

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    let content = `MOCK HEARING TRANSCRIPT\n`
    content += `${'='.repeat(60)}\n\n`
    content += `Case: Tree Farm LLC v. Salt Lake County\n`
    content += `Case No: 220902840\n`
    content += `Hearing Type: ${hearingType.replace('_', ' ').toUpperCase()}\n`
    content += `Date: ${dateStr}\n`
    content += `Time: ${timeStr}\n\n`
    content += `${'='.repeat(60)}\n\n`
    content += `APPEARANCES:\n\n`

    const speakers = [...new Set(transcript.map(t => t.agentName))]
    speakers.forEach(name => {
      const turn = transcript.find(t => t.agentName === name)
      if (turn) {
        content += `  ${name} - ${turn.role.replace('_', ' ')}\n`
      }
    })

    content += `\n${'='.repeat(60)}\n\n`
    content += `PROCEEDINGS:\n\n`

    transcript.forEach((turn, i) => {
      const time = new Date(turn.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      content += `[${time}] ${turn.agentName.toUpperCase()} (${turn.phase.replace('_', ' ')}):\n\n`
      content += `${turn.content}\n\n`
      content += `${'-'.repeat(40)}\n\n`
    })

    content += `${'='.repeat(60)}\n`
    content += `END OF TRANSCRIPT\n`
    content += `Generated by CaseCraft AI Legal Simulation Platform\n`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hearing-transcript-${now.toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPDF = useCallback(() => {
    if (transcript.length === 0) return

    generateTranscriptPDF({
      caseName,
      caseNumber,
      hearingType,
      transcript,
      jurisdiction,
      plaintiffName,
      defendantName,
    })
  }, [transcript, caseName, caseNumber, hearingType, jurisdiction, plaintiffName, defendantName])

  // Toggle hearing start/stop
  const toggleHearing = useCallback(() => {
    if (isRunning) {
      stopHearing()
    } else {
      startHearing()
    }
  }, [isRunning, stopHearing, startHearing])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setVoiceEnabled(prev => !prev)
  }, [])

  // Keyboard shortcuts for hearing
  const hearingShortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      key: ' ',
      action: toggleHearing,
      description: 'Start/Stop hearing',
      category: 'hearing',
    },
    {
      key: 'm',
      action: toggleMute,
      description: 'Toggle mute',
      category: 'hearing',
    },
    {
      key: 'd',
      action: () => {
        if (transcript.length > 0 && !isRunning) {
          downloadTranscript()
        }
      },
      description: 'Download transcript',
      category: 'hearing',
    },
    {
      key: 'p',
      action: () => {
        if (transcript.length > 0 && !isRunning) {
          downloadPDF()
        }
      },
      description: 'Download PDF',
      category: 'hearing',
    },
  ], [toggleHearing, toggleMute, transcript.length, isRunning, downloadPDF])

  useKeyboardShortcuts({ shortcuts: hearingShortcuts })

  if (agents.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            At least 2 active agents required to run a hearing.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="hearing-runner-container" className="h-[calc(100vh-280px)] sm:h-[calc(100vh-200px)] flex flex-col">
      <CardHeader id="hearing-controls" className="flex-shrink-0 border-b p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gavel className="h-5 w-5" />
            Mock Hearing
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={hearingType} onValueChange={setHearingType} disabled={isRunning}>
              <SelectTrigger id="select-hearing-type" className="w-full sm:w-48 h-11 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motion_hearing">Motion Hearing</SelectItem>
                <SelectItem value="preliminary_hearing">Preliminary Hearing</SelectItem>
                <SelectItem value="full_trial">Full Trial</SelectItem>
                <SelectItem value="settlement_conference">Settlement Conference</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                id="btn-toggle-voice"
                variant="outline"
                size="icon"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={`${voiceEnabled ? 'Mute' : 'Unmute'} (M)`}
                className="h-11 w-11 sm:h-10 sm:w-10"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              {isRunning ? (
                <Button id="btn-stop-hearing" variant="destructive" onClick={stopHearing} title="Stop hearing (Space)" className="flex-1 sm:flex-none h-11 sm:h-10">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button id="btn-start-hearing" onClick={startHearing} title="Start hearing (Space)" className="flex-1 sm:flex-none h-11 sm:h-10">
                  <Play className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Start </span>Hearing
                </Button>
              )}
            </div>

            {transcript.length > 0 && !isRunning && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button id="btn-download-transcript" variant="outline" onClick={downloadTranscript} title="Download transcript (D)" className="flex-1 sm:flex-none h-11 sm:h-10">
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Transcript</span>
                </Button>
                <Button id="btn-download-pdf" variant="outline" onClick={downloadPDF} title="Download PDF (P)" className="flex-1 sm:flex-none h-11 sm:h-10">
                  <FileDown className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {currentSpeaker && (
          <div className="flex items-center gap-2 mt-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {currentSpeaker} is speaking...
            </span>
          </div>
        )}
      </CardHeader>

      <ScrollArea id="hearing-transcript" className="flex-1 p-3 sm:p-4" ref={scrollRef}>
        <div className="space-y-4">
          {transcript.length === 0 && !isRunning && (
            <div className="text-center py-12 text-muted-foreground">
              <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a hearing type and click &quot;Start Hearing&quot;</p>
              <p className="text-sm mt-2">
                Agents will conduct the proceedings automatically.
              </p>
            </div>
          )}

          {transcript.map((turn, i) => {
            const Icon = ROLE_ICONS[turn.role] || User
            const bgColor = ROLE_COLORS[turn.role] || 'bg-gray-600'

            return (
              <div key={i} id={`hearing-turn-${i}`} className="flex gap-2 sm:gap-3">
                <Avatar className={`${bgColor} h-8 w-8 sm:h-10 sm:w-10 shrink-0`}>
                  <AvatarFallback className="text-white">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                    <span className="font-medium text-xs sm:text-sm">{turn.agentName}</span>
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {turn.phase.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Card className="bg-white">
                    <CardContent className="p-2 sm:p-3">
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{turn.content}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })}

          {isRunning && transcript.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
