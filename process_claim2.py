#!/usr/bin/env python3
"""
Analyze all discovery documents for CLAIM 2: PERMANENT INJUNCTION — NO ENFORCEMENT
Tree Farm LLC v. Salt Lake County

Claim 2 seeks a permanent injunction preventing Salt Lake County from enforcing
its April 2022 ordinance that prohibits "sand, gravel and/or rock aggregate" extraction.
"""

import sqlite3
import os
import re
import time

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
BATCH_SIZE = 200  # Read from DB in batches of 200
WRITE_BATCH = 50  # Write to DB every 50 docs
CLAIM_NUM = 2

# Keywords and patterns for Claim 2 relevance
ENFORCEMENT_CRITICAL = re.compile(
    r'(cease\s+and\s+desist|stop\s+work\s+order|notice\s+of\s+violation|'
    r'code\s+enforcement|enforcement\s+action|shut\s*down|shut\s*ting\s*down|'
    r'revoke\s+(the\s+)?permit|penalty|penalt|fine\s+(of|for|amount)|'
    r'criminal\s+(prosecution|penalty|enforcement)|'
    r'citation\s+(issued|for|against)|'
    r'irreparable\s+harm|irreparable\s+injur|'
    r'permanent\s+injunction|preliminary\s+injunction|'
    r'enjoin|injunctive\s+relief|restraining\s+order|'
    r'threatened\s+(to\s+)?(enforce|shut|close|revoke|stop)|'
    r'will\s+(be\s+)?(enforc|shut|clos|revok|stop|penaliz)|'
    r'forced?\s+to\s+(shut|stop|cease|close)|'
    r'no\s+adequate\s+remedy|'
    r'balance\s+of\s+(the\s+)?harms?|'
    r'order\s+(to\s+)?(stop|cease|halt|discontinue)|'
    r'violation\s+of\s+(the\s+)?ordinance)',
    re.IGNORECASE
)

ENFORCEMENT_HIGH = re.compile(
    r'(enforce|enforcement|enforcing|enforceable|unenforceable|'
    r'violat(e|ion|ing|ed)|comply|compliance|noncompliance|non-compliance|'
    r'prohibited\s+(use|activit|mining|extraction|quarry)|'
    r'unlawful\s+(use|activit|mining|extraction|quarry)|'
    r'illegal\s+(mining|extraction|quarry|operation)|'
    r'not\s+(be\s+)?permitted|not\s+(be\s+)?allowed|'
    r'shall\s+not|prohibit(s|ed|ing)?|'
    r'zoning\s+(violation|enforcement|compliance)|'
    r'county\s+(will|shall|may)\s+(enforce|prohibit|prevent|stop)|'
    r'subject\s+to\s+(enforcement|penalties|fines|prosecution)|'
    r'threat(en|ened|ening)?|'
    r'warning\s+(letter|notice)|'
    r'demand\s+(letter|to\s+stop|to\s+cease|compliance)|'
    r'abat(e|ement|ing)|'
    r'remedy\s+at\s+law|legal\s+remedy|'
    r'success\s+on\s+the\s+merits|likelihood\s+of\s+success|'
    r'public\s+interest|'
    r'CIM\s+material|construction\s+material|aggregate\s+need|'
    r'infrastructure\s+need)',
    re.IGNORECASE
)

ENFORCEMENT_MEDIUM = re.compile(
    r'(ordinance|regulation|regulatory|zoning\s+code|'
    r'permit\s+(application|process|denial|approved|revoked)|'
    r'land\s+use\s+(authority|regulation|ordinance|code)|'
    r'county\s+(council|ordinance|code|regulation)|'
    r'mining\s+(permit|regulation|operation|activity)|'
    r'quarry\s+(permit|operation|activity)|'
    r'extraction\s+(permit|operation|activity)|'
    r'preempt(ion|ed|s)?|'
    r'state\s+(law|statute|mining|preempt)|'
    r'sand.{0,10}gravel.{0,10}rock|'
    r'aggregate|limestone|mineral)',
    re.IGNORECASE
)

