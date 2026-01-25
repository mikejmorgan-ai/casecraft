import type { Agent, AgentRole } from '@/lib/types'

export type HearingPhase =
  | 'opening'
  | 'plaintiff_opening'
  | 'defense_opening'
  | 'plaintiff_case'
  | 'defense_case'
  | 'plaintiff_closing'
  | 'defense_closing'
  | 'verdict'
  | 'complete'

export type HearingType =
  | 'full_trial'
  | 'motion_hearing'
  | 'preliminary_hearing'
  | 'settlement_conference'

export interface HearingState {
  phase: HearingPhase
  currentSpeaker: AgentRole | null
  turnOrder: AgentRole[]
  turnIndex: number
  transcript: Array<{
    role: AgentRole
    agentName: string
    content: string
    timestamp: Date
  }>
}

// Define turn order for different hearing types
const HEARING_TURN_ORDERS: Record<HearingType, AgentRole[][]> = {
  full_trial: [
    ['judge'], // Opening
    ['plaintiff_attorney'], // Plaintiff opening statement
    ['defense_attorney'], // Defense opening statement
    ['plaintiff_attorney', 'expert_witness', 'defense_attorney'], // Plaintiff case (direct, cross)
    ['plaintiff_attorney', 'witness', 'defense_attorney'], // More plaintiff case
    ['defense_attorney', 'witness', 'plaintiff_attorney'], // Defense case
    ['defense_attorney', 'expert_witness', 'plaintiff_attorney'], // More defense
    ['plaintiff_attorney'], // Plaintiff closing
    ['defense_attorney'], // Defense closing
    ['judge'], // Verdict/ruling
  ],
  motion_hearing: [
    ['judge'], // Call to order
    ['plaintiff_attorney'], // Present motion / main argument
    ['plaintiff_attorney'], // Continue argument, cite authority
    ['defense_attorney'], // Opposition argument
    ['defense_attorney'], // Continue opposition, counter-authority
    ['plaintiff_attorney'], // Rebuttal
    ['defense_attorney'], // Sur-rebuttal
    ['judge'], // Questions to plaintiff
    ['plaintiff_attorney'], // Response to court
    ['judge'], // Questions to defense
    ['defense_attorney'], // Response to court
    ['judge'], // Ruling
  ],
  preliminary_hearing: [
    ['judge'],
    ['plaintiff_attorney'],
    ['plaintiff_attorney'],
    ['defense_attorney'],
    ['defense_attorney'],
    ['plaintiff_attorney'], // Rebuttal
    ['judge'],
  ],
  settlement_conference: [
    ['mediator'],
    ['plaintiff_attorney'],
    ['defense_attorney'],
    ['mediator'],
    ['plaintiff_attorney'],
    ['defense_attorney'],
    ['mediator'],
    ['plaintiff_attorney'],
    ['defense_attorney'],
    ['mediator'],
  ],
}

export const PHASE_PROMPTS: Record<HearingPhase, string> = {
  opening: 'Call the court to order and announce the case. State the matter before the court and the parties present. Set the procedural tone for today\'s hearing.',
  plaintiff_opening: 'Present your main argument to the court. Cite the specific statutes and legal authority supporting your position. Be thorough and persuasive - this is your primary opportunity to make your case.',
  defense_opening: 'Present your opposition to the motion. Cite counter-authority and challenge the movant\'s legal arguments. Explain why the court should rule in your client\'s favor.',
  plaintiff_case: 'Continue developing your argument. Reference specific documents, evidence, or case law. Address any weaknesses in your position preemptively. Build the record for appeal if necessary.',
  defense_case: 'Continue your opposition. Challenge the plaintiff\'s evidence and interpretations. Cite controlling precedent that supports your position. Emphasize the factual disputes that preclude summary judgment.',
  plaintiff_closing: 'Respond to the defense\'s arguments. Distinguish their cited cases. Reinforce why the statutory language and legislative intent support your client. Summarize your strongest points.',
  defense_closing: 'Respond to plaintiff\'s rebuttal. Emphasize the procedural and substantive deficiencies in their arguments. Remind the court of the applicable legal standards and burdens of proof.',
  verdict: 'Thank the parties for their arguments. Summarize the key legal issues presented. Announce your ruling on the motion with specific legal reasoning. If appropriate, indicate next steps or deadlines.',
  complete: '',
}

export function getNextSpeaker(
  hearingType: HearingType,
  phaseIndex: number,
  turnInPhase: number
): AgentRole | null {
  const phases = HEARING_TURN_ORDERS[hearingType]
  if (phaseIndex >= phases.length) return null

  const currentPhase = phases[phaseIndex]
  if (turnInPhase >= currentPhase.length) return null

  return currentPhase[turnInPhase]
}

export function getCurrentPhase(hearingType: HearingType, phaseIndex: number): HearingPhase {
  const phaseMap: Record<HearingType, HearingPhase[]> = {
    full_trial: [
      'opening',
      'plaintiff_opening',
      'defense_opening',
      'plaintiff_case',
      'plaintiff_case',
      'defense_case',
      'defense_case',
      'plaintiff_closing',
      'defense_closing',
      'verdict',
    ],
    motion_hearing: [
      'opening',           // Judge calls to order
      'plaintiff_opening', // Kass presents motion
      'plaintiff_case',    // Kass continues argument
      'defense_opening',   // Romano opposition
      'defense_case',      // Romano continues
      'plaintiff_closing', // Kass rebuttal
      'defense_closing',   // Romano sur-rebuttal
      'plaintiff_case',    // Judge questions plaintiff
      'plaintiff_closing', // Kass responds
      'defense_case',      // Judge questions defense
      'defense_closing',   // Romano responds
      'verdict',           // Judge ruling
    ],
    preliminary_hearing: ['opening', 'plaintiff_opening', 'plaintiff_case', 'defense_opening', 'defense_case', 'plaintiff_closing', 'verdict'],
    settlement_conference: ['opening', 'plaintiff_case', 'defense_case', 'plaintiff_closing', 'defense_closing', 'plaintiff_case', 'defense_case', 'plaintiff_closing', 'defense_closing', 'verdict'],
  }

  const phases = phaseMap[hearingType]
  if (phaseIndex >= phases.length) return 'complete'
  return phases[phaseIndex]
}

export function buildHearingPrompt(
  agent: Agent,
  phase: HearingPhase,
  transcript: Array<{ role: AgentRole; agentName: string; content: string }>,
  caseContext: string
): string {
  const recentTranscript = transcript
    .slice(-10)
    .map((t) => `${t.agentName} (${t.role}): ${t.content}`)
    .join('\n\n')

  return `You are ${agent.name}, acting as the ${agent.role.replace('_', ' ')} in this legal proceeding.

${agent.persona_prompt}

CASE CONTEXT:
${caseContext}

CURRENT PHASE: ${phase.replace('_', ' ').toUpperCase()}
YOUR TASK: ${PHASE_PROMPTS[phase]}

RECENT PROCEEDINGS:
${recentTranscript || '[Proceedings have just begun]'}

Respond in character as ${agent.name}. Be concise but thorough. Address the court appropriately.
Do NOT break character or mention that you are an AI.`
}
