#!/usr/bin/env python3
"""
Claim 2: Permanent Injunction — No Enforcement
Discovery Document Processor for Tree Farm LLC v. Salt Lake County

Legal Theory: The invalid ordinance cannot be enforced against Tree Farm.
Evidence needed: enforcement actions, permit/license denials, cease & desist,
administrative trap (deny license for lacking CUP while eliminating CUP category),
COM21-1590 business license denial, CUP blocking/freezing, ongoing harm.
"""

import sqlite3
import os
import re
import sys
from pathlib import Path
from datetime import datetime

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
DATA_BASE = "/home/user/casebreak/data"

# ─── Keyword tiers for Claim 2 relevance ─────────────────────────────────────

# CRITICAL: Direct enforcement actions
CRITICAL_PATTERNS = [
    re.compile(r'COM21[-.]?1590', re.IGNORECASE),
    re.compile(r'business\s+license\s+(denial|denied|deny|reject|refused)', re.IGNORECASE),
    re.compile(r'(denial|denied|deny|reject|refused)\s+.{0,30}business\s+license', re.IGNORECASE),
    re.compile(r'cease\s+and\s+desist', re.IGNORECASE),
    re.compile(r'cease[-\s]and[-\s]desist', re.IGNORECASE),
    re.compile(r'enforcement\s+action', re.IGNORECASE),
    re.compile(r'stop\s+(all\s+)?mining', re.IGNORECASE),
    re.compile(r'shut\s*down\s+(the\s+)?(mining|quarry|operation)', re.IGNORECASE),
    re.compile(r'(revoke|revoked|revoking)\s+.{0,30}(permit|license|approval)', re.IGNORECASE),
    re.compile(r'(permit|license|approval)\s+.{0,20}(revoke|revoked|revoking)', re.IGNORECASE),
    re.compile(r'order\s+to\s+(stop|cease|halt)', re.IGNORECASE),
    re.compile(r'cannot\s+(legally\s+)?operate', re.IGNORECASE),
    re.compile(r'(illegal|unlawful)\s+(mining|quarry|extraction|operation)', re.IGNORECASE),
    re.compile(r'operating\s+(without|in\s+violation)', re.IGNORECASE),
    re.compile(r'license\s+application\s+.{0,20}denied', re.IGNORECASE),
    re.compile(r'denied\s+.{0,20}license\s+application', re.IGNORECASE),
]

# HIGH: Administrative trap, coordination to block
HIGH_PATTERNS = [
    re.compile(r'no\s+(valid\s+)?CUP', re.IGNORECASE),
    re.compile(r'(without|lacks?|no)\s+.{0,20}conditional\s+use\s+permit', re.IGNORECASE),
    re.compile(r'conditional\s+use\s+(permit\s+)?.{0,20}(not\s+available|eliminated|removed|no\s+longer)', re.IGNORECASE),
    re.compile(r'(eliminat|remov)\w+\s+.{0,30}(CUP|conditional\s+use)', re.IGNORECASE),
    re.compile(r'CUP\s+.{0,30}(eliminat|remov|no\s+longer)', re.IGNORECASE),
    re.compile(r'(cannot|can\s*not|no\s+way\s+to)\s+.{0,30}(get|obtain|apply|receive)\s+.{0,20}(CUP|permit|license|approval)', re.IGNORECASE),
    re.compile(r'(block|prevent|stop)\s+.{0,20}(Tree\s+Farm|mining|quarry|operation)', re.IGNORECASE),
    re.compile(r'(Tree\s+Farm|mining|quarry|operation)\s+.{0,20}(block|prevent|stop)', re.IGNORECASE),
    re.compile(r'no\s+.{0,20}(pathway|avenue|mechanism|process)\s+.{0,20}(to|for)\s+.{0,20}(approv|permit|licens)', re.IGNORECASE),
    re.compile(r'(freeze|frozen|froze|suspend)\s+.{0,20}(application|CUP|permit)', re.IGNORECASE),
    re.compile(r'(application|CUP|permit)\s+.{0,20}(freeze|frozen|froze|suspend)', re.IGNORECASE),
    re.compile(r'(deny|denied|denial)\s+.{0,30}(CUP|conditional\s+use)', re.IGNORECASE),
    re.compile(r'(CUP|conditional\s+use)\s+.{0,30}(deny|denied|denial)', re.IGNORECASE),
    re.compile(r'(require|need)\s+.{0,20}CUP\s+.{0,30}(but|however|yet|while|eliminat)', re.IGNORECASE),
    re.compile(r'(harm|damage|injur)\w*\s+.{0,30}(Tree\s+Farm|mining|operation|business)', re.IGNORECASE),
    re.compile(r'(Tree\s+Farm|mining|operation|business)\s+.{0,30}(harm|damage|injur)', re.IGNORECASE),
    re.compile(r'ongoing\s+(harm|damage|injury|enforcement)', re.IGNORECASE),
    re.compile(r'irreparable\s+(harm|damage|injury)', re.IGNORECASE),
    re.compile(r'code\s+enforcement\s+.{0,30}(Tree\s+Farm|mining|quarry)', re.IGNORECASE),
    re.compile(r'(Tree\s+Farm|mining|quarry)\s+.{0,30}code\s+enforcement', re.IGNORECASE),
    re.compile(r'(violat|non[-\s]?comply|non[-\s]?compliance)\w*\s+.{0,30}(Tree\s+Farm|mining|quarry)', re.IGNORECASE),
    re.compile(r'(Tree\s+Farm|mining|quarry)\s+.{0,30}(violat|non[-\s]?comply|non[-\s]?compliance)', re.IGNORECASE),
    re.compile(r'not\s+(in\s+)?compliance', re.IGNORECASE),
    re.compile(r'(threat|threaten)\w*\s+.{0,20}enforcement', re.IGNORECASE),
    re.compile(r'enforcement\s+.{0,20}(threat|threaten)', re.IGNORECASE),
]

