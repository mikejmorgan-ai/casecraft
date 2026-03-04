'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Gavel,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  date: string
  title: string
  description?: string
  type: 'filing' | 'hearing' | 'ruling' | 'deadline' | 'milestone'
  status?: 'pending' | 'complete' | 'missed'
  documentId?: string
  important?: boolean
}

interface CaseTimelineProps {
  events: TimelineEvent[]
  onEventClick?: (event: TimelineEvent) => void
  onAddEvent?: () => void
}

const typeConfig = {
  filing: {
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    label: 'Filing',
  },
  hearing: {
    icon: Gavel,
    color: 'text-purple-500',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    label: 'Hearing',
  },
  ruling: {
    icon: Gavel,
    color: 'text-amber-500',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    label: 'Ruling',
  },
  deadline: {
    icon: Clock,
    color: 'text-red-500',
    bg: 'bg-red-500',
    bgLight: 'bg-red-500/10',
    label: 'Deadline',
  },
  milestone: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500',
    bgLight: 'bg-green-500/10',
    label: 'Milestone',
  },
}

const statusIcons = {
  pending: Clock,
  complete: CheckCircle,
  missed: XCircle,
}

export function CaseTimeline({ events, onEventClick, onAddEvent }: CaseTimelineProps) {
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const filteredEvents = filter
    ? sortedEvents.filter(e => e.type === filter)
    : sortedEvents

  const today = new Date()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Timeline</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {events.length} events
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {onAddEvent && (
              <Button variant="ghost" size="sm" onClick={onAddEvent}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Button
            variant={filter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(null)}
            className="h-7 text-xs"
          >
            All
          </Button>
          {Object.entries(typeConfig).map(([type, config]) => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className={cn('h-7 text-xs', filter !== type && config.color)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No events in timeline</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

              {/* Events */}
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const config = typeConfig[event.type]
                  const Icon = config.icon
                  const isPast = new Date(event.date) < today
                  const isToday = new Date(event.date).toDateString() === today.toDateString()
                  const StatusIcon = event.status ? statusIcons[event.status] : null

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'relative pl-10 group',
                        onEventClick && 'cursor-pointer'
                      )}
                      onClick={() => onEventClick?.(event)}
                    >
                      {/* Dot */}
                      <div className={cn(
                        'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center',
                        'border-2 border-background z-10',
                        config.bg,
                        !isPast && !isToday && 'opacity-60'
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>

                      {/* Today marker */}
                      {isToday && (
                        <div className="absolute left-[30px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary animate-pulse" />
                      )}

                      {/* Content */}
                      <div className={cn(
                        'p-3 rounded-lg border transition-colors',
                        onEventClick && 'group-hover:border-primary/50 group-hover:bg-muted/50',
                        event.important && 'border-amber-500/30 bg-amber-500/5'
                      )}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {isToday && (
                                <Badge variant="default" className="text-xs">Today</Badge>
                              )}
                              {event.important && (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <h4 className="font-medium mt-1">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {StatusIcon && (
                              <StatusIcon className={cn(
                                'h-4 w-4',
                                event.status === 'complete' && 'text-green-500',
                                event.status === 'missed' && 'text-red-500',
                                event.status === 'pending' && 'text-muted-foreground'
                              )} />
                            )}
                            <Badge variant="outline" className={cn('text-xs', config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Compact horizontal timeline for headers
export function CompactTimeline({ events }: { events: TimelineEvent[] }) {
  const sortedEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8) // Show max 8 events

  const today = new Date()

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
      {sortedEvents.map((event, i) => {
        const config = typeConfig[event.type]
        const isPast = new Date(event.date) < today
        const isToday = new Date(event.date).toDateString() === today.toDateString()

        return (
          <div key={event.id} className="flex items-center">
            {i > 0 && (
              <div className={cn(
                'w-8 h-0.5',
                isPast ? 'bg-primary' : 'bg-muted'
              )} />
            )}
            <div
              className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center',
                config.bg,
                !isPast && !isToday && 'opacity-40',
                isToday && 'ring-2 ring-primary ring-offset-2'
              )}
              title={`${event.title} - ${new Date(event.date).toLocaleDateString()}`}
            >
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
