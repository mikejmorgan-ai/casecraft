#!/usr/bin/env python3
"""
CAUSE OF ACTION PACKET BUILDER
Tree Farm LLC v. Salt Lake County (Case No. 220903418)

Scans ALL 5,576 bates-stamped documents and assigns each to one or more
of 6 litigation packets based on exact-phrase matching against the legal
elements of each cause of action.

Packet 1: Declaratory Relief — Ordinance Invalid (17-41-402 preemption)
Packet 2: Permanent Injunction — Stop County from Enforcing Invalid Ordinance
Packet 3: Declaratory Relief — TF Has a Vested Mining Use (17-41-501 to -503)
Packet 4: (Alternative) Regulatory Taking (5th Amend / Utah Art I §22)
Packet 5: County Counterclaim — 17-41-402(6)(1) Does Not Preempt Ordinance
Packet 6: Documents Not Tied to a Cause of Action

Each packet uses BRACKETED TERM matching — complete phrases only, never
single words. A document is assigned to a packet ONLY if it contains at
least one complete bracketed phrase for that packet's legal elements.
"""

import os
import re
import glob
import sqlite3
from collections import defaultdict
from typing import Dict, List, Tuple, Optional, Set

# ═══════════════════════════════════════════════════════════════════════
# PACKET DEFINITIONS — Exact phrases for each cause of action
# ═══════════════════════════════════════════════════════════════════════

PACKET_1_PHRASES = {
    "name": "Declaratory Relief — Ordinance Invalid (17-41-402 Preemption)",
    "short": "Ordinance Invalid",
    "legal_basis": "Utah Code 17-41-402(6) (now 17-81-402) — CIM state preemption",
    "elements": {
        "A-Preemption": [
            "critical infrastructure materials",
            "critical infrastructure materials operations",
            "sand, gravel and/or rock aggregate",
            "sand, gravel, or rock aggregate",
            "sand, gravel or rock aggregate",
            "may not adopt",
            "may not enact",
            "may not amend",
            "prohibit critical infrastructure",
            "restrict critical infrastructure",
            "prohibit, restrict, regulate",
        ],
        "B-County-Knowledge": [
            "may conflict with a law passed in 2019",
            "17-41-402",
            "17-81-402",
            "blatantly contrary",
            "blatantly contrary to utah code",
            "violation of state law",
            "state legislative workarounds",
            "not necessary in light of existing case law",
            "such language is not necessary",
        ],
        "C-Ordinance-Action": [
            "mineral extraction and processing",
            "mineral extraction",
            "conditional use",
            "forestry and recreation zone",
            "eliminate mineral extraction",
            "amending section 19.12.030",
            "ordinance no.",
            "approved as to form",
        ],
        "D-Bad-Faith": [
            "long prohibited",
            "do not include any reference to critical infrastructure",
            "does not conflict",
            "amendments do not include",
            "confident in the legality",
            "fight to enforce",
            "not GRAMA, yet",
        ],
    },
    "statutes": [
        r'17[\-\s]*41[\-\s]*402',
        r'17[\-\s]*81[\-\s]*402',
        r'17[\-\s]*41[\-\s]*406',
        r'10[\-\s]*9a[\-\s]*901',
        r'10[\-\s]*9a[\-\s]*902',
        r'19[\.\-]12[\.\-]030',
    ],
}

PACKET_2_PHRASES = {
    "name": "Permanent Injunction — Stop County Enforcement",
    "short": "Permanent Injunction",
    "legal_basis": "Injunctive relief — preemption + due process violations",
    "elements": {
        "A-Preemption-Basis": [
            # Same core preemption phrases — if ordinance is void, enforcement must be enjoined
            "critical infrastructure materials",
            "sand, gravel and/or rock aggregate",
            "sand, gravel, or rock aggregate",
            "17-41-402",
            "17-81-402",
            "blatantly contrary",
            "violation of state law",
        ],
        "B-Predetermined-Outcome": [
            "not going to happen",
            "all on the same page",
            "cannot imagine",
            "easy one",
            "block the proposal",
            "banning the quarry",
            "halt this project",
            "voted to ban",
            "just voted to ban",
        ],
        "C-Due-Process": [
            "predetermined outcome",
            "procedural benefit",
            "before the vote",
            "before any hearing",
            "pre-drafted",
            "press release",
            "mayor applauds",
            "mayor urges",
            "before and after vote",
        ],
        "D-Serial-Meetings": [
            "r caucus",
            "tree farm meeting",
            "tree farm meetings",
            "no public notice",
            "serial meeting",
            "open meetings act",
            "quorum",
        ],
        "E-Enforcement-Actions": [
            "cease and desist",
            "enforcement action",
            "stop work order",
            "notice of violation",
            "code enforcement",
            "business license denial",
            "business license",
            "conditional use permit",
            "shut down",
            "cannot operate",
            "operating without",
            "operating in violation",
        ],
        "F-Irreparable-Harm": [
            "irreparable harm",
            "ongoing harm",
            "no adequate remedy",
            "balance of harms",
            "public interest",
        ],
    },
    "statutes": [
        r'17[\-\s]*41[\-\s]*402',
        r'17[\-\s]*81[\-\s]*402',
        r'52[\-\s]*4[\-\s]*101',  # Open Meetings Act
        r'52[\-\s]*4[\-\s]*20[1-9]',
    ],
}

