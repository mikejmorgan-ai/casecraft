import { getAuthUserId, getSupabase } from '@/lib/auth/clerk'
import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
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
  statutory_quiz: 'Statutory Quiz',
  voice_call: 'Voice Call',
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string; convId: string }>
}) {
  const { id: caseId, convId } = await params
  const cookieStore = await cookies()
  const hasBetaBypass = cookieStore.get('beta_bypass')?.value === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let caseData: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let conversation: any = null

  try {
    const userId = await getAuthUserId()
    if (!userId && !hasBetaBypass) redirect('/sign-in')
    const supabase = await getSupabase()

    // Fetch case with agents
    const { data: caseResult } = await supabase
      .from('cases')
      .select('*, agents(*)')
      .eq('id', caseId)
      .single()

    if (!caseResult) notFound()
    caseData = caseResult

    // Fetch conversation with messages
    const { data: convResult } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('id', convId)
      .eq('case_id', caseId)
      .single()

    if (!convResult) notFound()
    conversation = convResult
  } catch (err) {
    if (!hasBetaBypass) redirect('/sign-in')
    notFound()
  }

  if (!caseData || !conversation) notFound()

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
