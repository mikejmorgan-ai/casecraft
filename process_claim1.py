#!/usr/bin/env python3
"""
Process all discovery documents for Claim 1: Declaratory Relief — Ordinance Invalid
Tree Farm LLC v. Salt Lake County
"""

import sqlite3
import os
import re
import sys
import json
from pathlib import Path
from datetime import datetime

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
DATA_DIR = "/home/user/casecraft/data"

# Keywords and patterns for Claim 1 relevance scoring
# Tier 1: CRITICAL indicators - directly about ordinance invalidity/preemption
CRITICAL_PATTERNS = [
    r'17[-\s]*41[-\s]*402',          # Utah Code section
    r'17[-\s]*81[-\s]*402',          # Renumbered section
    r'critical\s+infrastructure\s+material',  # CIM
    r'\bCIM\b',
    r'preempt',                       # preemption language
    r'state\s+preempt',
    r'prohibit.*(?:sand|gravel|rock|aggregate)',  # prohibition of CIM materials
    r'(?:sand|gravel|rock|aggregate).*prohibit',
    r'cannot\s+(?:prohibit|ban)',
    r'(?:ordinance|ord).*(?:invalid|illegal|unlawful|void|preempt)',
    r'(?:invalid|illegal|unlawful|void|preempt).*(?:ordinance|ord)',
    r'staff\s+recommend',            # staff recommendations
    r'remove.*(?:CIM|critical\s+infrastructure|sand.*gravel)',
    r'(?:CIM|critical\s+infrastructure|sand.*gravel).*remove',
    r'long\s+(?:been\s+)?prohibit',  # "long prohibited" talking point
    r'always\s+(?:been\s+)?prohibit',
    r'Ombudsman',                     # Property Rights Ombudsman
    r'false\s+(?:statement|claim|representation)',
]

# Tier 2: HIGH indicators - predetermined outcome, ignored warnings
HIGH_PATTERNS = [
    r'predetermin',
    r'(?:serial|secret)\s+meeting',
    r'ex\s+parte',
    r'(?:DA|district\s+attorney|Sim\s+Gill).*(?:opinion|memo|legal|advice)',
    r'(?:opinion|memo|legal|advice).*(?:DA|district\s+attorney|Sim\s+Gill)',
    r'(?:Zach|Zachary)\s+Shaw',       # County staff
    r'(?:Wendy)\s+Thomas',            # DA staff
    r'legal\s+(?:opinion|analysis|warning|risk|concern)',
    r'(?:warn|warning|caution).*(?:ordinance|CIM|preempt)',
    r'(?:ordinance|CIM|preempt).*(?:warn|warning|caution)',
    r'(?:no\s+)?(?:legal\s+)?authority',
    r'(?:cannot|can\s*not)\s+(?:enforce|adopt|pass)',
    r'planning\s+(?:commission|staff)',
    r'public\s+(?:notice|hearing|comment)',
    r'(?:council|commission)\s+(?:meeting|session|vote)',
    r'(?:vote|voted|voting).*(?:ordinance|amendment)',
    r'legislative\s+(?:body|action|process)',
    r'(?:quarry|mine|mining|extraction|excavat)',
    r'(?:sand|gravel|rock)\s+(?:and[/]or|aggregate)',
    r'aggregate',
    r'(?:Chapter|Title)\s+19',
    r'(?:Chapter|Title)\s+17[-\s]*41',
    r'mineral\s+(?:extraction|operation|right)',
]

# Tier 3: MEDIUM indicators - procedural issues, ordinance process
MEDIUM_PATTERNS = [
    r'(?:ordinance|amendment|code\s+change)',
    r'(?:zone|zoning|land\s+use)',
    r'(?:MU|MPC|FC|FR)[-\s]*zone',
    r'(?:Parleys|Parley)',
    r'(?:Tree\s+Farm)',
    r'(?:Blaes|Dina)',
    r'(?:Leary|Patrick)',
    r'(?:Stringham)',
    r'(?:Snyder)',
    r'(?:Wilson)',
    r'(?:Robinson)',
    r'(?:Granato)',
    r'(?:Burdick)',
    r'(?:Trishelle)',
    r'permitted\s+use',
    r'conditional\s+use',
    r'(?:development|building)\s+(?:code|standard)',
    r'(?:unincorporated)\s+(?:area|county)',
    r'(?:Foothill|Canyons)',
    r'(?:resident|neighbor|community)\s+(?:concern|complaint|opposition)',
    r'(?:public\s+input|community\s+meeting)',
]