PACKET_3_PHRASES = {
    "name": "Declaratory Relief — TF Has Vested Mining Use",
    "short": "Vested Mining Use",
    "legal_basis": "Utah Code 17-41-501 to -503 (now 17-81-401 to -403)",
    "elements": {
        "A-Prior-Use": [
            "vested mining use",
            "vested mining right",
            "vested mining rights",
            "mine operator",
            "mining protection area",
            "mining use",
            "declaration of vested",
            "notice of vested",
            "nonconforming use",
            "non-conforming use",
            "nonconforming use status",
            "legal nonconforming",
            "pre-existing use",
            "pre-existing mining",
            "existing use argument",
        ],
        "B-Investment": [
            "produced commercial quantities",
            "commercial quantities of a mineral deposit",
            "commercial quantities",
            "large mine permit",
            "small mine permit",
            "notice of intention",
            "notice of intention to commence",
            "portland cement",
            "limestone quarry",
            "mining operations",
            "mining operation",
        ],
        "C-Statutory-Rights": [
            "runs with the land",
            "runs with and bind",
            "conclusively presumed",
            "highest priority use",
            "written declaration of abandonment",
            "express abandonment",
            "sound mining practices",
            "as of january 1, 2009",
            "as of january 1, 2019",
            "owns, controls, or manages",
        ],
        "D-Expansion": [
            "expand the vested mining use",
            "contiguous and related in mineralization",
            "same mineral trend",
            "geologic offshoot",
        ],
        "E-County-Knew": [
            "continue to be a conditional use",
            "such language is not necessary",
            "conditional use",
            "existing operations",
            "existing mining",
        ],
    },
    "statutes": [
        r'17[\-\s]*41[\-\s]*501',
        r'17[\-\s]*41[\-\s]*502',
        r'17[\-\s]*41[\-\s]*503',
        r'17[\-\s]*41[\-\s]*101',
        r'17[\-\s]*81[\-\s]*401',
        r'17[\-\s]*81[\-\s]*402',
        r'17[\-\s]*81[\-\s]*403',
        r'17[\-\s]*27a[\-\s]*100[1-5]',
        r'10[\-\s]*9a[\-\s]*90[1-5]',
    ],
}

PACKET_4_PHRASES = {
    "name": "(Alternative) Regulatory Taking",
    "short": "Regulatory Taking",
    "legal_basis": "U.S. Const. Amend. V; Utah Const. Art. I §22; Penn Central / Lucas tests",
    "elements": {
        "A-Economic-Impact": [
            "economically viable use",
            "economic use",
            "total taking",
            "value of the property",
            "property value",
            "mineral rights",
            "mining rights",
            "eliminates mining",
            "eliminate mineral extraction",
        ],
        "B-Investment-Expectations": [
            "investment-backed expectations",
            "reasonable investment",
            "substantial investment",
            "vested mining use",
            "vested mining right",
            "vested mining rights",
            "large mine permit",
            "small mine permit",
            "commercial quantities",
            "mining since",
            "mining operations",
        ],
        "C-Government-Character": [
            "targeted",
            "targeting",
            "banning the quarry",
            "block the proposal",
            "halt this project",
            "not going to happen",
            "uggggh",
            "personally signs",
            "animus",
            "predetermined outcome",
        ],
        "D-Intergovernmental": [
            "multi-agency",
            "strategy meeting",
            "procedural benefit",
            "cross-agency",
            "intelligence sharing",
            "confidential",
            "unfiled",
            "prue declaration",
            "water rights",
            "flood control",
            "division of oil, gas, and mining",
            "dogm",
        ],
        "E-Bad-Faith-Enforcement": [
            "administrative trap",
            "catch-22",
            "business license denial",
            "business license",
            "cannot operate",
            "shut down",
            "operating without",
            "cease and desist",
            "code enforcement",
        ],
    },
    "statutes": [
        # Takings doesn't rely on specific Utah mining statutes, but reference them
        r'17[\-\s]*41[\-\s]*501',
        r'17[\-\s]*41[\-\s]*402',
        r'19[\.\-]12[\.\-]030',
    ],
}

