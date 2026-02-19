#!/usr/bin/env python3
"""
Exhaustive Claim 1 (Declaratory Relief - Ordinance Invalid) analysis for
discovery-0004, discovery-0005, discovery-0006.

Reads every document file, scores for Claim 1 relevance, writes to master.db.
"""

import sqlite3
import os
import re
import json
import sys

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
DATA_ROOT = "/home/user/casecraft/data"
FOLDERS = ["discovery-0004", "discovery-0005", "discovery-0006"]

# ── keyword tiers for Claim 1 ──────────────────────────────────────────
# CRITICAL indicators: direct proof ordinance violates 17-41-402(6), staff
# recommended removing CIM language, internal admissions of illegality
CRITICAL_PATTERNS = [
    r'17[\-\s]*41[\-\s]*402',           # the preemption statute
    r'preempt',                          # preemption language
    r'prohibit.*CIM|CIM.*prohibit',      # CIM prohibition nexus
    r'cannot\s+prohibit|can\s*not\s+prohibit|may\s+not\s+prohibit',
    r'staff\s+recommend.*remov',         # staff recommended removing CIM
    r'remove.*CIM|CIM.*remove',          # removing CIM language
    r'remov.*sand.*gravel|remov.*aggregate|remov.*mineral\s+extract',
    r'illegal|illegality|unlawful|invalid|void',
    r'violat.*state\s+law|violat.*utah\s+code|violat.*statute',
    r'state\s+preemption|preempted\s+by\s+state',
    r'cannot\s+adopt.*ordinance|cannot\s+enact',
    r'conflict.*with\s+state|conflict.*utah\s+code',
    r'exceed.*authority|ultra\s*vires',
]

# HIGH indicators: predetermined outcome, ignored legal warnings, false statements
HIGH_PATTERNS = [
    r'predetermin|pre[\-\s]determin',
    r'foregone\s+conclusion',
    r'outcome.*already.*decided|decided.*before',
    r'serial\s+meeting|walking\s+quorum',
    r'ex\s+parte',
    r'ombudsman.*false|false.*ombudsman',
    r'long\s+prohibited|always\s+prohibited|historically\s+prohibited',
    r'talking\s+point',
    r'never\s+allowed|never\s+permitted',
    r'false\s+statement|misrepresent',
    r'DA\s+.*opinion|district\s+attorney.*opinion|legal\s+opinion',
    r'legal\s+risk|litigation\s+risk|legal\s+exposure',
    r'warned|warning.*legal|counsel.*advis|attorney.*advis',
    r'bad\s+faith',
    r'sham|pretextual|pretext',
    r'open\s+.*meeting|meeting.*violation|OPMA',
    r'notice\s+defect|notice.*inadequat|public\s+notice.*fail',
    r'ignore.*staff|disregard.*staff|override.*staff|staff.*overrul',
    r'ignore.*recommend|disregard.*recommend',
]

# MEDIUM indicators: procedural irregularities, ex parte contacts about ordinance
MEDIUM_PATTERNS = [
    r'ordinance.*amend|amend.*ordinance',
    r'text\s+amendment|zoning.*amendment',
    r'19[\.\-]12|chapter\s*19',          # zoning chapter references
    r'forestry.*recreation.*zone|FR[\-\s]+zone',
    r'sand[\s,]*gravel|rock\s+aggregate|mineral\s+extract',
    r'conditional\s+use|CUP',
    r'extracti(on|ve)',
    r'mining.*ordinance|ordinance.*mining',
    r'public\s+hearing|public\s+comment',
    r'council\s+vote|council.*approv|council.*adopt',
    r'april\s+2022|ordinance.*2022',
    r'permitted\s+use|not\s+permitted',
    r'land\s+use.*authorit|county.*authority',
    r'vested\s+right|nonconforming',
    r'due\s+process',
    r'property.*agriculture.*protection|agricultural.*protection',
    r'PAMPA|IAMP',
]

# LOW indicators: tangential references
LOW_PATTERNS = [
    r'\bCIM\b',
    r'critical\s+infrastructure',
    r'mining|quarr[yi]',
    r'gravel\s+pit|pit\s+mine',
    r'reclamation|DOGM|division\s+of\s+oil',
    r'tree\s+farm',
    r'Dimpl.*ordinance|Copper\s+Hills|white\s+city',
]


def read_file(filepath):
    """Read file content, return as string."""
    try:
        with open(filepath, 'r', errors='replace') as f:
            return f.read()
    except Exception as e:
        return ""


