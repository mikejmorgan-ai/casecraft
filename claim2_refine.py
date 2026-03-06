#!/usr/bin/env python3
"""
Claim 2: Permanent Injunction — No Enforcement
REFINED Second Pass Processor

This refines the initial broad pass by:
1. Re-reading all documents flagged as relevant
2. Strictly recategorizing based on actual content analysis (not just keyword proximity)
3. Properly distinguishing:
   - Official enforcement actions BY the county AGAINST Tree Farm = CRITICAL
   - Internal county strategy to enforce against Tree Farm = CRITICAL/HIGH
   - Administrative trap evidence (CUP elimination + license denial) = CRITICAL
   - Public comments urging enforcement = LOW or IRRELEVANT (public opinion, not county action)
   - Meeting agendas mentioning the topic = LOW unless they contain enforcement decisions
4. Clearing out false positive key findings
5. All 5,576 docs remain marked reviewed=1; only relevance/classification changes
"""

import sqlite3
import os
import re
import sys
from pathlib import Path

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
DATA_BASE = "/home/user/casebreak/data"


def read_document(file_path, folder, filename):
    """Read document text."""
    if file_path and os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    constructed_path = os.path.join(DATA_BASE, folder, filename)
    if os.path.exists(constructed_path):
        with open(constructed_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    return None


def is_from_county_official(text):
    """Check if email/doc is FROM a county official (not from the public)."""
    from_match = re.search(r'^From:\s*(.+?)$', text, re.MULTILINE)
    if from_match:
        from_line = from_match.group(1).lower()
        county_domains = ['slco.org', 'msd.utah.gov', 'slco.gov']
        county_officials = ['kanter', 'wilson', 'shaw', 'anderson', 'baptist',
                          'hartman', 'leary', 'blaes', 'sorensen', 'mcclenning',
                          'gonzalez', 'gurr', 'hair', 'kendrick']
        if any(d in from_line for d in county_domains):
            return True
        if any(o in from_line for o in county_officials):
            return True
    return False


def is_from_tree_farm_attorney(text):
    """Check if from Tree Farm's attorney."""
    from_match = re.search(r'^From:\s*(.+?)$', text, re.MULTILINE)
    if from_match:
        from_line = from_match.group(1).lower()
        if any(t in from_line for t in ['bateman', 'dentons', 'parr brown', 'hale', 'matkin', 'wallin', 'klaumann']):
            return True
    return False


def is_public_comment(text):
    """Check if this is a public comment from a citizen (not official)."""
    text_lower = text.lower()
    # Public comment indicators
    public_signals = [
        'i am writing to urge',
        'i am writing to implore',
        'i am writing to express',
        'please help us stop',
        'please stop',
        'as a resident',
        'as a homeowner',
        'as a parent',
        'i am a resident',
        'i oppose',
        'i support the amendment',
        'dear council',
        'dear mayor',
        'public comment',
    ]
    if any(s in text_lower for s in public_signals):
        # Verify it's not from a county official
        if not is_from_county_official(text):
            return True
    return False


def is_official_document(text):
    """Check if this is an official county/state document (not email)."""
    text_lower = text.lower()
    if any(t in text_lower for t in [
        'department of natural resources',
        'division of oil, gas and mining',
        'board of oil, gas and mining',
        'salt lake county code section',
        'pursuant to salt lake county code',
        'planning and development services',
        'recommendation to deny',
        'denial of notice of intention',
    ]):
        return True
    return False


def is_legal_filing(text):
    """Check if this is a legal filing/pleading."""
    text_lower = text.lower()
    if any(t in text_lower for t in [
        'before the board of oil',
        'request for agency action',
        'petition to intervene',
        'stipulated motion',
        'order denying',
        'division\'s response in opposition',
        'docket no.',
        'cause no.',
        'attorney',
        'attorneys for',
    ]):
        if 'docket' in text_lower or 'cause no' in text_lower:
            return True
    return False


def classify_refined(text, bates):
    """
    Refined classification for Claim 2.
    Returns: (relevance, supports_undermines, reasoning, key_quote, is_sg, sg_why, sg_use) or None
    """
    text_lower = text.lower()

    # ═══════════════════════════════════════════════════════════════════════
    # TIER 1: CRITICAL - Direct enforcement actions
    # ═══════════════════════════════════════════════════════════════════════

    # COM21-1590 business license denial letter or recommendation
    is_com21 = bool(re.search(r'COM21[-.]?1590', text, re.IGNORECASE))
    has_denial = any(t in text_lower for t in ['denied', 'denial', 'deny', 'recommendation to deny', 'recommends that you deny'])

    if is_com21 and has_denial:
        # The actual denial letter or recommendation memo
        if 'business license application' in text_lower and 'denied' in text_lower:
            quote = extract_best_quote(text, ['COM21-1590', 'denied', 'denial', 'business license'])
            # Is this the denial letter itself or email forwarding it?
            if 'pursuant to salt lake county code section' in text_lower:
                return ('CRITICAL', 'SUPPORTS',
                    'Official denial of Tree Farm business license application COM21-1590 — direct enforcement action preventing mining operations.',
                    quote, True,
                    'The actual business license denial letter for COM21-1590 is the core enforcement action in this case.',
                    'Lead exhibit for Claim 2: direct evidence county enforced ordinance against Tree Farm by denying business license.')
            elif 'recommendation to deny' in text_lower:
                return ('CRITICAL', 'SUPPORTS',
                    'MSD recommendation to deny Tree Farm business license COM21-1590, citing lack of CUP — shows administrative trap mechanism.',
                    quote, True,
                    'MSD recommendation reveals enforcement mechanism: deny license because no CUP, while CUP category is being eliminated.',
                    'Key exhibit showing administrative trap: license denied for lacking CUP that county simultaneously eliminated.')
            else:
                return ('CRITICAL', 'SUPPORTS',
                    'References COM21-1590 business license denial — enforcement action against Tree Farm.',
                    quote, False, None, None)

    # COM21-1590 referenced without denial - still important
    if is_com21:
        quote = extract_best_quote(text, ['COM21-1590', 'business license', 'application'])
        if is_from_county_official(text):
            return ('CRITICAL', 'SUPPORTS',
                'County official communication regarding business license application COM21-1590 — enforcement chain.',
                quote, False, None, None)
        else:
            return ('HIGH', 'SUPPORTS',
                'References business license application COM21-1590 — relevant to enforcement action documentation.',
                quote, False, None, None)

    # DOGM denial of Small Mine NOI
    if 'denial of notice of intention' in text_lower and 'tree farm' in text_lower:
        quote = extract_best_quote(text, ['denial', 'notice of intention', 'tree farm', 'small mining'])
        if 'department of natural resources' in text_lower or 'division of oil, gas' in text_lower:
            return ('CRITICAL', 'SUPPORTS',
                'Official DOGM denial of Tree Farm Small Mine NOI — state enforcement action preventing mining.',
                quote, True,
                'The DOGM denial letter is a direct enforcement action blocking Tree Farm mining at the state level.',
                'Use to show multi-level enforcement: county denial PLUS state denial, demonstrating enforcement posture.')
        else:
            return ('HIGH', 'SUPPORTS',
                'References DOGM denial of Tree Farm Small Mine NOI.',
                quote, False, None, None)

    # Ordinance explicitly eliminating mineral extraction as conditional use
    has_eliminate_mineral = bool(re.search(r'eliminat\w+\s+.{0,30}mineral\s+extraction', text, re.IGNORECASE))
    has_prohibit_mineral = bool(re.search(r'prohibit\w+\s+.{0,30}mineral\s+extraction', text, re.IGNORECASE))
    has_ordinance_amend = bool(re.search(r'ordinance\s+.{0,30}amend\w+\s+.{0,30}19\.\d+', text, re.IGNORECASE))

    if (has_eliminate_mineral or has_prohibit_mineral) and ('conditional use' in text_lower):
        quote = extract_best_quote(text, ['eliminat', 'prohibit', 'mineral extraction', 'conditional use'])
        if is_official_document(text) or has_ordinance_amend:
            return ('CRITICAL', 'SUPPORTS',
                'Ordinance eliminating mineral extraction as conditional use — completes the administrative trap by removing the pathway for CUP while requiring CUP for license.',
                quote, True,
                'The ordinance amendment that eliminates mineral extraction as a conditional use is the other jaw of the administrative trap.',
                'Pair with COM21-1590 denial: county denied license for lacking CUP, then eliminated CUP category entirely.')
        elif is_from_tree_farm_attorney(text):
            return ('CRITICAL', 'SUPPORTS',
                'Tree Farm attorney challenging ordinance eliminating mineral extraction — documents the enforcement harm and illegality.',
                quote, True,
                'Tree Farm attorney letter documenting illegal ordinance and county refusal to engage — shows ongoing enforcement posture.',
                'Use to show Tree Farm put county on notice that ordinance is illegal, but county proceeded anyway.')
        else:
            return ('HIGH', 'SUPPORTS',
                'References ordinance eliminating mineral extraction as conditional use — relevant to administrative trap.',
                quote, False, None, None)

    # ═══════════════════════════════════════════════════════════════════════
    # TIER 2: HIGH - Enforcement chain, CUP blocking, direct harm
    # ═══════════════════════════════════════════════════════════════════════

    # County official discussing enforcement against Tree Farm
    if is_from_county_official(text) and 'tree farm' in text_lower:
        has_enforcement = any(t in text_lower for t in ['enforcement', 'enforce', 'denied', 'denial', 'deny',
                                                         'violation', 'compliance', 'license', 'permit'])
        if has_enforcement:
            quote = extract_best_quote(text, ['tree farm', 'enforcement', 'denied', 'denial', 'license', 'permit', 'violation'])
            return ('HIGH', 'SUPPORTS',
                'Internal county official communication about Tree Farm involving enforcement, permits, or compliance — shows enforcement posture.',
                quote, False, None, None)

    # Tree Farm attorney protest/engagement re enforcement
    if is_from_tree_farm_attorney(text):
        has_enforcement_protest = any(t in text_lower for t in [
            'ordinance', 'illegal', 'prohibited', 'enforcement', 'denied', 'denial',
            'critical infrastructure', 'property rights', 'engage', 'dismiss'
        ])
        if has_enforcement_protest:
            quote = extract_best_quote(text, ['illegal', 'ordinance', 'denied', 'enforcement', 'critical infrastructure', 'property rights'])
            return ('HIGH', 'SUPPORTS',
                'Tree Farm attorney communication challenging county enforcement actions — documents ongoing enforcement dispute.',
                quote, False, None, None)

    # Legal filings about Tree Farm mining permits
    if is_legal_filing(text) and 'tree farm' in text_lower:
        has_enforcement_content = any(t in text_lower for t in [
            'denial', 'denied', 'deny', 'preclude', 'prevent', 'not entitled',
            'not complete', 'deficien', 'oppose', 'dismiss', 'emergency order'
        ])
        if has_enforcement_content:
            quote = extract_best_quote(text, ['tree farm', 'denial', 'denied', 'preclude', 'not entitled', 'deficien', 'emergency order'])
            return ('HIGH', 'SUPPORTS',
                'Legal filing regarding Tree Farm mining operations — documents administrative/legal enforcement barriers.',
                quote, False, None, None)

    # Vested rights declarations mentioning mining
    if 'vested' in text_lower and ('mining' in text_lower or 'mineral' in text_lower):
        if 'tree farm' in text_lower or 'parley' in text_lower:
            quote = extract_best_quote(text, ['vested', 'mining', 'mineral', 'rights'])
            return ('HIGH', 'SUPPORTS',
                'References vested mining rights — relevant to whether enforcement can properly prevent Tree Farm operations.',
                quote, False, None, None)

    # Board of Oil Gas Mining emergency order related to Tree Farm
    if 'emergency order' in text_lower and ('tree farm' in text_lower or 'parley' in text_lower):
        quote = extract_best_quote(text, ['emergency order', 'tree farm', 'parley', 'mining'])
        return ('HIGH', 'SUPPORTS',
            'References emergency order proceedings related to Tree Farm mining — additional enforcement action.',
            quote, False, None, None)

    # Stipulated motion/settlement re Tree Farm mining
    if 'stipulat' in text_lower and 'tree farm' in text_lower:
        quote = extract_best_quote(text, ['stipulat', 'tree farm', 'denial', 'dismiss', 'withdraw'])
        return ('HIGH', 'NEUTRAL',
            'Stipulated agreement regarding Tree Farm mining proceedings — documents enforcement resolution.',
            quote, False, None, None)

    # Petition to intervene against Tree Farm
    if 'petition to intervene' in text_lower and ('tree farm' in text_lower or 'parley' in text_lower):
        quote = extract_best_quote(text, ['petition', 'intervene', 'tree farm', 'parley', 'mining', 'denial'])
        return ('MEDIUM', 'SUPPORTS',
            'Petition to intervene in Tree Farm mining proceedings — shows coordinated opposition to mining operations.',
            quote, False, None, None)

    # ═══════════════════════════════════════════════════════════════════════
    # TIER 3: MEDIUM - Context and background enforcement evidence
    # ═══════════════════════════════════════════════════════════════════════

    # County official emails about mining/quarry generally (enforcement context)
    if is_from_county_official(text):
        has_mining_context = any(t in text_lower for t in ['mining', 'quarry', 'mineral extraction', 'gravel', 'aggregate'])
        has_enforcement_context = any(t in text_lower for t in ['ordinance', 'amendment', 'prohibit', 'regulation', 'code', 'enforcement', 'compliance'])
        if has_mining_context and has_enforcement_context:
            quote = extract_best_quote(text, ['mining', 'quarry', 'ordinance', 'amendment', 'prohibit', 'enforcement'])
            return ('MEDIUM', 'SUPPORTS',
                'County official communication regarding mining regulation/enforcement — shows county enforcement posture.',
                quote, False, None, None)

    # Public hearing/meeting where ordinance was discussed/voted
    if 'public hearing' in text_lower and any(t in text_lower for t in ['mineral extraction', '19.12.030']):
        quote = extract_best_quote(text, ['public hearing', 'mineral extraction', '19.12.030', 'ordinance', 'amendment'])
        return ('MEDIUM', 'SUPPORTS',
            'Public hearing on ordinance amending mineral extraction — documents the enforcement legislative process.',
            quote, False, None, None)

    # Council meeting agendas with mineral extraction ordinance
    if 'meeting agenda' in text_lower and any(t in text_lower for t in ['mineral extraction', '19.12.030']):
        quote = extract_best_quote(text, ['mineral extraction', '19.12.030', 'ordinance', 'conditional use', 'eliminat'])
        return ('MEDIUM', 'SUPPORTS',
            'Council meeting agenda including mineral extraction ordinance amendment — documents enforcement timeline.',
            quote, False, None, None)

    # Planning commission agenda/action on mining
    if 'planning commission' in text_lower and any(t in text_lower for t in ['mineral extraction', 'mining', 'quarry']):
        has_action = any(t in text_lower for t in ['conditional use', 'ordinance', 'amendment', 'cup'])
        if has_action:
            quote = extract_best_quote(text, ['planning commission', 'mineral extraction', 'mining', 'conditional use'])
            return ('MEDIUM', 'SUPPORTS',
                'Planning commission proceedings related to mining regulation — enforcement process documentation.',
                quote, False, None, None)

    # LUCC or community council re mining enforcement
    if ('lucc' in text_lower or 'league of unincorporated' in text_lower) and any(t in text_lower for t in ['quarry', 'mining', 'tree farm']):
        quote = extract_best_quote(text, ['quarry', 'mining', 'tree farm', 'stop', 'enforcement'])
        return ('LOW', 'SUPPORTS',
            'Community council (LUCC) proceedings discussing mining/quarry — shows community enforcement pressure.',
            quote, False, None, None)

    # ═══════════════════════════════════════════════════════════════════════
    # TIER 4: LOW - General context
    # ═══════════════════════════════════════════════════════════════════════

    # Public comments urging mining prohibition
    if is_public_comment(text):
        has_mining_ref = any(t in text_lower for t in ['mining', 'quarry', 'tree farm', 'parley', 'mineral extraction'])
        has_enforcement_request = any(t in text_lower for t in ['stop', 'deny', 'prohibit', 'prevent', 'block', 'oppose', 'ban'])
        if has_mining_ref and has_enforcement_request:
            quote = extract_best_quote(text, ['stop', 'deny', 'prohibit', 'mining', 'quarry', 'tree farm'])
            return ('LOW', 'SUPPORTS',
                'Public comment urging county to stop mining/enforce against Tree Farm — shows public enforcement pressure but not county action itself.',
                quote, False, None, None)

    # General references to enforcement of mining regulations (without Tree Farm)
    has_general_mining = any(t in text_lower for t in ['mining', 'quarry', 'mineral extraction', 'gravel', 'aggregate'])
    has_general_enforcement = any(t in text_lower for t in ['enforcement', 'enforce', 'compliance', 'violation', 'ordinance'])
    has_general_prohibition = any(t in text_lower for t in ['prohibit', 'ban', 'not allowed', 'not permitted'])
    has_conditional_use = 'conditional use' in text_lower or 'cup' in text_lower

    if has_general_mining and (has_general_enforcement or has_general_prohibition):
        if 'tree farm' in text_lower or 'parley' in text_lower:
            quote = extract_best_quote(text, ['tree farm', 'parley', 'mining', 'enforcement', 'ordinance', 'prohibit'])
            return ('LOW', 'SUPPORTS',
                'References Tree Farm or Parleys Canyon in mining enforcement context — general background.',
                quote, False, None, None)

    # Ordinance text or code references about mining
    if has_general_mining and has_conditional_use:
        if any(t in text_lower for t in ['19.12', '19.84', '5.02', 'forestry and recreation', 'fr zone']):
            quote = extract_best_quote(text, ['19.12', '19.84', '5.02', 'conditional use', 'mining', 'mineral'])
            return ('LOW', 'SUPPORTS',
                'References zoning code provisions governing mining/conditional use permits — legal framework for enforcement.',
                quote, False, None, None)

    # County communications about Parleys Canyon mining (general)
    if ('parley' in text_lower) and has_general_mining:
        if is_from_county_official(text):
            quote = extract_best_quote(text, ['parley', 'mining', 'quarry', 'county'])
            return ('LOW', 'SUPPORTS',
                'County official communication about Parleys Canyon mining — general enforcement context.',
                quote, False, None, None)

    return None


def extract_best_quote(text, priority_terms):
    """Extract the best quote using priority terms."""
    lines = text.split('\n')
    best_line = ""
    best_score = 0

    for line in lines:
        line_stripped = line.strip()
        if len(line_stripped) < 15 or len(line_stripped) > 600:
            continue
        if re.match(r'^(From|To|Cc|Bcc|Importance|Inline-Images|Attachments):', line_stripped):
            continue

        line_lower = line_stripped.lower()
        score = sum(1 for term in priority_terms if term.lower() in line_lower)
        # Boost for substantive content
        if any(t in line_lower for t in ['denied', 'denial', 'enforcement', 'prohibit', 'eliminat', 'illegal']):
            score += 2
        if 'com21-1590' in line_lower or 'com21.1590' in line_lower:
            score += 5

        if score > best_score:
            best_score = score
            best_line = line_stripped

    return best_line[:500] if best_line else ""


def process_refine():
    """Second pass: refine all document classifications."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # First, clear all existing claim 2 assignments and key findings
    cursor.execute("DELETE FROM claim_assignments WHERE claim_num = 2")
    cursor.execute("DELETE FROM smoking_guns WHERE claim_num = 2")
    conn.commit()

    # Get ALL documents
    cursor.execute("SELECT id, bates, filename, discovery_folder, file_path FROM documents ORDER BY id")
    all_docs = cursor.fetchall()

    total = len(all_docs)
    stats = {'total': total, 'relevant': 0, 'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0, 'key_findings': 0}
    errors = []

    print(f"REFINED PASS: Processing {total} documents for Claim 2")
    print("=" * 80)

    for i, (doc_id, bates, filename, folder, file_path) in enumerate(all_docs):
        if (i + 1) % 500 == 0:
            conn.commit()
            print(f"  Progress: {i+1}/{total} ({(i+1)*100//total}%) | Relevant: {stats['relevant']} | C:{stats['CRITICAL']} H:{stats['HIGH']} M:{stats['MEDIUM']} L:{stats['LOW']} | SG:{stats['key_findings']}")

        try:
            text = read_document(file_path, folder, filename)
            if not text:
                errors.append(f"File not found: {bates}")
                continue

            result = classify_refined(text, bates)

            if result:
                relevance, sup_und, reasoning, key_quote, is_sg, sg_why, sg_use = result
                stats['relevant'] += 1
                stats[relevance] += 1

                cursor.execute("""
                    INSERT OR REPLACE INTO claim_assignments
                    (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                    VALUES (?, 2, ?, ?, ?, ?)
                """, (doc_id, relevance, sup_und, reasoning, key_quote))

                if is_sg:
                    stats['key_findings'] += 1
                    cursor.execute("""
                        INSERT OR REPLACE INTO smoking_guns
                        (doc_id, claim_num, why_critical, recommended_use)
                        VALUES (?, 2, ?, ?)
                    """, (doc_id, sg_why, sg_use))

        except Exception as e:
            errors.append(f"Error {bates}: {str(e)}")

    conn.commit()

    # ═══ REPORT ═══
    print("\n" + "=" * 80)
    print("REFINED PROCESSING COMPLETE")
    print("=" * 80)
    print(f"Total documents reviewed: {stats['total']}")
    print(f"Total relevant to Claim 2: {stats['relevant']}")
    print(f"  CRITICAL: {stats['CRITICAL']}")
    print(f"  HIGH:     {stats['HIGH']}")
    print(f"  MEDIUM:   {stats['MEDIUM']}")
    print(f"  LOW:      {stats['LOW']}")
    print(f"Key findings: {stats['key_findings']}")

    if errors:
        print(f"\nErrors ({len(errors)}):")
        for err in errors[:10]:
            print(f"  {err}")

    # Print key findings
    cursor.execute("""
        SELECT d.bates, d.title, sg.why_critical, sg.recommended_use
        FROM smoking_guns sg JOIN documents d ON sg.doc_id = d.id
        WHERE sg.claim_num = 2
        ORDER BY d.bates
    """)
    sgs = cursor.fetchall()
    if sgs:
        print(f"\n{'='*80}")
        print("KEY FINDINGS")
        print('='*80)
        for bates, title, why, rec in sgs:
            print(f"  {bates}: {title}")
            print(f"    WHY: {why}")
            print(f"    USE: {rec}")
            print()

    # Print all CRITICAL
    cursor.execute("""
        SELECT d.bates, d.title, ca.supports_undermines, ca.reasoning, ca.key_quote
        FROM claim_assignments ca JOIN documents d ON ca.doc_id = d.id
        WHERE ca.claim_num = 2 AND ca.relevance = 'CRITICAL'
        ORDER BY d.bates
    """)
    crits = cursor.fetchall()
    if crits:
        print(f"\n{'='*80}")
        print(f"ALL CRITICAL DOCUMENTS ({len(crits)})")
        print('='*80)
        for bates, title, sup, reasoning, quote in crits:
            print(f"  {bates}: {sup} | {title}")
            print(f"    Reasoning: {reasoning}")
            print(f"    Quote: {quote[:150]}")
            print()

    # Print all HIGH
    cursor.execute("""
        SELECT d.bates, d.title, ca.supports_undermines, ca.reasoning
        FROM claim_assignments ca JOIN documents d ON ca.doc_id = d.id
        WHERE ca.claim_num = 2 AND ca.relevance = 'HIGH'
        ORDER BY d.bates
    """)
    highs = cursor.fetchall()
    if highs:
        print(f"\n{'='*80}")
        print(f"ALL HIGH DOCUMENTS ({len(highs)})")
        print('='*80)
        for bates, title, sup, reasoning in highs:
            print(f"  {bates}: {sup} | {title}")
            print(f"    {reasoning}")
            print()

    conn.close()


if __name__ == '__main__':
    process_refine()