# MEDIUM: Enforcement strategy, planned actions
MEDIUM_PATTERNS = [
    re.compile(r'enforcement\s+(strategy|plan|approach|effort|posture)', re.IGNORECASE),
    re.compile(r'(strategy|plan|approach)\s+.{0,20}enforcement', re.IGNORECASE),
    re.compile(r'(how|what)\s+.{0,20}(enforce|enforcement|stop|prevent|block)\s+.{0,20}(mining|quarry|Tree\s+Farm)', re.IGNORECASE),
    re.compile(r'(county|SLCo|we|our)\s+.{0,30}(authority|power|jurisdiction|ability)\s+.{0,20}(over|to|regarding)\s+.{0,20}mining', re.IGNORECASE),
    re.compile(r'(options?|tools?|mechanisms?)\s+.{0,20}(to|for)\s+.{0,20}(stop|prevent|block|enforce)', re.IGNORECASE),
    re.compile(r'(land\s+use|zoning)\s+.{0,20}(enforcement|compliance|violation)', re.IGNORECASE),
    re.compile(r'(enforcement|compliance|violation)\s+.{0,20}(land\s+use|zoning)', re.IGNORECASE),
    re.compile(r'(pending|ongoing|active)\s+.{0,20}enforcement', re.IGNORECASE),
    re.compile(r'enforcement\s+.{0,20}(pending|ongoing|active)', re.IGNORECASE),
    re.compile(r'(DA|district\s+attorney|county\s+attorney|prosecutor)\s+.{0,30}(mining|quarry|Tree\s+Farm)', re.IGNORECASE),
    re.compile(r'(mining|quarry|Tree\s+Farm)\s+.{0,30}(DA|district\s+attorney|county\s+attorney|prosecutor)', re.IGNORECASE),
    re.compile(r'(refer|referr)\w+\s+.{0,20}(enforcement|prosecution|attorney|DA)', re.IGNORECASE),
    re.compile(r'(complaint|citation|notice\s+of\s+violation|NOV)', re.IGNORECASE),
    re.compile(r'abatement', re.IGNORECASE),
]