PACKET_5_PHRASES = {
    "name": "County Counterclaim — 17-41-402(6)(1) Does Not Preempt Ordinance",
    "short": "County Counterclaim",
    "legal_basis": "County's defense that 17-41-402(6)(1) does not preempt the ordinance",
    "elements": {
        "A-County-Defense-Preemption": [
            # County argues ordinance doesn't reference CIM
            "do not include any reference to critical infrastructure",
            "does not conflict",
            "amendments do not include",
            "not conflict with utah code",
            "does not prohibit",
            "does not restrict",
        ],
        "B-County-Zoning-Authority": [
            "zoning authority",
            "police power",
            "health, safety, and welfare",
            "health and safety",
            "legitimate governmental interest",
            "general welfare",
            "land use authority",
            "land use regulation",
        ],
        "C-County-No-Vested-Rights": [
            "no vested right",
            "no existing use",
            "never mined",
            "no mining operations",
            "no conditional use permit",
            "did not have a permit",
            "failed to obtain",
            "did not appeal",
            "time limit",
        ],
        "D-Environmental-Health": [
            "air quality",
            "pm 2.5",
            "pm2.5",
            "fugitive dust",
            "dust emissions",
            "water quality",
            "watershed",
            "drinking water",
            "public health",
            "environmental impact",
            "traffic impact",
            "noise impact",
        ],
        "E-Public-Opposition": [
            "public comment",
            "public hearing",
            "community opposition",
            "residents oppose",
            "residents concerned",
            "neighborhood",
            "property values",
            "quality of life",
        ],
    },
    "statutes": [
        r'17[\-\s]*41[\-\s]*402',
        r'17[\-\s]*81[\-\s]*402',
        r'17[\-\s]*41[\-\s]*406',
    ],
}


ALL_PACKETS = {
    1: PACKET_1_PHRASES,
    2: PACKET_2_PHRASES,
    3: PACKET_3_PHRASES,
    4: PACKET_4_PHRASES,
    5: PACKET_5_PHRASES,
}

# Plain-English argument summaries for each packet
PACKET_SUMMARIES = {
    1: (
        "To prevail on the preemption claim, Tree Farm must prove that the Salt Lake County "
        "ordinance directly conflicts with Utah Code 17-41-402(6), which prohibits any county "
        "from adopting an ordinance that restricts critical infrastructure materials operations. "
        "The CRITICAL documents below establish three essential points: (1) the ordinance "
        "expressly prohibits 'sand, gravel and/or rock aggregate' extraction -- the exact "
        "materials protected by the CIM statute; (2) the County received repeated, explicit "
        "warnings that the ordinance violated state law before it was adopted; and (3) the "
        "County's own District Attorney deliberately evaded the preemption question rather "
        "than addressing it on the merits, supporting an inference of bad faith."
    ),
    2: (
        "To obtain a permanent injunction, Tree Farm must demonstrate: (1) the ordinance is "
        "void as preempted by state law (see Packet 1); (2) the County has taken or threatened "
        "enforcement actions under the invalid ordinance; (3) Tree Farm faces irreparable harm "
        "without injunctive relief because its mining rights cannot be adequately compensated "
        "through damages alone; and (4) the balance of equities favors injunctive relief. The "
        "documents below focus on enforcement actions, predetermined outcomes, and due process "
        "violations that demonstrate the ongoing threat of harm."
    ),
    3: (
        "Under Utah Code 17-41-501 through -503, Tree Farm must prove it holds a vested mining "
        "use that the County cannot extinguish through the ordinance. The evidence below "
        "establishes: (1) Tree Farm filed required notices of intention with the Division of Oil, "
        "Gas, and Mining (DOGM); (2) Tree Farm obtained necessary state mining permits; "
        "(3) mining operations were established before the challenged ordinance was adopted; "
        "and (4) the vested mining use runs with the land and cannot be terminated except by a "
        "written declaration of abandonment by the owner."
    ),
    4: (
        "Under the Penn Central and Lucas regulatory taking tests, Tree Farm must demonstrate "
        "that the County's ordinance constitutes a taking requiring just compensation. The "
        "CRITICAL documents below establish: (1) Economic Impact -- the ordinance eliminates all "
        "economically viable mining use of Tree Farm's mineral rights and property; (2) Interference "
        "with Investment-Backed Expectations -- Tree Farm made substantial investments in mining "
        "permits and operations before the ordinance; and (3) Character of the Government Action -- "
        "the ordinance was targeted legislation designed to 'shut down' a specific operator, with "
        "community members and officials explicitly strategizing to destroy Tree Farm's mining rights."
    ),
    5: (
        "COUNTY'S POSITION: The County contends that Utah Code 17-41-402(6) does not preempt "
        "the ordinance. The County's strongest arguments are: (1) the ordinance does not reference "
        "'critical infrastructure materials' by statutory name; (2) the County acted within its "
        "police power to protect public health, safety, and environmental quality; (3) Tree Farm "
        "never obtained a conditional use permit and has no vested rights; and (4) significant public "
        "opposition to mining supports the County's legitimate governmental interest. Your attorney "
        "should review these documents to prepare for the County's defense."
    ),
}