# Known key figures
KEY_PEOPLE = {
    'shaw': 'Zach Shaw (County Planning)',
    'blaes': 'Dina Blaes (ORD Director)',
    'leary': 'Patrick Leary (County Manager)',
    'stringham': 'Stringham (Planning)',
    'thomas': 'Wendy Thomas (DA)',
    'gill': 'Sim Gill (District Attorney)',
    'snyder': 'Snyder',
    'wilson': 'Wilson',
    'robinson': 'Robinson',
    'granato': 'Granato',
    'burdick': 'Burdick',
    'trishelle': 'Trishelle',
    'maffly': 'Brian Maffly (Tribune)',
    'stewart': 'Jim Stewart',
    'harper': 'Harper',
    'bradley': 'Bradley',
    'debry': 'DeBry',
}


def extract_metadata(content, filename):
    """Extract basic metadata from document content."""
    title = None
    date = None
    doc_type = None

    # Try to extract date
    date_patterns = [
        r'Date:\s*([A-Z][a-z]+,?\s+\d{1,2}\s+[A-Z][a-z]+\s+\d{4})',
        r'Date:\s*(\d{1,2}/\d{1,2}/\d{2,4})',
        r'Date:\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})',
        r'(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})',
        r'(\d{1,2}/\d{1,2}/\d{2,4})',
        r'([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})',
    ]
    for pat in date_patterns:
        m = re.search(pat, content[:2000])
        if m:
            date = m.group(1).strip()
            break

    # Try to extract subject/title
    subj_match = re.search(r'Subject:\s*(?:RE:|FW:|Fwd:)?\s*(.+?)(?:\n|$)', content[:2000])
    if subj_match:
        title = subj_match.group(1).strip()[:200]

    # Determine document type
    if re.search(r'^From:.*\nTo:', content[:500], re.MULTILINE):
        doc_type = 'email'
    elif re.search(r'MEETING\s+(?:MINUTES|AGENDA|NOTES)', content[:1000], re.IGNORECASE):
        doc_type = 'meeting_minutes'
    elif re.search(r'ORDINANCE', content[:1000], re.IGNORECASE):
        doc_type = 'ordinance'
    elif re.search(r'(?:MEMORANDUM|MEMO)', content[:1000], re.IGNORECASE):
        doc_type = 'memo'
    elif re.search(r'(?:RESOLUTION)', content[:1000], re.IGNORECASE):
        doc_type = 'resolution'
    elif re.search(r'(?:AGENDA)', content[:1000], re.IGNORECASE):
        doc_type = 'agenda'
    elif re.search(r'(?:STAFF\s+REPORT)', content[:1000], re.IGNORECASE):
        doc_type = 'staff_report'
    else:
        doc_type = 'document'

    return title, date, doc_type


def score_document(content, filename):
    """Score a document's relevance to Claim 1."""
    content_lower = content.lower()

    critical_hits = []
    high_hits = []
    medium_hits = []

    # Check critical patterns
    for pat in CRITICAL_PATTERNS:
        matches = re.findall(pat, content_lower)
        if matches:
            critical_hits.append((pat, len(matches)))

    # Check high patterns
    for pat in HIGH_PATTERNS:
        matches = re.findall(pat, content_lower)
        if matches:
            high_hits.append((pat, len(matches)))

    # Check medium patterns
    for pat in MEDIUM_PATTERNS:
        matches = re.findall(pat, content_lower)
        if matches:
            medium_hits.append((pat, len(matches)))

    # Calculate weighted score
    score = len(critical_hits) * 10 + len(high_hits) * 3 + len(medium_hits) * 1

    # Determine relevance level
    if len(critical_hits) >= 2 or score >= 20:
        relevance = 'CRITICAL'
    elif len(critical_hits) >= 1 or score >= 12:
        relevance = 'HIGH'
    elif len(high_hits) >= 2 or score >= 6:
        relevance = 'MEDIUM'
    elif score >= 3:
        relevance = 'LOW'
    else:
        relevance = None  # Not relevant

    return relevance, score, critical_hits, high_hits, medium_hits