# LOW: General references to county authority
LOW_PATTERNS = [
    re.compile(r'county\s+(authority|jurisdiction|power|control)\s+.{0,20}(over|regarding)?\s*.{0,20}mining', re.IGNORECASE),
    re.compile(r'mining\s+.{0,20}(regulated?|subject\s+to|governed|controlled)', re.IGNORECASE),
    re.compile(r'(ordinance|regulation|code)\s+.{0,20}(applies?|governs?|controls?|regulates?)\s+.{0,20}mining', re.IGNORECASE),
    re.compile(r'(county|SLCo)\s+.{0,20}(can|could|should|must|shall)\s+.{0,20}(enforce|regulate|control)', re.IGNORECASE),
    re.compile(r'(enforce|apply|implement)\s+.{0,20}(ordinance|regulation|code|amendment)', re.IGNORECASE),
    re.compile(r'mining\s+(operations?|activit)\s+.{0,20}(require|need|must)', re.IGNORECASE),
    re.compile(r'(gravel|sand|aggregate|quarry|extraction|excavat)\w*\s+.{0,30}(permit|license|approv|CUP|conditional)', re.IGNORECASE),
]

# Additional special patterns for Tree Farm-specific enforcement
TREE_FARM_ENFORCEMENT_PATTERNS = [
    re.compile(r'Tree\s+Farm\s+.{0,50}(deny|denied|denial|reject|refused|block|prevent|stop|cease|halt|suspend|revok|terminat|cancel)', re.IGNORECASE),
    re.compile(r'(deny|denied|denial|reject|refused|block|prevent|stop|cease|halt|suspend|revok|terminat|cancel)\s+.{0,50}Tree\s+Farm', re.IGNORECASE),
    re.compile(r'Harper\s+.{0,50}(deny|denied|denial|license|permit|enforce|violat)', re.IGNORECASE),
    re.compile(r'Parleys?\s+(Canyon|quarry|mine|mining)\s+.{0,50}(deny|denied|denial|enforce|stop|block|prevent)', re.IGNORECASE),
]


def extract_metadata(text):
    """Extract document metadata from email/document headers."""
    title = ""
    date = ""
    doc_type = "unknown"

    # Extract Subject
    subj_match = re.search(r'^Subject:\s*(.+?)$', text, re.MULTILINE)
    if subj_match:
        title = subj_match.group(1).strip()[:200]

    # Extract Date
    date_match = re.search(r'^Date:\s*(.+?)$', text, re.MULTILINE)
    if date_match:
        date = date_match.group(1).strip()[:100]

    # Determine type
    if re.search(r'^From:', text, re.MULTILINE):
        doc_type = "email"
    elif re.search(r'ORDINANCE|RESOLUTION|AGENDA', text, re.IGNORECASE):
        doc_type = "official_document"
    elif re.search(r'MEETING\s+(MINUTES|NOTES|RECORD)', text, re.IGNORECASE):
        doc_type = "meeting_record"
    elif re.search(r'APPLICATION|PERMIT|LICENSE', text, re.IGNORECASE):
        doc_type = "application"
    elif re.search(r'STAFF\s+REPORT|MEMORANDUM|MEMO', text, re.IGNORECASE):
        doc_type = "staff_report"

    return title, date, doc_type


def create_summary(text, max_len=300):
    """Create a brief summary from document text."""
    # Remove email signatures and boilerplate
    lines = text.split('\n')
    content_lines = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith(('From:', 'To:', 'Cc:', 'Bcc:', 'Subject:', 'Date:', 'Importance:', 'Inline-Images:')):
            content_lines.append(line)

    summary = ' '.join(content_lines)
    # Clean up
    summary = re.sub(r'\s+', ' ', summary).strip()
    if len(summary) > max_len:
        summary = summary[:max_len] + "..."
    return summary