def score_document(text):
    """
    Score document for Claim 1 relevance.
    Returns (relevance_level, supports_undermines, reasoning, key_quote, is_smoking_gun, sg_why, sg_use, doc_meta)
    """
    text_lower = text.lower()
    text_upper = text  # preserve case for quotes

    if len(text_lower.strip()) < 10:
        return None  # empty/trivial document

    critical_hits = []
    high_hits = []
    medium_hits = []
    low_hits = []

    for pat in CRITICAL_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            critical_hits.append((pat, len(matches)))

    for pat in HIGH_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            high_hits.append((pat, len(matches)))

    for pat in MEDIUM_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            medium_hits.append((pat, len(matches)))

    for pat in LOW_PATTERNS:
        matches = re.findall(pat, text_lower)
        if matches:
            low_hits.append((pat, len(matches)))

    # Calculate composite score
    score = (len(critical_hits) * 10 + len(high_hits) * 5 +
             len(medium_hits) * 2 + len(low_hits) * 1)

    if score == 0:
        return None  # not relevant

    # Determine relevance level
    if critical_hits and score >= 15:
        relevance = "CRITICAL"
    elif critical_hits or (high_hits and score >= 10):
        relevance = "HIGH"
    elif high_hits or (medium_hits and score >= 6):
        relevance = "MEDIUM"
    elif medium_hits or score >= 3:
        relevance = "LOW"
    else:
        return None  # below threshold

    # Determine supports/undermines
    # Documents supporting the County's position undermine our claim
    undermine_patterns = [
        r'valid.*ordinance|ordinance.*valid|lawful.*ordinance',
        r'within.*authority|proper.*authority',
        r'not\s+preempted',
        r'county.*right\s+to|county.*power\s+to',
        r'health.*safety.*welfare',
        r'police\s+power',
        r'zoning\s+authority|land\s+use\s+authority',
    ]

    support_patterns = [
        r'preempt|prohibit.*CIM|CIM.*prohibit|17[\-\s]*41[\-\s]*402',
        r'cannot\s+prohibit|may\s+not\s+prohibit',
        r'staff\s+recommend.*remov|remove.*CIM',
        r'illegal|invalid|unlawful|ultra\s*vires',
        r'predetermin|foregone|serial\s+meeting|ex\s+parte',
        r'false\s+statement|misrepresent|bad\s+faith',
        r'long\s+prohibited.*false|never.*prohibited.*before',
        r'violat.*state\s+law|exceed.*authority',
    ]

    support_score = sum(1 for p in support_patterns if re.search(p, text_lower))
    undermine_score = sum(1 for p in undermine_patterns if re.search(p, text_lower))

    if support_score > undermine_score:
        su = "SUPPORTS"
    elif undermine_score > support_score:
        su = "UNDERMINES"
    else:
        su = "SUPPORTS"  # default for ambiguous

    # Extract best quote (line with highest density of relevant terms)
    lines = text_upper.split('\n')
    best_line = ""
    best_line_score = 0
    for line in lines:
        if len(line.strip()) < 10:
            continue
        line_lower = line.lower()
        ls = 0
        for pat in CRITICAL_PATTERNS + HIGH_PATTERNS:
            if re.search(pat, line_lower):
                ls += 3
        for pat in MEDIUM_PATTERNS:
            if re.search(pat, line_lower):
                ls += 1
        if ls > best_line_score:
            best_line_score = ls
            best_line = line.strip()

    key_quote = best_line[:500] if best_line else ""

    # Build reasoning
    reasons = []
    if critical_hits:
        reasons.append(f"CRITICAL matches: {', '.join(p for p,c in critical_hits[:3])}")
    if high_hits:
        reasons.append(f"HIGH matches: {', '.join(p for p,c in high_hits[:3])}")
    if medium_hits:
        reasons.append(f"Contains ordinance/CIM/extraction references")

    reasoning = "; ".join(reasons)[:1000]

    # Smoking gun detection - very high bar
    is_sg = False
    sg_why = ""
    sg_use = ""

    if relevance == "CRITICAL":
        # Check for true smoking gun content
        sg_indicators = [
            (r'staff\s+recommend.*remov.*CIM|staff.*advis.*remov.*sand.*gravel',
             "Staff explicitly recommended removing CIM/sand-gravel language from ordinance",
             "Motion to compel / summary judgment exhibit showing County ignored its own staff"),
            (r'cannot\s+prohibit.*CIM|preempt.*CIM.*extraction|17[\-\s]*41[\-\s]*402.*prohibit',
             "Internal acknowledgment that state law prohibits banning CIM operations",
             "Key exhibit proving County knew ordinance violated state preemption"),
            (r'predetermin.*outcome|outcome.*already.*decided|council.*already.*decided',
             "Admission that ordinance outcome was predetermined before public process",
             "Due process / procedural challenge exhibit"),
            (r'false.*ombudsman|misrepresent.*ombudsman|false.*statement.*state',
             "False statements to state Ombudsman about ordinance validity",
             "Bad faith exhibit for damages / attorney fees claim"),
            (r'long\s+prohibited.*false|never.*actually.*prohibited|not.*historically.*prohibited',
             "Internal admission that 'long prohibited' talking point was false",
             "Credibility impeachment exhibit for County witnesses"),
            (r'illegal.*ordinance|ordinance.*illegal|void.*ordinance|ordinance.*void|unlawful.*ban',
             "Internal admission ordinance is illegal or void",
             "Summary judgment exhibit on invalidity"),
        ]
        for pat, why, use in sg_indicators:
            if re.search(pat, text_lower):
                is_sg = True
                sg_why = why
                sg_use = use
                break

    # Generate document metadata
    doc_type = classify_doc_type(text_lower, text_upper)
    doc_date = extract_date(text_upper)
    doc_title = extract_title(lines)
    doc_summary = generate_summary(text_upper, key_quote)

    return (relevance, su, reasoning, key_quote, is_sg, sg_why, sg_use,
            doc_title, doc_date, doc_type, doc_summary)


