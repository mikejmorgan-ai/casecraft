import { createServerSupabase } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ChatInterface } from '@/components/chat/chat-interface'
import type { ConversationType } from '@/lib/types'

const CONV_TYPE_LABELS: Record<ConversationType, string> = {
  hearing: 'Hearing',
  deposition: 'Deposition',
  mediation: 'Mediation',
  strategy_session: 'Strategy Session',
  research: 'Research',
  general: 'General',
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string; convId: string }>
}) {
  const { id: caseId, convId } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch case with agents
  const { data: caseData } = await supabase
    .from('cases')
    .select('*, agents(*)')
    .eq('id', caseId)
    .single()

  if (!caseData) notFound()

  // Fetch conversation with messages
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('id', convId)
    .eq('case_id', caseId)
    .single()

  if (!conversation) notFound()

  const activeAgents = caseData.agents?.filter((a: { is_active: boolean }) => a.is_active) || []

  return (
    <div id="conversation-page-container" className="min-h-screen bg-[var(--color-legal-cream)] flex flex-col">
      {/* Header */}
      <header id="conversation-header" className="bg-primary text-primary-foreground py-4 flex-shrink-0">
        <div className="container mx-auto px-6">
          <Link
            href={`/case/${caseId}`}
            className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {caseData.name}
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-serif font-bold">{conversation.name}</h1>
            <Badge variant="secondary">
              {CONV_TYPE_LABELS[conversation.conversation_type as ConversationType]}
            </Badge>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main id="conversation-main" className="flex-1 container mx-auto px-6 py-6">
        <ChatInterface
          caseId={caseId}
          conversationId={convId}
          agents={activeAgents}
          initialMessages={conversation.messages || []}
        />
      </main>
    </div>
  )
}