def extract_key_quote(content, relevance_hits):
    """Extract the most relevant quote from the document."""
    lines = content.split('\n')
    best_quote = None
    best_score = 0

    # Look for lines that contain critical/high keywords
    all_patterns = []
    for pat, count in relevance_hits:
        all_patterns.append(pat)

    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if len(line_stripped) < 10 or len(line_stripped) > 500:
            continue

        line_score = 0
        for pat in all_patterns:
            if re.search(pat, line_stripped.lower()):
                line_score += 1

        if line_score > best_score:
            best_score = line_score
            # Get some context
            start = max(0, i - 1)
            end = min(len(lines), i + 2)
            best_quote = ' '.join(l.strip() for l in lines[start:end] if l.strip())[:500]

    return best_quote


def determine_supports_undermines(content, relevance):
    """Determine if document supports or undermines Claim 1."""
    content_lower = content.lower()

    # Strong indicators of SUPPORT for invalidity claim
    support_indicators = [
        r'(?:cannot|can\s*not|shall\s+not)\s+prohibit',
        r'preempt',
        r'(?:invalid|illegal|unlawful|void)',
        r'staff\s+recommend.*(?:remov|delet|strik)',
        r'(?:remov|delet|strik).*(?:sand|gravel|aggregate|CIM)',
        r'(?:violat).*(?:state\s+(?:law|code|statute))',
        r'false\s+(?:statement|claim)',
        r'long\s+(?:been\s+)?prohibit',  # false talking point
        r'predetermin',
        r'(?:serial|secret)\s+meeting',
    ]

    # Indicators that UNDERMINE the claim
    undermine_indicators = [
        r'(?:valid|lawful|legal|proper|authority)\s+(?:to\s+)?(?:adopt|enact|pass|regulate)',
        r'(?:health|safety|welfare)\s+(?:concern|protect|justify)',
        r'(?:not|no)\s+preempt',
        r'(?:distinguish|different|not\s+the\s+same)',
        r'within\s+(?:county|local)\s+(?:authority|power|jurisdiction)',
        r'(?:police\s+power|regulatory\s+authority)',
    ]

    support_count = sum(1 for pat in support_indicators if re.search(pat, content_lower))
    undermine_count = sum(1 for pat in undermine_indicators if re.search(pat, content_lower))

    if support_count > undermine_count:
        return 'SUPPORTS'
    elif undermine_count > support_count:
        return 'UNDERMINES'
    else:
        return 'SUPPORTS'  # Default for relevant docs - most county docs support by showing process issues


def generate_reasoning(content, relevance, critical_hits, high_hits, medium_hits, title, doc_type):
    """Generate reasoning for why document is relevant."""
    reasons = []

    content_lower = content.lower()

    # Build reasoning based on what was found
    if any('17' in pat for pat, _ in critical_hits):
        reasons.append("References Utah Code 17-41-402/17-81-402 (CIM preemption statute)")

    if any('critical' in pat or 'cim' in pat.lower() for pat, _ in critical_hits):
        reasons.append("Discusses Critical Infrastructure Materials")

    if any('preempt' in pat for pat, _ in critical_hits):
        reasons.append("Discusses state preemption of local ordinance")

    if any('prohibit' in pat for pat, _ in critical_hits):
        reasons.append("Addresses prohibition of sand/gravel/aggregate extraction")

    if any('staff' in pat for pat, _ in critical_hits):
        reasons.append("Contains staff recommendations regarding CIM language")

    if any('remov' in pat for pat, _ in critical_hits):
        reasons.append("Discusses removing CIM/aggregate language from ordinance")

    if any('long' in pat or 'always' in pat for pat, _ in critical_hits):
        reasons.append("Contains 'long prohibited' talking point language")

    if any('ombudsman' in pat for pat, _ in critical_hits):
        reasons.append("References Property Rights Ombudsman")

    if any('false' in pat for pat, _ in critical_hits):
        reasons.append("Contains/references false statements")

    if any('invalid' in pat or 'illegal' in pat or 'void' in pat for pat, _ in critical_hits):
        reasons.append("Questions ordinance validity/legality")

    if any('predetermin' in pat for pat, _ in high_hits):
        reasons.append("Suggests predetermined outcome")

    if any('serial' in pat or 'ex parte' in pat for pat, _ in high_hits):
        reasons.append("Involves serial meetings or ex parte contacts")

    if any('da' in pat.lower() or 'gill' in pat.lower() or 'thomas' in pat.lower() for pat, _ in high_hits):
        reasons.append("Involves DA/legal office communications about ordinance")

    if any('warn' in pat for pat, _ in high_hits):
        reasons.append("Contains warnings about ordinance legality")

    if any('quarry' in pat or 'mine' in pat or 'extract' in pat for pat, _ in high_hits):
        reasons.append("Discusses mining/quarrying/extraction operations")

    if any('sand' in pat or 'aggregate' in pat for pat, _ in high_hits):
        reasons.append("References sand, gravel, rock aggregate materials")

    if not reasons:
        if high_hits:
            reasons.append(f"Contains {len(high_hits)} high-relevance keyword matches related to ordinance process")
        if medium_hits:
            reasons.append(f"Contains {len(medium_hits)} medium-relevance keyword matches")

    return '; '.join(reasons) if reasons else "General relevance to ordinance process"