def classify_document(text, bates):
    """
    Classify a document's relevance to Claim 2.
    Returns: (relevance, supports_undermines, reasoning, key_quote) or None if not relevant.
    """
    text_lower = text.lower()

    # Quick pre-filter: uses BRACKETED PHRASES (not single words).
    # RULE 1: Every search term is a multi-word phrase. No single words.
    # "mining" alone is NOT a hit. "cease and desist" IS a hit.
    quick_phrases = [
        'enforcement action', 'code enforcement', 'cease and desist',
        'business license', 'conditional use', 'tree farm',
        'notice of violation', 'shut down', 'cannot operate',
        'not allowed', 'irreparable harm', 'ongoing harm',
        'stop work', 'mining operation', 'quarry operation',
        'mineral extraction', 'gravel pit', 'sand and gravel',
        'land use', 'non-compliance', 'operating without',
        'operating in violation', 'com21', 'parleys canyon',
        'vested mining', 'mine operator', 'mining use',
        'mining protection', 'large mine', 'small mine',
    ]

    has_any_phrase = any(phrase in text_lower for phrase in quick_phrases)
    if not has_any_phrase:
        return None

    # Score by pattern tiers
    critical_hits = []
    high_hits = []
    medium_hits = []
    low_hits = []
    tf_enforcement_hits = []

    for pat in CRITICAL_PATTERNS:
        matches = pat.findall(text)
        if matches:
            critical_hits.extend(matches)

    for pat in HIGH_PATTERNS:
        matches = pat.findall(text)
        if matches:
            high_hits.extend(matches)

    for pat in MEDIUM_PATTERNS:
        matches = pat.findall(text)
        if matches:
            medium_hits.extend(matches)

    for pat in LOW_PATTERNS:
        matches = pat.findall(text)
        if matches:
            low_hits.extend(matches)

    for pat in TREE_FARM_ENFORCEMENT_PATTERNS:
        matches = pat.findall(text)
        if matches:
            tf_enforcement_hits.extend(matches)

    # Determine relevance level
    if critical_hits or tf_enforcement_hits:
        relevance = 'CRITICAL'
    elif high_hits:
        relevance = 'HIGH'
    elif medium_hits:
        relevance = 'MEDIUM'
    elif low_hits:
        relevance = 'LOW'
    else:
        # Has quick phrases but no pattern hits - check for softer relevance
        # Look for combinations of PHRASES that suggest enforcement context
        has_tree_farm = 'tree farm' in text_lower
        has_mining_phrase = any(t in text_lower for t in ['mining operation', 'quarry operation', 'gravel pit', 'mineral extraction', 'mining use', 'mine operator'])
        has_enforcement_phrase = any(t in text_lower for t in ['enforcement action', 'code enforcement', 'notice of violation', 'permit denied', 'license denied', 'non-compliance'])
        has_county_action = any(t in text_lower for t in ['land use ordinance', 'zoning ordinance', 'code enforcement'])
        has_cup = 'conditional use' in text_lower

        if has_tree_farm and has_enforcement_phrase:
            relevance = 'MEDIUM'
        elif has_mining_phrase and has_enforcement_phrase and has_county_action:
            relevance = 'MEDIUM'
        elif has_cup and has_enforcement_phrase:
            relevance = 'LOW'
        elif has_mining_phrase and has_county_action:
            relevance = 'LOW'
        else:
            return None

    # Extract the best key quote
    key_quote = extract_key_quote(text, relevance, critical_hits, high_hits, medium_hits, low_hits, tf_enforcement_hits)

    # Determine supports/undermines
    supports_undermines = determine_supports_undermines(text, text_lower)

    # Generate reasoning
    reasoning = generate_reasoning(text, relevance, critical_hits, high_hits, medium_hits, low_hits, tf_enforcement_hits, bates)

    return (relevance, supports_undermines, reasoning, key_quote)


def extract_key_quote(text, relevance, critical_hits, high_hits, medium_hits, low_hits, tf_hits):
    """Extract the most relevant quote from the document."""
    lines = text.split('\n')
    best_line = ""
    best_score = 0

    # Build scoring phrases based on priority
    # RULE 1: Every scoring term is a multi-word phrase. No single words.
    priority_terms = {
        'com21-1590': 10, 'com21': 10, 'business license denial': 10,
        'business license denied': 10, 'cease and desist': 10,
        'enforcement action': 9, 'tree farm': 7, 'cannot operate': 9,
        'illegal mining': 8, 'unlawful mining': 8, 'shut down': 9,
        'conditional use permit': 6, 'no valid cup': 8, 'without cup': 8,
        'conditional use eliminated': 7, 'freeze application': 7,
        'notice of violation': 7, 'non-compliance': 6, 'code enforcement': 7,
        'mining operation': 3, 'quarry operation': 3, 'parleys canyon': 5,
        'irreparable harm': 8, 'ongoing harm': 6, 'ongoing damage': 6,
        'stop work': 7, 'revoke permit': 7, 'revoke license': 7,
        'vested mining': 8, 'mine operator': 8, 'mining use': 6,
    }

    for line in lines:
        line_stripped = line.strip()
        if len(line_stripped) < 10 or len(line_stripped) > 500:
            continue
        # Skip header lines
        if re.match(r'^(From|To|Cc|Bcc|Subject|Date|Importance|Inline-Images):', line_stripped):
            continue

        line_lower = line_stripped.lower()
        score = 0
        for term, pts in priority_terms.items():
            if term in line_lower:
                score += pts

        if score > best_score:
            best_score = score
            best_line = line_stripped

    if best_line:
        return best_line[:500]

    # Fallback: return first substantive line
    for line in lines:
        line_stripped = line.strip()
        if len(line_stripped) > 20 and not re.match(r'^(From|To|Cc|Bcc|Subject|Date|Importance|Inline-Images):', line_stripped):
            return line_stripped[:500]

    return ""