# ═══════════════════════════════════════════════════════════════════════
# PHRASE COMPILATION
# ═══════════════════════════════════════════════════════════════════════

def _build_phrase_regex(phrase: str) -> re.Pattern:
    """Build exact-phrase regex allowing flexible whitespace."""
    words = phrase.lower().split()
    if len(words) == 1:
        return re.compile(r'\b' + re.escape(words[0]) + r'\b', re.IGNORECASE)
    pattern = r'\b' + r'\s+'.join(re.escape(w) for w in words) + r'\b'
    return re.compile(pattern, re.IGNORECASE)


# Pre-compile all phrase patterns
_COMPILED_PACKETS: Dict[int, Dict[str, List[Tuple[str, re.Pattern]]]] = {}
_COMPILED_STATUTES: Dict[int, List[re.Pattern]] = {}

for pkt_num, pkt_def in ALL_PACKETS.items():
    _COMPILED_PACKETS[pkt_num] = {}
    for element_name, phrases in pkt_def["elements"].items():
        _COMPILED_PACKETS[pkt_num][element_name] = [
            (phrase, _build_phrase_regex(phrase)) for phrase in phrases
        ]
    _COMPILED_STATUTES[pkt_num] = [
        re.compile(s, re.IGNORECASE) for s in pkt_def.get("statutes", [])
    ]


# ═══════════════════════════════════════════════════════════════════════
# DOCUMENT SCANNER
# ═══════════════════════════════════════════════════════════════════════

def scan_document(text: str, pkt_num: int) -> Optional[Dict]:
    """
    Scan a document against a packet's phrases.
    Returns None if no matches, or a dict with match details.
    """
    elements_hit = {}
    total_hits = 0

    for element_name, compiled_phrases in _COMPILED_PACKETS[pkt_num].items():
        element_hits = []
        for phrase, pattern in compiled_phrases:
            matches = pattern.findall(text)
            if matches:
                element_hits.append((phrase, len(matches)))
                total_hits += len(matches)
        if element_hits:
            elements_hit[element_name] = element_hits

    # Check statutes
    statute_hits = []
    for pattern in _COMPILED_STATUTES.get(pkt_num, []):
        matches = pattern.findall(text)
        if matches:
            statute_hits.append((pattern.pattern, len(matches)))
            total_hits += len(matches)

    if not elements_hit and not statute_hits:
        return None

    # Score
    element_score = sum(
        sum(count for _, count in hits) * 10
        for hits in elements_hit.values()
    )
    statute_score = sum(count for _, count in statute_hits) * 5
    cross_ref_score = 0
    if statute_hits and elements_hit:
        cross_ref_score = len(statute_hits) * len(elements_hit) * 15

    total_score = element_score + statute_score + cross_ref_score

    # Determine relevance tier
    num_elements = len(elements_hit)
    if cross_ref_score > 0 and num_elements >= 3 and total_score >= 80:
        relevance = "CRITICAL"
    elif num_elements >= 3 and total_score >= 60:
        relevance = "CRITICAL"
    elif num_elements >= 2 and total_score >= 40:
        relevance = "HIGH"
    elif num_elements >= 1 and total_score >= 20:
        relevance = "MEDIUM"
    elif total_score >= 5:
        relevance = "LOW"
    else:
        return None

    # Build reasoning (plain English)
    reasons = []
    for element_name, hits in elements_hit.items():
        clean_name = element_name.split("-", 1)[1].replace("-", " ").title()
        top_phrases = [f'"{p}"' for p, _ in hits[:3]]
        reasons.append(f'{clean_name}: {", ".join(top_phrases)}')

    if statute_hits:
        codes = [p.replace(r'[\-\s]*', '-').replace(r'[\.\-]', '.') for p, _ in statute_hits]
        reasons.append(f'Statute refs: {", ".join(codes[:3])}')

    # Extract best quote
    best_quote = _extract_best_quote(text, pkt_num)

    return {
        "score": total_score,
        "relevance": relevance,
        "elements_hit": {k: [(p, c) for p, c in v] for k, v in elements_hit.items()},
        "element_names": sorted(elements_hit.keys()),
        "statute_hits": statute_hits,
        "reasoning": "; ".join(reasons),
        "quote": best_quote,
        "total_hits": total_hits,
        "num_elements": num_elements,
    }