def generate_summary(content, title, doc_type, date):
    """Generate a brief summary of the document."""
    lines = [l.strip() for l in content.split('\n') if l.strip()]

    if doc_type == 'email':
        # Get From, To, Subject
        from_match = re.search(r'From:\s*"?([^"<\n]+)', content[:1000])
        to_match = re.search(r'To:\s*"?([^"<\n]+)', content[:1000])
        sender = from_match.group(1).strip() if from_match else 'Unknown'
        recipient = to_match.group(1).strip() if to_match else 'Unknown'
        subj = title or 'No subject'

        # Get first substantive line after headers
        body_start = False
        body_lines = []
        for line in lines:
            if body_start and line and not line.startswith(('From:', 'To:', 'Subject:', 'Date:', 'Importance:', 'Inline-Images:', 'CC:', 'Bcc:')):
                body_lines.append(line)
                if len(body_lines) >= 3:
                    break
            if line == '' or (body_start == False and not line.startswith(('From:', 'To:', 'Subject:', 'Date:', 'Importance:', 'Inline-Images:', 'CC:', 'Bcc:'))):
                body_start = True

        body_preview = ' '.join(body_lines)[:200] if body_lines else ''
        return f"Email from {sender} to {recipient} re: {subj}. {body_preview}"[:500]
    else:
        # Get first few meaningful lines
        meaningful = [l for l in lines[:20] if len(l) > 15][:5]
        return ' '.join(meaningful)[:500]


def is_key_finding(content, relevance, critical_hits):
    """Check if document qualifies as a key finding for Claim 1."""
    content_lower = content.lower()

    key_finding_criteria = [
        # Staff explicitly recommending removal of CIM language
        (r'(?:recommend|suggest|advis).*(?:remov|delet|strik).*(?:sand|gravel|aggregate|CIM|critical\s+infrastructure)',
         "Staff recommended removing CIM language from ordinance"),
        # Explicit admission ordinance violates state law
        (r'(?:violat|conflict|preempt|inconsistent).*(?:state\s+(?:law|code|statute)|17[-\s]*41|17[-\s]*81)',
         "Admission that ordinance conflicts with state law"),
        # Cannot prohibit CIM
        (r'(?:cannot|can\s*not|shall\s+not|may\s+not)\s+prohibit.*(?:critical|CIM|sand|gravel|aggregate)',
         "Statement that county cannot prohibit CIM operations"),
        # False statements to Ombudsman
        (r'(?:ombudsman).*(?:false|incorrect|mislead|inaccurat)',
         "False statements to Property Rights Ombudsman"),
        # Predetermined outcome evidence
        (r'(?:already\s+decid|predetermin|outcome.*(?:before|decided|certain))',
         "Evidence of predetermined outcome"),
        # DA refusing to address preemption merits
        (r'(?:DA|district\s+attorney|gill|thomas).*(?:not\s+address|avoid|ignor|refus|declin).*(?:preempt|merit)',
         "DA declining to address preemption on merits"),
    ]

    reasons = []
    for pat, reason in key_finding_criteria:
        if re.search(pat, content_lower):
            reasons.append(reason)

    return reasons