# Patterns that suggest document supports Tree Farm's case
SUPPORTS_TF = re.compile(
    r'(preempt(s|ed|ion)|state\s+(law|statute)\s+(preempt|govern|control)|'
    r'county\s+(cannot|can\s*not|lacks?\s+authority|exceed|overreach|overstep)|'
    r'vested\s+right|prior\s+nonconforming|grandfathered|'
    r'irreparable\s+harm|no\s+adequate\s+remedy|'
    r'critical\s+(mineral|material|infrastructure|need)|'
    r'CIM\s+material|essential\s+material|'
    r'public\s+(need|interest|benefit).{0,40}(mining|quarry|aggregate|extraction|mineral)|'
    r'right\s+to\s+mine|mining\s+right|mineral\s+right|'
    r'threat(en)?.*enforce|enforce.*threat|'
    r'chilling\s+effect|'
    r'economic\s+(harm|damage|loss|impact).{0,30}(tree\s+farm|operator|mine|quarry))',
    re.IGNORECASE
)

# Patterns that suggest document undermines Tree Farm's case
UNDERMINES_TF = re.compile(
    r'(adequate\s+remedy\s+at\s+law|money\s+damages\s+sufficient|'
    r'no\s+irreparable\s+harm|speculative\s+harm|'
    r'public\s+(health|safety|welfare).{0,40}(concern|harm|risk|threat|impact)|'
    r'environmental\s+(harm|damage|concern|impact|risk)|'
    r'neighborhood\s+(harm|impact|concern)|community\s+(harm|impact|concern|opposition)|'
    r'noise|dust|pollution|traffic\s+(impact|concern|problem)|'
    r'property\s+value.{0,20}(declin|decreas|harm|damage|impact)|'
    r'county\s+(has\s+)?authority|county\s+(power|jurisdiction|right)\s+to|'
    r'valid\s+(exercise|use)\s+of\s+(police\s+power|zoning|authority|regulation)|'
    r'legitimate\s+(government|regulatory|public)\s+(interest|purpose|objective)|'
    r'health.{0,10}safety.{0,10}welfare|'
    r'balance.{0,20}(favor|tip).{0,20}county|'
    r'public\s+interest.{0,20}(against|oppose|deni))',
    re.IGNORECASE
)


def read_document(file_path):
    """Read document content from file."""
    try:
        with open(file_path, 'r', errors='replace') as f:
            return f.read()
    except Exception as e:
        return ""


def extract_best_quote(text, patterns_list):
    """Extract the most relevant quote from the document."""
    best_quote = ""
    best_score = 0

    # Split into sentences (rough split)
    sentences = re.split(r'(?<=[.!?])\s+|\n\n|\n(?=[A-Z])', text)

    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 15 or len(sent) > 500:
            continue

        score = 0
        for pattern in patterns_list:
            matches = pattern.findall(sent)
            score += len(matches)

        if score > best_score:
            best_score = score
            best_quote = sent[:450]

    # If no good sentence found, try to find key phrases in context
    if not best_quote:
        for pattern in patterns_list:
            m = pattern.search(text)
            if m:
                start = max(0, m.start() - 50)
                end = min(len(text), m.end() + 200)
                best_quote = text[start:end].strip()[:450]
                break

    return best_quote if best_quote else text[:300].strip()