def determine_supports_undermines(text, text_lower):
    """Determine if document supports or undermines Claim 2.
    RULE 1: Uses BRACKETED PHRASES (multi-word) not single words."""
    # Phrases that SUPPORT the injunction claim (showing enforcement/harm)
    # Each is a multi-word phrase or specific legal term of art
    support_phrases = [
        'license denied', 'permit denied', 'application denied',
        'license denial', 'permit denial', 'cannot operate',
        'cease and desist', 'enforcement action', 'shut down',
        'not in compliance', 'non-compliance', 'no valid cup',
        'without cup', 'without conditional use', 'operating without',
        'revoke permit', 'revoke license', 'irreparable harm',
        'ongoing harm', 'ongoing damage', 'ongoing enforcement',
        'not allowed to', 'prohibited from', 'stop work',
        'notice of violation', 'code enforcement',
        'business license denial', 'conditional use eliminated',
    ]

    # Phrases that UNDERMINE (showing county was reasonable/didn't enforce)
    undermine_phrases = [
        'permit approved', 'license approved', 'application granted',
        'no enforcement action', 'not enforcing', 'will not enforce',
        'voluntary compliance', 'work together', 'good faith',
        'accommodate the', 'withdraw enforcement',
    ]

    support_score = sum(1 for phrase in support_phrases if phrase in text_lower)
    undermine_score = sum(1 for phrase in undermine_phrases if phrase in text_lower)

    if support_score > undermine_score + 1:
        return 'SUPPORTS'
    elif undermine_score > support_score + 1:
        return 'UNDERMINES'
    else:
        return 'NEUTRAL'


def generate_reasoning(text, relevance, critical_hits, high_hits, medium_hits, low_hits, tf_hits, bates):
    """Generate Claim 2-specific reasoning."""
    text_lower = text.lower()

    parts = []

    if 'com21' in text_lower or '1590' in text_lower:
        parts.append("References business license application COM21-1590, a direct enforcement action against Tree Farm.")

    if 'cease and desist' in text_lower:
        parts.append("References cease and desist order — direct enforcement action.")

    if 'tree farm' in text_lower:
        if any(t in text_lower for t in ['permit denied', 'license denied', 'application denied', 'application rejected']):
            parts.append("Shows direct enforcement action against Tree Farm through denial of permits/approvals.")
        elif any(t in text_lower for t in ['notice of violation', 'non-compliance', 'code enforcement']):
            parts.append("References Tree Farm in context of code violations or non-compliance — enforcement posture evidence.")
        elif 'enforcement action' in text_lower:
            parts.append("Discusses enforcement action in connection with Tree Farm operations.")

    if 'conditional use' in text_lower:
        if any(t in text_lower for t in ['conditional use eliminated', 'conditional use removed', 'no longer a conditional use']):
            parts.append("Evidence of administrative trap: CUP category elimination while requiring CUP for mining operations.")
        elif any(t in text_lower for t in ['conditional use denied', 'cup denied', 'freeze application', 'frozen application']):
            parts.append("Shows blocking of CUP pathway for Tree Farm mining operations.")
        elif 'conditional use permit' in text_lower and 'application' in text_lower:
            parts.append("Discusses CUP application process relevant to Tree Farm's ability to obtain approval.")

    if any(t in text_lower for t in ['irreparable harm', 'ongoing harm', 'ongoing damage', 'ongoing enforcement']):
        if any(t in text_lower for t in ['tree farm', 'mining operation', 'quarry operation']):
            parts.append("Documents ongoing harm from enforcement actions against Tree Farm's mining operations.")

    if any(t in text_lower for t in ['enforcement strategy', 'enforcement plan', 'enforcement approach']):
        parts.append("Reveals county enforcement strategy against mining operations.")

    if 'code enforcement' in text_lower and any(t in text_lower for t in ['mining operation', 'quarry operation', 'tree farm', 'gravel pit']):
        parts.append("Code enforcement activity related to mining/quarry operations.")

    if not parts:
        if relevance == 'CRITICAL':
            parts.append("Contains direct evidence of enforcement action against Tree Farm mining operations.")
        elif relevance == 'HIGH':
            parts.append("Contains significant evidence relevant to enforcement against Tree Farm or administrative barriers to operation.")
        elif relevance == 'MEDIUM':
            parts.append("Contains evidence related to county enforcement strategy or planned actions against mining operations.")
        elif relevance == 'LOW':
            parts.append("Contains general references to county regulatory authority over mining operations.")

    return ' '.join(parts)