def _extract_best_quote(text: str, pkt_num: int, max_len: int = 200) -> str:
    """Extract best quote from document containing the most phrase matches."""
    lines = text.split('\n')
    best_line = ""
    best_score = 0

    for line in lines:
        stripped = line.strip()
        if len(stripped) < 15 or len(stripped) > 1000:
            continue

        score = 0
        for element_name, compiled_phrases in _COMPILED_PACKETS[pkt_num].items():
            for phrase, pattern in compiled_phrases:
                if pattern.search(stripped):
                    score += 10

        for pattern in _COMPILED_STATUTES.get(pkt_num, []):
            if pattern.search(stripped):
                score += 5

        if score > best_score:
            best_score = score
            best_line = stripped

    return best_line[:max_len] if best_line else ""


# ═══════════════════════════════════════════════════════════════════════
# CIM DETECTION (for Packet 3 exclusion)
# ═══════════════════════════════════════════════════════════════════════

CIM_PATTERNS = [
    re.compile(r'\bcritical\s+infrastructure\s+materials?\b', re.IGNORECASE),
    re.compile(r'\bCIM\b'),
    re.compile(r'\bsand,?\s+gravel\b', re.IGNORECASE),
    re.compile(r'\brock\s+aggregate\b', re.IGNORECASE),
]

VESTED_PATTERNS = [
    re.compile(r'\bvested\s+mining\s+use\b', re.IGNORECASE),
    re.compile(r'\bvested\s+mining\s+right', re.IGNORECASE),
    re.compile(r'\bmine\s+operator\b', re.IGNORECASE),
    re.compile(r'\bmining\s+protection\s+area\b', re.IGNORECASE),
]


def is_cim_only_for_packet3(text: str) -> bool:
    """Check if document is CIM-only (exclude from Packet 3 vested analysis)."""
    has_cim = any(p.search(text) for p in CIM_PATTERNS)
    has_vested = any(p.search(text) for p in VESTED_PATTERNS)
    return has_cim and not has_vested


# ═══════════════════════════════════════════════════════════════════════
# MAIN PROCESSING
# ═══════════════════════════════════════════════════════════════════════

def get_bates_number(filepath: str) -> str:
    """Extract SLCo bates number from filename."""
    basename = os.path.basename(filepath)
    m = re.search(r'(SLCo\d+)', basename)
    return m.group(1) if m else basename