def analyze_document(doc_id, bates, title, doc_type, summary, file_path):
    """Analyze a document for Claim 2 relevance."""

    text = read_document(file_path)
    if not text:
        return None

    # Combine title, summary and text for analysis
    full_context = f"{title or ''} {summary or ''} {text}"
    text_lower = full_context.lower()

    # Score the document
    critical_matches = ENFORCEMENT_CRITICAL.findall(full_context)
    high_matches = ENFORCEMENT_HIGH.findall(full_context)
    medium_matches = ENFORCEMENT_MEDIUM.findall(full_context)

    critical_count = len(critical_matches)
    high_count = len(high_matches)
    medium_count = len(medium_matches)

    # Determine relevance level
    if critical_count >= 2:
        relevance = "CRITICAL"
    elif critical_count >= 1 and high_count >= 2:
        relevance = "CRITICAL"
    elif critical_count >= 1 or high_count >= 3:
        relevance = "HIGH"
    elif high_count >= 1 and medium_count >= 2:
        relevance = "HIGH"
    elif high_count >= 1 or medium_count >= 3:
        relevance = "MEDIUM"
    elif medium_count >= 1:
        relevance = "LOW"
    else:
        return None  # Not relevant

    # Determine supports vs undermines
    supports_matches = len(SUPPORTS_TF.findall(full_context))
    undermines_matches = len(UNDERMINES_TF.findall(full_context))

    if supports_matches > undermines_matches:
        supports_undermines = "SUPPORTS"
    elif undermines_matches > supports_matches:
        supports_undermines = "UNDERMINES"
    else:
        # Default based on content
        if any(kw in text_lower for kw in ['cease and desist', 'enforcement action',
                'notice of violation', 'shut down', 'stop work', 'threatened']):
            supports_undermines = "SUPPORTS"  # Evidence of enforcement threats supports injunction need
        elif any(kw in text_lower for kw in ['public health', 'public safety', 'environmental',
                'noise', 'dust', 'traffic', 'property value']):
            supports_undermines = "UNDERMINES"
        else:
            supports_undermines = "SUPPORTS"

    # Extract best quote
    all_patterns = [ENFORCEMENT_CRITICAL, ENFORCEMENT_HIGH, ENFORCEMENT_MEDIUM]
    key_quote = extract_best_quote(text, all_patterns)

    # Generate reasoning
    reasoning_parts = []

    if critical_count > 0:
        reasoning_parts.append(f"Contains {critical_count} critical enforcement-related references")
        critical_terms = list(set([str(m) if isinstance(m, str) else str(m[0]) for m in critical_matches[:3]]))
        reasoning_parts.append(f"Critical terms: {', '.join(critical_terms[:3])}")

    if high_count > 0:
        reasoning_parts.append(f"Contains {high_count} high-relevance enforcement references")

    if medium_count > 0:
        reasoning_parts.append(f"Contains {medium_count} medium-relevance references")

    # Add context about what the doc is
    if doc_type:
        reasoning_parts.append(f"Document type: {doc_type}")

    if supports_undermines == "SUPPORTS":
        reasoning_parts.append("Supports Tree Farm's injunction case")
    else:
        reasoning_parts.append("May undermine Tree Farm's injunction case")

    # Specific context-based reasoning
    if re.search(r'cease\s+and\s+desist|stop\s+work', text_lower):
        reasoning_parts.append("Contains cease and desist or stop work language - direct enforcement evidence")
    if re.search(r'notice\s+of\s+violation', text_lower):
        reasoning_parts.append("Contains notice of violation - active enforcement")
    if re.search(r'irreparable\s+harm', text_lower):
        reasoning_parts.append("Discusses irreparable harm - key injunction element")
    if re.search(r'enforce|enforcement', text_lower):
        reasoning_parts.append("Discusses enforcement of ordinance")
    if re.search(r'preempt', text_lower):
        reasoning_parts.append("References preemption - ties to Claim 1 merits analysis")
    if re.search(r'shut\s*down|clos(e|ing|ure)\s+(the\s+)?(mine|quarry|operation)', text_lower):
        reasoning_parts.append("References shutdown/closure of mining operation")
    if re.search(r'aggregate|CIM|construction\s+material|infrastructure', text_lower):
        reasoning_parts.append("References construction materials/infrastructure needs - public interest factor")

    reasoning = ". ".join(reasoning_parts[:5])

    # Determine if this is a key finding
    is_key_finding = False
    key_finding_reason = ""
    key_finding_use = ""

    if relevance == "CRITICAL":
        if re.search(r'cease\s+and\s+desist|stop\s+work\s+order', text_lower):
            is_key_finding = True
            key_finding_reason = "Direct cease and desist or stop work order - proves enforcement threat"
            key_finding_use = "Use to establish that County has actively threatened enforcement, proving need for injunctive relief"
        elif re.search(r'notice\s+of\s+violation', text_lower):
            is_key_finding = True
            key_finding_reason = "Notice of violation - proves active enforcement action"
            key_finding_use = "Use to demonstrate County is actively enforcing ordinance against Tree Farm"
        elif re.search(r'(shut\s*(down|ting)|clos(e|ing|ure))\s+(the\s+)?(mine|quarry|operation|tree\s+farm)', text_lower):
            is_key_finding = True
            key_finding_reason = "Direct reference to shutting down/closing Tree Farm's operation"
            key_finding_use = "Use to show imminent threat of enforcement causing irreparable harm"
        elif re.search(r'(threaten|warn|demand).{0,30}(enforce|comply|stop|cease|shut|close)', text_lower):
            is_key_finding = True
            key_finding_reason = "Contains direct threat or demand for compliance/cessation"
            key_finding_use = "Use to establish pattern of enforcement threats justifying injunctive relief"
        elif re.search(r'irreparable\s+harm|no\s+adequate\s+remedy', text_lower):
            is_key_finding = True
            key_finding_reason = "Directly addresses irreparable harm or inadequate legal remedy"
            key_finding_use = "Use to establish key injunction elements"
        elif re.search(r'(will|shall|going\s+to)\s+(enforce|prosecute|penalize|fine|cite|shut)', text_lower):
            is_key_finding = True
            key_finding_reason = "County officials expressing intent to enforce"
            key_finding_use = "Use to demonstrate imminent enforcement threat requiring injunctive relief"
        elif re.search(r'criminal\s+(prosecution|penalty|enforcement)', text_lower):
            is_key_finding = True
            key_finding_reason = "Criminal enforcement threat - most severe form of enforcement"
            key_finding_use = "Use to show severity of enforcement threat and irreparable harm (criminal liability cannot be remedied by damages)"
        elif critical_count >= 3:
            is_key_finding = True
            key_finding_reason = f"Extremely high concentration of enforcement-related language ({critical_count} critical matches)"
            key_finding_use = "Key document for establishing enforcement threat pattern"

    return {
        'doc_id': doc_id,
        'relevance': relevance,
        'supports_undermines': supports_undermines,
        'key_quote': key_quote,
        'reasoning': reasoning,
        'is_key_finding': is_key_finding,
        'key_finding_reason': key_finding_reason,
        'key_finding_use': key_finding_use
    }


