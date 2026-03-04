'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Target,
  Shield,
  AlertTriangle,
  Swords,
  Scale,
  Lightbulb,
  BookOpen,
  Loader2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MotionAnalysisResultProps {
  content: string
  isStreaming: boolean
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  'EXECUTIVE SUMMARY': FileText,
  'KEY ARGUMENTS MADE': Target,
  'STRENGTHS OF THE MOTION': Shield,
  'WEAKNESSES & VULNERABILITIES': AlertTriangle,
  'OPPOSING ARGUMENTS': Swords,
  'PROCEDURAL ISSUES': Scale,
  'STRATEGIC RECOMMENDATIONS': Lightbulb,
  'RELEVANT CASE LAW': BookOpen,
}

const SECTION_COLORS: Record<string, string> = {
  'EXECUTIVE SUMMARY': 'bg-blue-50 border-blue-200 text-blue-800',
  'KEY ARGUMENTS MADE': 'bg-slate-50 border-slate-200 text-slate-800',
  'STRENGTHS OF THE MOTION': 'bg-green-50 border-green-200 text-green-800',
  'WEAKNESSES & VULNERABILITIES': 'bg-red-50 border-red-200 text-red-800',
  'OPPOSING ARGUMENTS': 'bg-orange-50 border-orange-200 text-orange-800',
  'PROCEDURAL ISSUES': 'bg-purple-50 border-purple-200 text-purple-800',
  'STRATEGIC RECOMMENDATIONS': 'bg-amber-50 border-amber-200 text-amber-800',
  'RELEVANT CASE LAW': 'bg-indigo-50 border-indigo-200 text-indigo-800',
}

function detectSections(content: string): { name: string; content: string }[] {
  const sectionNames = Object.keys(SECTION_ICONS)
  const sections: { name: string; content: string }[] = []

  // Split content by markdown headers that match known section names
  const lines = content.split('\n')
  let currentSection: { name: string; lines: string[] } | null = null

  for (const line of lines) {
    // Check if this line is a section header (## or ** pattern)
    const headerMatch = line.match(/^#{1,3}\s+\*{0,2}\d*\.?\s*(.+?)\*{0,2}\s*$/)
    if (headerMatch) {
      const headerText = headerMatch[1].replace(/\*+/g, '').trim()
      const matchedSection = sectionNames.find(
        name => headerText.toUpperCase().includes(name) || name.includes(headerText.toUpperCase())
      )

      if (matchedSection) {
        if (currentSection) {
          sections.push({ name: currentSection.name, content: currentSection.lines.join('\n').trim() })
        }
        currentSection = { name: matchedSection, lines: [] }
        continue
      }
    }

    if (currentSection) {
      currentSection.lines.push(line)
    }
  }

  // Push the last section
  if (currentSection) {
    sections.push({ name: currentSection.name, content: currentSection.lines.join('\n').trim() })
  }

  return sections
}

export function MotionAnalysisResult({ content, isStreaming }: MotionAnalysisResultProps) {
  if (!content && !isStreaming) {
    return null
  }

  const sections = detectSections(content)
  const hasSections = sections.length > 0

  return (
    <Card id="motion-analysis-result" className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5 text-primary" />
            Motion Analysis
          </CardTitle>
          {isStreaming && (
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing...
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <ScrollArea className="max-h-[calc(100vh-400px)]">
          {hasSections ? (
            <div className="space-y-4">
              {sections.map((section, index) => {
                const Icon = SECTION_ICONS[section.name] || FileText
                const colorClass = SECTION_COLORS[section.name] || 'bg-gray-50 border-gray-200 text-gray-800'

                return (
                  <div
                    key={index}
                    id={`analysis-section-${index}`}
                    className={`rounded-lg border p-4 ${colorClass}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide">
                        {section.name}
                      </h3>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
                  </div>
                )
              })}

              {isStreaming && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Generating analysis...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
              {isStreaming && !content && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Starting analysis...</span>
                </div>
              )}
              {isStreaming && content && (
                <div className="flex items-center py-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span className="text-xs">Generating...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