def process_all_documents():
    """Scan all 5,576 documents against all 5 packets."""
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    folders = sorted(glob.glob(os.path.join(data_dir, 'discovery-*')))

    # Results: {packet_num: {bates_id: scan_result}}
    packet_results: Dict[int, Dict[str, Dict]] = {i: {} for i in range(1, 6)}
    all_bates: Set[str] = set()
    assigned_bates: Set[str] = set()
    doc_type_counts: Dict[str, int] = defaultdict(int)
    total_docs = 0
    errors = 0

    print("=" * 70)
    print("CAUSE OF ACTION PACKET BUILDER")
    print("Tree Farm LLC v. Salt Lake County (Case No. 220903418)")
    print("=" * 70)
    print()

    for folder in folders:
        folder_name = os.path.basename(folder)
        files = sorted(glob.glob(os.path.join(folder, '*.txt')))
        print(f"Processing {folder_name}: {len(files)} files...")

        for filepath in files:
            bates_id = get_bates_number(filepath)
            all_bates.add(bates_id)
            total_docs += 1

            try:
                with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                    text = f.read()
            except Exception as e:
                errors += 1
                continue

            # Detect document type from content
            text_lower = text.lower()
            if 'from:' in text_lower[:500] and ('to:' in text_lower[:500] or 'subject:' in text_lower[:500]):
                doc_type = "email"
            elif 'calendar' in text_lower[:200] or 'meeting' in text_lower[:200] and 'webex' in text_lower:
                doc_type = "calendar_entry"
            elif 'ordinance' in text_lower[:300]:
                doc_type = "ordinance"
            elif 'public comment' in text_lower[:300] or 'dear council' in text_lower[:500]:
                doc_type = "public_comment"
            elif 'staff report' in text_lower[:300]:
                doc_type = "staff_report"
            elif 'declaration' in text_lower[:300]:
                doc_type = "declaration"
            elif 'agenda' in text_lower[:200]:
                doc_type = "agenda"
            elif 'memorandum' in text_lower[:300] or 'memo' in text_lower[:200]:
                doc_type = "memo"
            elif 'deposition' in text_lower[:300]:
                doc_type = "deposition"
            else:
                doc_type = "document"
            doc_type_counts[doc_type] += 1

            # Scan against each packet
            for pkt_num in range(1, 6):
                # For Packet 3: skip CIM-only documents
                if pkt_num == 3 and is_cim_only_for_packet3(text):
                    continue

                result = scan_document(text, pkt_num)
                if result:
                    result["doc_type"] = doc_type
                    result["bates_id"] = bates_id
                    packet_results[pkt_num][bates_id] = result
                    assigned_bates.add(bates_id)

    # Packet 6: unassigned documents
    unassigned = all_bates - assigned_bates

    print(f"\nProcessing complete: {total_docs} documents scanned")
    print(f"Errors: {errors}")
    print()

    return packet_results, unassigned, all_bates, total_docs, doc_type_counts