def main():
    start_time = time.time()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT count(*) FROM documents")
    total = c.fetchone()[0]
    print(f"Total docs to process: {total}")

    # Clear any existing claim 2 assignments
    c.execute("DELETE FROM claim_assignments WHERE claim_num = ?", (CLAIM_NUM,))
    c.execute("DELETE FROM smoking_guns WHERE claim_num = ?", (CLAIM_NUM,))
    conn.commit()
    print("Cleared existing Claim 2 assignments")

    # Process in batches
    offset = 0
    processed = 0
    assigned = 0
    key_finding_count = 0

    assignment_buffer = []
    key_finding_buffer = []

    relevance_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    direction_counts = {"SUPPORTS": 0, "UNDERMINES": 0}

    while offset < total:
        c.execute("""
            SELECT id, bates, title, type, summary, file_path
            FROM documents
            ORDER BY id
            LIMIT ? OFFSET ?
        """, (BATCH_SIZE, offset))

        rows = c.fetchall()
        if not rows:
            break

        for row in rows:
            doc_id, bates, title, doc_type, summary, file_path = row

            result = analyze_document(doc_id, bates, title, doc_type, summary, file_path)

            if result:
                assignment_buffer.append((
                    result['doc_id'],
                    CLAIM_NUM,
                    result['relevance'],
                    result['supports_undermines'],
                    result['reasoning'],
                    result['key_quote']
                ))

                relevance_counts[result['relevance']] += 1
                direction_counts[result['supports_undermines']] += 1
                assigned += 1

                if result['is_key_finding']:
                    key_finding_buffer.append((
                        result['doc_id'],
                        CLAIM_NUM,
                        result['key_finding_reason'],
                        result['key_finding_use']
                    ))
                    key_finding_count += 1

            processed += 1

            # Write every 50 docs
            if len(assignment_buffer) >= WRITE_BATCH:
                c.executemany("""
                    INSERT INTO claim_assignments (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, assignment_buffer)
                if key_finding_buffer:
                    c.executemany("""
                        INSERT INTO smoking_guns (doc_id, claim_num, why_critical, recommended_use)
                        VALUES (?, ?, ?, ?)
                    """, key_finding_buffer)
                conn.commit()
                assignment_buffer = []
                key_finding_buffer = []

        offset += BATCH_SIZE
        elapsed = time.time() - start_time
        rate = processed / elapsed if elapsed > 0 else 0
        print(f"Progress: {processed}/{total} docs ({processed*100//total}%) | "
              f"Assigned: {assigned} | Key findings: {key_finding_count} | "
              f"Rate: {rate:.1f} docs/sec | "
              f"CRIT:{relevance_counts['CRITICAL']} HIGH:{relevance_counts['HIGH']} "
              f"MED:{relevance_counts['MEDIUM']} LOW:{relevance_counts['LOW']}")

    # Flush remaining buffers
    if assignment_buffer:
        c.executemany("""
            INSERT INTO claim_assignments (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
            VALUES (?, ?, ?, ?, ?, ?)
        """, assignment_buffer)
    if key_finding_buffer:
        c.executemany("""
            INSERT INTO smoking_guns (doc_id, claim_num, why_critical, recommended_use)
            VALUES (?, ?, ?, ?)
        """, key_finding_buffer)
    conn.commit()

    elapsed = time.time() - start_time

    print(f"\n{'='*70}")
    print(f"CLAIM 2 ANALYSIS COMPLETE")
    print(f"{'='*70}")
    print(f"Total documents processed: {processed}")
    print(f"Total documents assigned to Claim 2: {assigned}")
    print(f"Key findings identified: {key_finding_count}")
    print(f"Time elapsed: {elapsed:.1f} seconds")
    print(f"\nRelevance breakdown:")
    for level, count in relevance_counts.items():
        print(f"  {level}: {count}")
    print(f"\nDirection breakdown:")
    for direction, count in direction_counts.items():
        print(f"  {direction}: {count}")

    # Print key findings summary
    if key_finding_count > 0:
        print(f"\n{'='*70}")
        print(f"KEY FINDINGS SUMMARY")
        print(f"{'='*70}")
        c.execute("""
            SELECT sg.doc_id, d.bates, d.title, sg.why_critical, sg.recommended_use
            FROM smoking_guns sg
            JOIN documents d ON sg.doc_id = d.id
            WHERE sg.claim_num = ?
            ORDER BY sg.id
        """, (CLAIM_NUM,))
        for row in c.fetchall():
            print(f"\n  Doc ID {row[0]} | {row[1]} | {row[2]}")
            print(f"  WHY CRITICAL: {row[3]}")
            print(f"  RECOMMENDED USE: {row[4]}")

    # Print CRITICAL documents summary
    print(f"\n{'='*70}")
    print(f"CRITICAL DOCUMENTS SUMMARY")
    print(f"{'='*70}")
    c.execute("""
        SELECT ca.doc_id, d.bates, d.title, ca.supports_undermines, ca.key_quote, ca.reasoning
        FROM claim_assignments ca
        JOIN documents d ON ca.doc_id = d.id
        WHERE ca.claim_num = ? AND ca.relevance = 'CRITICAL'
        ORDER BY ca.doc_id
    """, (CLAIM_NUM,))
    for row in c.fetchall():
        print(f"\n  Doc {row[0]} | {row[1]} | {row[2]} | {row[3]}")
        print(f"  QUOTE: {row[4][:200]}...")
        print(f"  REASONING: {row[5]}")

    conn.close()


if __name__ == "__main__":
    main()