def classify_doc_type(text_lower, text_upper):
    """Classify document type."""
    if re.search(r'from:|to:|subject:|sent:', text_lower):
        return "email"
    if re.search(r'event.*start|calendar|webex|meeting.*number', text_lower):
        return "calendar_entry"
    if re.search(r'ordinance.*no\.|be\s+it\s+ordained|section\s+\d+', text_lower):
        return "ordinance"
    if re.search(r'dear\s+(council|mayor|ms\.|mr\.)|public\s+comment', text_lower):
        return "public_comment"
    if re.search(r'minutes\s+of|meeting\s+minutes|roll\s+call', text_lower):
        return "meeting_minutes"
    if re.search(r'memorandum|memo\s+to|inter-?office', text_lower):
        return "memo"
    if re.search(r'declaration|affidavit|sworn|under\s+penalty', text_lower):
        return "declaration"
    if re.search(r'deposition|Q\.\s+|A\.\s+|BY\s+MR\.|BY\s+MS\.', text_lower):
        return "deposition"
    if re.search(r'staff\s+report|planning.*commission|recommendation', text_lower):
        return "staff_report"
    if re.search(r'resolution\s+no\.|resolution\s+of', text_lower):
        return "resolution"
    if re.search(r'agenda|item\s+\d+\.\d+', text_lower):
        return "agenda"
    if re.search(r'map|figure|diagram|exhibit', text_lower) and len(text_lower) < 200:
        return "exhibit"
    return "document"


def extract_date(text):
    """Extract date from document."""
    # Try common date patterns
    patterns = [
        r'(\d{4}-\d{2}-\d{2})',
        r'((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})',
        r'(\d{1,2}/\d{1,2}/\d{4})',
        r'Date:\s*(.{10,30}?)[\n\r]',
        r'Sent:\s*(.{10,40}?)[\n\r]',
    ]
    for pat in patterns:
        m = re.search(pat, text[:2000])
        if m:
            return m.group(1).strip()[:50]
    return None


def extract_title(lines):
    """Extract title from first meaningful line."""
    for line in lines[:10]:
        stripped = line.strip()
        if len(stripped) > 5 and not stripped.startswith('{') and not stripped.startswith('--'):
            return stripped[:200]
    return None


def generate_summary(text, key_quote):
    """Generate brief summary."""
    # Use first ~300 chars of meaningful text
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 10]
    summary = ' '.join(lines[:5])[:500]
    return summary