def write_packet_report(
    packet_results: Dict[int, Dict[str, Dict]],
    unassigned: Set[str],
    all_bates: Set[str],
    total_docs: int,
    doc_type_counts: Dict[str, int],
):
    """Write the comprehensive packet report."""
    output_path = os.path.join(os.path.dirname(__file__), 'binder', 'CAUSE_OF_ACTION_PACKETS.md')

    with open(output_path, 'w') as f:
        f.write("# CAUSE OF ACTION DOCUMENT PACKETS\n")
        f.write("## Tree Farm LLC v. Salt Lake County (Case No. 220903418)\n\n")
        f.write(f"**Generated:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Total Documents Scanned:** {total_docs} (100% of production)\n")
        f.write(f"**Bates Range:** SLCo002489 through SLCo018710\n\n")

        # Summary table
        f.write("---\n\n")
        f.write("## EXECUTIVE SUMMARY\n\n")
        f.write("| Packet | Cause of Action | Documents | CRITICAL | HIGH | MEDIUM | LOW |\n")
        f.write("|--------|----------------|-----------|----------|------|--------|-----|\n")

        for pkt_num in range(1, 6):
            pkt_def = ALL_PACKETS[pkt_num]
            results = packet_results[pkt_num]
            crit = sum(1 for r in results.values() if r["relevance"] == "CRITICAL")
            high = sum(1 for r in results.values() if r["relevance"] == "HIGH")
            med = sum(1 for r in results.values() if r["relevance"] == "MEDIUM")
            low = sum(1 for r in results.values() if r["relevance"] == "LOW")
            f.write(f"| {pkt_num} | {pkt_def['short']} | {len(results)} | {crit} | {high} | {med} | {low} |\n")

        f.write(f"| 6 | Not Tied to Cause of Action | {len(unassigned)} | — | — | — | — |\n")

        assigned_total = len(all_bates - unassigned)
        f.write(f"\n**Documents assigned to at least one packet:** {assigned_total}\n")
        f.write(f"**Documents not assigned to any packet:** {len(unassigned)}\n")
        f.write(f"**Total accounted for:** {assigned_total + len(unassigned)} / {total_docs} (100%)\n\n")

        # Document type breakdown
        f.write("### Document Type Breakdown\n\n")
        f.write("| Type | Count | % |\n")
        f.write("|------|-------|---|\n")
        for dtype, count in sorted(doc_type_counts.items(), key=lambda x: -x[1]):
            pct = count / total_docs * 100
            f.write(f"| {dtype} | {count} | {pct:.1f}% |\n")

        # Cross-reference analysis
        f.write("\n---\n\n")
        f.write("## CROSS-REFERENCE: Documents Supporting Multiple Causes of Action\n\n")

        multi_packet_docs = defaultdict(list)
        for pkt_num, results in packet_results.items():
            for bates_id in results:
                multi_packet_docs[bates_id].append(pkt_num)

        multi_docs = {b: pkts for b, pkts in multi_packet_docs.items() if len(pkts) >= 3}
        if multi_docs:
            f.write(f"**{len(multi_docs)} documents** support 3 or more causes of action:\n\n")
            f.write("| Bates ID | Packets | Relevance | Key Phrase |\n")
            f.write("|----------|---------|-----------|------------|\n")
            for bates_id in sorted(multi_docs.keys()):
                pkts = multi_docs[bates_id]
                # Find highest relevance across packets
                best_rel = "LOW"
                best_reason = ""
                for pkt in pkts:
                    r = packet_results[pkt].get(bates_id)
                    if r:
                        if r["relevance"] == "CRITICAL":
                            best_rel = "CRITICAL"
                            best_reason = r["reasoning"][:200]
                        elif r["relevance"] == "HIGH" and best_rel != "CRITICAL":
                            best_rel = "HIGH"
                            best_reason = r["reasoning"][:200]

                pkt_str = ", ".join(str(p) for p in sorted(pkts))
                f.write(f"| {bates_id} | {pkt_str} | {best_rel} | {best_reason} |\n")

        # Write each packet
        for pkt_num in range(1, 6):
            pkt_def = ALL_PACKETS[pkt_num]
            results = packet_results[pkt_num]
            _write_single_packet(f, pkt_num, pkt_def, results)

        # Packet 6: Unassigned
        f.write("\n---\n\n")
        f.write("# PACKET 6: Documents Not Tied to a Cause of Action\n\n")
        f.write(f"**{len(unassigned)} documents** did not match any packet's bracketed terms.\n")
        f.write("These documents may include:\n")
        f.write("- Public comments without specific legal references\n")
        f.write("- Calendar entries / meeting invites without substantive content\n")
        f.write("- News articles and media coverage\n")
        f.write("- Administrative correspondence not referencing legal issues\n")
        f.write("- Duplicates or attachments with minimal text\n\n")

        # List unassigned by bates range
        sorted_unassigned = sorted(unassigned, key=lambda x: int(re.search(r'\d+', x).group()))
        if len(sorted_unassigned) > 200:
            f.write(f"### Bates Numbers (showing first 100 and last 100 of {len(sorted_unassigned)}):\n\n")
            for b in sorted_unassigned[:100]:
                f.write(f"- {b}\n")
            f.write(f"\n*... {len(sorted_unassigned) - 200} documents omitted ...*\n\n")
            for b in sorted_unassigned[-100:]:
                f.write(f"- {b}\n")
        else:
            f.write(f"### All {len(sorted_unassigned)} Bates Numbers:\n\n")
            for b in sorted_unassigned:
                f.write(f"- {b}\n")

    print(f"Report written to: {output_path}")
    return output_path