def process_batch(folder_name, conn):
    """Process all documents in a discovery folder."""
    c = conn.cursor()
    folder_path = os.path.join(DATA_DIR, folder_name)

    # Get all documents in this folder from the database
    c.execute("SELECT id, bates, filename, file_path, line_count FROM documents WHERE discovery_folder = ? ORDER BY id", (folder_name,))
    docs = c.fetchall()

    stats = {
        'total': len(docs),
        'reviewed': 0,
        'relevant': 0,
        'critical': 0,
        'high': 0,
        'medium': 0,
        'low': 0,
        'key_findings': 0,
        'supports': 0,
        'undermines': 0,
        'neutral': 0,
        'errors': 0,
    }

    for doc_id, bates, filename, file_path, line_count in docs:
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()

            if not content.strip():
                # Empty file
                c.execute("UPDATE documents SET reviewed = 1, type = 'empty', summary = 'Empty document' WHERE id = ?", (doc_id,))
                stats['reviewed'] += 1
                continue

            # Extract metadata
            title, date, doc_type = extract_metadata(content, filename)

            # Generate summary
            summary = generate_summary(content, title, doc_type, date)

            # Score for Claim 1 relevance
            relevance, score, critical_hits, high_hits, medium_hits = score_document(content, filename)

            # Update document metadata
            c.execute("UPDATE documents SET reviewed = 1, title = ?, date = ?, type = ?, summary = ? WHERE id = ?",
                      (title, date, doc_type, summary, doc_id))

            stats['reviewed'] += 1

            if relevance:
                stats['relevant'] += 1
                stats[relevance.lower()] += 1

                # Determine supports/undermines
                all_hits = critical_hits + high_hits + medium_hits
                supports = determine_supports_undermines(content, relevance)
                stats[supports.lower()] += 1

                # Generate reasoning
                reasoning = generate_reasoning(content, relevance, critical_hits, high_hits, medium_hits, title, doc_type)

                # Extract key quote
                key_quote = extract_key_quote(content, all_hits)

                # Insert claim assignment
                c.execute("""INSERT OR REPLACE INTO claim_assignments
                           (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                           VALUES (?, 1, ?, ?, ?, ?)""",
                          (doc_id, relevance, supports, reasoning, key_quote))

                # Check for key findings
                sg_reasons = is_key_finding(content, relevance, critical_hits)
                if sg_reasons and relevance in ('CRITICAL', 'HIGH'):
                    stats['key_findings'] += 1
                    why_critical = '; '.join(sg_reasons)
                    recommended_use = f"Use in motion for summary judgment / trial exhibit. {why_critical}"
                    c.execute("""INSERT OR REPLACE INTO smoking_guns
                               (doc_id, claim_num, why_critical, recommended_use)
                               VALUES (?, 1, ?, ?)""",
                              (doc_id, why_critical, recommended_use))

            # Commit every 100 docs
            if stats['reviewed'] % 100 == 0:
                conn.commit()

        except Exception as e:
            stats['errors'] += 1
            print(f"  ERROR processing {bates}: {e}", file=sys.stderr)

    conn.commit()
    return stats


def main():
    conn = sqlite3.connect(DB_PATH)

    # Process each folder
    total_stats = {
        'total': 0, 'reviewed': 0, 'relevant': 0,
        'critical': 0, 'high': 0, 'medium': 0, 'low': 0,
        'key_findings': 0, 'supports': 0, 'undermines': 0, 'neutral': 0, 'errors': 0,
    }

    for folder_num in range(1, 7):
        folder_name = f"discovery-{folder_num:04d}"
        print(f"\n{'='*60}")
        print(f"Processing {folder_name}...")
        print(f"{'='*60}")

        stats = process_batch(folder_name, conn)

        print(f"  Reviewed: {stats['reviewed']}/{stats['total']}")
        print(f"  Relevant: {stats['relevant']}")
        print(f"    CRITICAL: {stats['critical']}")
        print(f"    HIGH: {stats['high']}")
        print(f"    MEDIUM: {stats['medium']}")
        print(f"    LOW: {stats['low']}")
        print(f"  Key findings: {stats['key_findings']}")
        print(f"  Errors: {stats['errors']}")

        for key in total_stats:
            total_stats[key] += stats[key]

    # Final summary
    print(f"\n{'='*60}")
    print(f"FINAL SUMMARY - Claim 1 Review")
    print(f"{'='*60}")
    print(f"Total documents: {total_stats['total']}")
    print(f"Total reviewed: {total_stats['reviewed']}")
    print(f"Total relevant: {total_stats['relevant']}")
    print(f"  CRITICAL: {total_stats['critical']}")
    print(f"  HIGH: {total_stats['high']}")
    print(f"  MEDIUM: {total_stats['medium']}")
    print(f"  LOW: {total_stats['low']}")
    print(f"Key findings: {total_stats['key_findings']}")
    print(f"Supports claim: {total_stats['supports']}")
    print(f"Undermines claim: {total_stats['undermines']}")
    print(f"Neutral: {total_stats['neutral']}")
    print(f"Errors: {total_stats['errors']}")

    conn.close()


if __name__ == '__main__':
    main()