def is_key_finding(text, relevance, bates):
    """Determine if this is a key finding document."""
    text_lower = text.lower()

    reasons = []

    # COM21-1590 business license denial
    if ('com21' in text_lower or 'com21-1590' in text_lower or 'com21.1590' in text_lower):
        if any(t in text_lower for t in ['license denied', 'license denial', 'application denied']):
            reasons.append("Direct evidence of business license denial (COM21-1590) — core enforcement action.")

    # Cease and desist targeting Tree Farm
    if 'cease and desist' in text_lower and 'tree farm' in text_lower:
        reasons.append("Cease and desist directed at Tree Farm — direct enforcement.")

    # Explicit statements of enforcement intent
    if 'tree farm' in text_lower and any(t in text_lower for t in ['cannot operate', 'shut down', 'stop mining', 'not allowed to mine', 'illegal mining']):
        reasons.append("Explicit statement that Tree Farm cannot/should not operate — enforcement intent.")

    # Administrative trap evidence
    if 'conditional use' in text_lower:
        if any(t in text_lower for t in ['conditional use eliminated', 'conditional use removed', 'no longer a conditional use']):
            if any(t in text_lower for t in ['require conditional use', 'need conditional use', 'without conditional use']):
                reasons.append("Administrative trap: eliminates CUP category while requiring CUP — makes compliance impossible.")

    # County officials directing enforcement against Tree Farm specifically
    if 'tree farm' in text_lower and any(t in text_lower for t in ['enforce against', 'enforcement action', 'pursue enforcement']):
        reasons.append("County officials directing specific enforcement against Tree Farm.")

    # Denial of permit/license blocking operations
    if any(t in text_lower for t in ['permit denied', 'license denied', 'application denied', 'permit denial', 'license denial']):
        if any(t in text_lower for t in ['tree farm', 'parleys canyon']):
            reasons.append("Direct permit/license denial blocking Tree Farm operations.")

    if reasons:
        return reasons
    return None