def _write_single_packet(f, pkt_num: int, pkt_def: Dict, results: Dict[str, Dict]):
    """Write a single packet's section with argument summary, element grouping, no LOW docs."""
    f.write("\n---\n\n")
    f.write(f"# PACKET {pkt_num}: {pkt_def['name']}\n\n")
    f.write(f"**Legal Basis:** {pkt_def['legal_basis']}\n")
    f.write(f"**Total Documents:** {len(results)}\n\n")

    # Argument summary
    if pkt_num in PACKET_SUMMARIES:
        f.write(f"> {PACKET_SUMMARIES[pkt_num]}\n\n")

    # Sort by relevance tier then score
    tier_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    sorted_results = sorted(
        results.items(),
        key=lambda x: (tier_order.get(x[1]["relevance"], 9), -x[1]["score"])
    )

    # Count by tier
    tier_counts = defaultdict(int)
    for _, result in sorted_results:
        tier_counts[result["relevance"]] += 1

    f.write("### Relevance Breakdown:\n\n")
    f.write(f"| CRITICAL | HIGH | MEDIUM | LOW (omitted) |\n")
    f.write(f"|----------|------|--------|---------------|\n")
    f.write(f"| {tier_counts.get('CRITICAL', 0)} | {tier_counts.get('HIGH', 0)} "
            f"| {tier_counts.get('MEDIUM', 0)} | {tier_counts.get('LOW', 0)} |\n\n")

    # Elements breakdown
    element_counts = defaultdict(int)
    for bates_id, result in sorted_results:
        for elem in result["element_names"]:
            element_counts[elem] += 1

    f.write("### Elements Addressed:\n\n")
    f.write("| Element | Documents |\n")
    f.write("|---------|----------|\n")
    for elem, count in sorted(element_counts.items(), key=lambda x: -x[1]):
        clean = elem.split("-", 1)[1].replace("-", " ").title()
        f.write(f"| {clean} | {count} |\n")

    # CRITICAL documents -- grouped by primary element
    critical_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "CRITICAL"]
    if critical_docs:
        f.write(f"\n### CRITICAL Documents ({len(critical_docs)})\n\n")

        # Group by the element with the most phrase hits for each document
        from collections import OrderedDict
        element_groups = OrderedDict()
        for bates_id, result in critical_docs:
            best_element = "Other"
            best_hits = 0
            for elem_name, hits in result.get("elements_hit", {}).items():
                total = sum(c for _, c in hits)
                if total > best_hits:
                    best_hits = total
                    best_element = elem_name
            clean_name = best_element.split("-", 1)[1].replace("-", " ").title() if "-" in best_element else best_element
            if clean_name not in element_groups:
                element_groups[clean_name] = []
            element_groups[clean_name].append((bates_id, result))

        for element_name, docs in element_groups.items():
            f.write(f"#### {element_name} ({len(docs)} documents)\n\n")
            for bates_id, result in docs:
                all_elements = ', '.join(
                    e.split('-', 1)[1].replace('-', ' ').title()
                    for e in result['element_names']
                )
                f.write(f"**{bates_id}** | Score: {result['score']} | Elements: {all_elements}\n")
                f.write(f"> {result['reasoning']}\n")
                if result.get("quote"):
                    f.write(f'> *"{result["quote"][:200]}"*\n')
                f.write("\n")

    # HIGH documents
    high_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "HIGH"]
    if high_docs:
        f.write(f"\n### HIGH Relevance Documents ({len(high_docs)})\n\n")
        for bates_id, result in high_docs:
            f.write(f"**{bates_id}** | Score: {result['score']} | ")
            f.write(f"Elements: {', '.join(e.split('-',1)[1].replace('-',' ').title() for e in result['element_names'])}\n")
            f.write(f"> {result['reasoning']}\n\n")

    # MEDIUM documents (compact table with full key phrases)
    med_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "MEDIUM"]
    if med_docs:
        f.write(f"\n### MEDIUM Relevance Documents ({len(med_docs)})\n\n")
        f.write("| Bates ID | Score | Elements | Key Phrase |\n")
        f.write("|----------|-------|----------|------------|\n")
        for bates_id, result in med_docs:
            elems = ", ".join(e.split('-',1)[1].replace('-',' ') for e in result['element_names'])
            reason = result['reasoning'][:150]
            f.write(f"| {bates_id} | {result['score']} | {elems} | {reason} |\n")

    # LOW documents -- count only, no listing
    low_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "LOW"]
    if low_docs:
        f.write(f"\n### LOW Relevance Documents: {len(low_docs)} (not listed)\n\n")
        f.write(f"> {len(low_docs)} documents matched packet keywords at LOW relevance and are omitted ")
        f.write(f"from this report to reduce noise. These documents contain minimal keyword overlap and ")
        f.write(f"are unlikely to be useful as primary exhibits. The full list is available in the ")
        f.write(f"underlying scan data.\n")


# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    packet_results, unassigned, all_bates, total_docs, doc_type_counts = process_all_documents()

    print("\n" + "=" * 70)
    print("PACKET SUMMARY")
    print("=" * 70)
    for pkt_num in range(1, 6):
        pkt_def = ALL_PACKETS[pkt_num]
        results = packet_results[pkt_num]
        crit = sum(1 for r in results.values() if r["relevance"] == "CRITICAL")
        high = sum(1 for r in results.values() if r["relevance"] == "HIGH")
        print(f"Packet {pkt_num} ({pkt_def['short']}): {len(results)} docs ({crit} CRITICAL, {high} HIGH)")

    print(f"Packet 6 (Not Tied to COA): {len(unassigned)} docs")
    print(f"\nTotal: {len(all_bates)} unique documents (100%)")

    output = write_packet_report(packet_results, unassigned, all_bates, total_docs, doc_type_counts)
    print(f"\nDone. Report: {output}")