def process_all():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    stats = {
        'total': 0, 'reviewed': 0, 'relevant': 0,
        'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0,
        'smoking_guns': 0, 'supports': 0, 'undermines': 0,
        'empty': 0, 'not_relevant': 0,
    }

    smoking_guns_list = []
    critical_docs = []

    for folder in FOLDERS:
        folder_path = os.path.join(DATA_ROOT, folder)

        # Get all documents for this folder from DB
        c.execute("SELECT id, bates, filename, file_path FROM documents WHERE discovery_folder=? ORDER BY bates", (folder,))
        docs = c.fetchall()

        print(f"\n{'='*60}")
        print(f"Processing {folder}: {len(docs)} documents")
        print(f"{'='*60}")

        folder_relevant = 0

        for i, (doc_id, bates, filename, file_path) in enumerate(docs):
            stats['total'] += 1

            # Read actual file
            full_path = os.path.join(folder_path, filename)
            if not os.path.exists(full_path) and file_path:
                full_path = file_path

            text = read_file(full_path)

            if len(text.strip()) < 10:
                stats['empty'] += 1
                # Mark as reviewed but not relevant
                c.execute("UPDATE documents SET reviewed=1 WHERE id=?", (doc_id,))
                stats['reviewed'] += 1
                continue

            result = score_document(text)

            if result is None:
                stats['not_relevant'] += 1
                stats['reviewed'] += 1
                # Remove any prior claim 1 assignment for this doc (fresh review)
                c.execute("DELETE FROM claim_assignments WHERE doc_id=? AND claim_num=1", (doc_id,))
                c.execute("DELETE FROM smoking_guns WHERE doc_id=? AND claim_num=1", (doc_id,))
                c.execute("UPDATE documents SET reviewed=1 WHERE id=?", (doc_id,))
                continue

            (relevance, su, reasoning, key_quote, is_sg, sg_why, sg_use,
             doc_title, doc_date, doc_type, doc_summary) = result

            stats['reviewed'] += 1
            stats['relevant'] += 1
            stats[relevance] += 1
            folder_relevant += 1
            if su == "SUPPORTS":
                stats['supports'] += 1
            else:
                stats['undermines'] += 1

            # Upsert claim assignment
            c.execute("DELETE FROM claim_assignments WHERE doc_id=? AND claim_num=1", (doc_id,))
            c.execute("""INSERT INTO claim_assignments
                        (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                        VALUES (?, 1, ?, ?, ?, ?)""",
                     (doc_id, relevance, su, reasoning, key_quote))

            # Update document metadata
            c.execute("""UPDATE documents SET reviewed=1,
                        title=COALESCE(?, title),
                        date=COALESCE(?, date),
                        type=COALESCE(?, type),
                        summary=COALESCE(?, summary)
                        WHERE id=?""",
                     (doc_title, doc_date, doc_type, doc_summary, doc_id))

            if is_sg:
                stats['smoking_guns'] += 1
                c.execute("DELETE FROM smoking_guns WHERE doc_id=? AND claim_num=1", (doc_id,))
                c.execute("""INSERT INTO smoking_guns
                            (doc_id, claim_num, why_critical, recommended_use)
                            VALUES (?, 1, ?, ?)""",
                         (doc_id, sg_why, sg_use))
                smoking_guns_list.append((bates, sg_why, key_quote[:200]))
                print(f"  *** SMOKING GUN: {bates} - {sg_why}")

            if relevance == "CRITICAL":
                critical_docs.append((bates, reasoning[:100], key_quote[:150]))

            # Progress report every 100 docs
            if (i + 1) % 100 == 0:
                print(f"  [{folder}] Processed {i+1}/{len(docs)} | Relevant so far: {folder_relevant}")
                conn.commit()

        print(f"  [{folder}] COMPLETE: {len(docs)} processed, {folder_relevant} relevant")
        conn.commit()

    conn.commit()
    conn.close()

    return stats, smoking_guns_list, critical_docs


if __name__ == "__main__":
    print("Starting exhaustive Claim 1 analysis...")
    print(f"Folders: {FOLDERS}")
    print(f"Database: {DB_PATH}")

    stats, sgs, crits = process_all()

    print("\n" + "="*60)
    print("FINAL RESULTS")
    print("="*60)
    print(f"Total documents processed:  {stats['total']}")
    print(f"Documents reviewed:         {stats['reviewed']}")
    print(f"Empty/trivial documents:    {stats['empty']}")
    print(f"Not relevant to Claim 1:    {stats['not_relevant']}")
    print(f"Relevant to Claim 1:        {stats['relevant']}")
    print(f"  CRITICAL:                 {stats['CRITICAL']}")
    print(f"  HIGH:                     {stats['HIGH']}")
    print(f"  MEDIUM:                   {stats['MEDIUM']}")
    print(f"  LOW:                      {stats['LOW']}")
    print(f"Supports (our claim):       {stats['supports']}")
    print(f"Undermines (our claim):     {stats['undermines']}")
    print(f"Smoking Guns:               {stats['smoking_guns']}")

    if sgs:
        print(f"\n{'='*60}")
        print("SMOKING GUNS IDENTIFIED")
        print(f"{'='*60}")
        for bates, why, quote in sgs:
            print(f"\n  {bates}: {why}")
            print(f"  Quote: {quote}")

    if crits:
        print(f"\n{'='*60}")
        print("CRITICAL DOCUMENTS")
        print(f"{'='*60}")
        for bates, reason, quote in crits:
            print(f"\n  {bates}: {reason}")
            print(f"  Quote: {quote}")