def process_all_documents():
    """Process all discovery documents for Claim 2 relevance."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get all documents
    cursor.execute("SELECT id, bates, filename, discovery_folder, file_path FROM documents ORDER BY id")
    all_docs = cursor.fetchall()

    total = len(all_docs)
    relevant_count = 0
    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0
    key_finding_count = 0
    errors = []

    print(f"Processing {total} documents for Claim 2: Permanent Injunction — No Enforcement")
    print("=" * 80)

    batch_size = 100
    for i, (doc_id, bates, filename, folder, file_path) in enumerate(all_docs):
        if (i + 1) % 500 == 0:
            conn.commit()
            print(f"  Progress: {i+1}/{total} ({(i+1)*100//total}%) | Relevant so far: {relevant_count} | CRITICAL: {critical_count} | HIGH: {high_count} | MEDIUM: {medium_count} | LOW: {low_count} | Key Findings: {key_finding_count}")

        try:
            # Read the document
            if file_path and os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    text = f.read()
            else:
                # Try constructing path
                constructed_path = os.path.join(DATA_BASE, folder, filename)
                if os.path.exists(constructed_path):
                    with open(constructed_path, 'r', encoding='utf-8', errors='replace') as f:
                        text = f.read()
                else:
                    errors.append(f"File not found: {bates} ({file_path or constructed_path})")
                    continue

            # Extract metadata
            title, date, doc_type = extract_metadata(text)
            summary = create_summary(text)

            # Classify for Claim 2
            result = classify_document(text, bates)

            # Update document metadata (mark as reviewed)
            cursor.execute("""
                UPDATE documents
                SET reviewed = 1, title = ?, date = ?, type = ?, summary = ?
                WHERE id = ?
            """, (title or None, date or None, doc_type or None, summary or None, doc_id))

            if result:
                relevance, supports_undermines, reasoning, key_quote = result
                relevant_count += 1

                if relevance == 'CRITICAL':
                    critical_count += 1
                elif relevance == 'HIGH':
                    high_count += 1
                elif relevance == 'MEDIUM':
                    medium_count += 1
                elif relevance == 'LOW':
                    low_count += 1

                # Insert claim assignment
                cursor.execute("""
                    INSERT OR REPLACE INTO claim_assignments
                    (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                    VALUES (?, 2, ?, ?, ?, ?)
                """, (doc_id, relevance, supports_undermines, reasoning, key_quote))

                # Check for key findings
                sg_reasons = is_key_finding(text, relevance, bates)
                if sg_reasons:
                    key_finding_count += 1
                    why_critical = ' '.join(sg_reasons)
                    recommended_use = f"Use in Claim 2 briefing to demonstrate county enforcement against Tree Farm. Bates: {bates}."
                    cursor.execute("""
                        INSERT OR REPLACE INTO smoking_guns
                        (doc_id, claim_num, why_critical, recommended_use)
                        VALUES (?, 2, ?, ?)
                    """, (doc_id, why_critical, recommended_use))

        except Exception as e:
            errors.append(f"Error processing {bates}: {str(e)}")

    # Final commit
    conn.commit()

    print("\n" + "=" * 80)
    print("PROCESSING COMPLETE")
    print("=" * 80)
    print(f"Total documents reviewed: {total}")
    print(f"Total relevant to Claim 2: {relevant_count}")
    print(f"  CRITICAL: {critical_count}")
    print(f"  HIGH: {high_count}")
    print(f"  MEDIUM: {medium_count}")
    print(f"  LOW: {low_count}")
    print(f"Key findings identified: {key_finding_count}")

    if errors:
        print(f"\nErrors ({len(errors)}):")
        for err in errors[:20]:
            print(f"  {err}")
        if len(errors) > 20:
            print(f"  ... and {len(errors)-20} more")

    # Print key findings detail
    cursor.execute("""
        SELECT d.bates, d.title, sg.why_critical, sg.recommended_use
        FROM smoking_guns sg JOIN documents d ON sg.doc_id = d.id
        WHERE sg.claim_num = 2
    """)
    key_findings_rows = cursor.fetchall()
    if key_findings_rows:
        print(f"\n{'='*80}")
        print("KEY FINDINGS FOR CLAIM 2")
        print('='*80)
        for bates, title, why, rec in key_findings_rows:
            print(f"\n  Bates: {bates}")
            print(f"  Title: {title}")
            print(f"  Why Critical: {why}")
            print(f"  Recommended Use: {rec}")

    # Print CRITICAL documents detail
    cursor.execute("""
        SELECT d.bates, d.title, ca.supports_undermines, ca.reasoning, ca.key_quote
        FROM claim_assignments ca JOIN documents d ON ca.doc_id = d.id
        WHERE ca.claim_num = 2 AND ca.relevance = 'CRITICAL'
        ORDER BY d.bates
    """)
    criticals = cursor.fetchall()
    if criticals:
        print(f"\n{'='*80}")
        print("ALL CRITICAL DOCUMENTS FOR CLAIM 2")
        print('='*80)
        for bates, title, sup, reasoning, quote in criticals:
            print(f"\n  Bates: {bates}")
            print(f"  Title: {title}")
            print(f"  S/U: {sup}")
            print(f"  Reasoning: {reasoning}")
            print(f"  Quote: {quote[:200] if quote else 'N/A'}")

    conn.close()
    return total, relevant_count, critical_count, high_count, medium_count, low_count, key_finding_count


if __name__ == '__main__':
    process_all_documents()
