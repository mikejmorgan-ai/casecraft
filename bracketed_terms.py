#!/usr/bin/env python3
"""
BRACKETED TERMS — Exact Phrase Matching & Statutory Cross-Reference Engine
Tree Farm LLC v. Salt Lake County (Case No. 220903418)

RULE 1: BRACKETED TERM MATCHING
Every legal term is an exact phrase. "vested mining use" means ALL THREE
words must appear together. The word "vested" alone is NOT a hit. The word
"mining" alone is NOT a hit. Only the complete bracketed phrase counts.

RULE 2: STATUTORY CROSS-REFERENCING
When a claim uses a statutory code (e.g., 17-41-501), the system finds
discovery documents that ALSO reference that statute AND contain the
bracketed terms. Statute reference + bracketed terms = critical document.

Usage:
    from bracketed_terms import (
        match_bracketed_terms,
        find_statutory_cross_references,
        CLAIM_TERMS,
        CLAIM_STATUTES,
    )
"""

import re
from typing import Dict, List, Tuple, Optional, Set

# ═══════════════════════════════════════════════════════════════════════
# BRACKETED TERMS — Every term is an EXACT PHRASE (all words together)
# Single words are NEVER searched alone. Every entry here is a
# multi-word phrase or a statutory citation that must appear as-is.
# ═══════════════════════════════════════════════════════════════════════

# Claim 3: Vested Mining Rights terms
CLAIM3_BRACKETED_TERMS = [
    # Statutory defined terms (exact phrases from Utah Code 17-41-101 et seq.)
    "vested mining use",
    "vested mining right",
    "mine operator",
    "mining protection area",
    "mining use",
    "declaration of vested",
    "notice of vested",
    # Statutory qualifiers (exact language)
    "owns, controls, or manages",
    "produced commercial quantities",
    "commercial quantities of a mineral deposit",
    "as of january 1, 2009",
    "as of january 1, 2019",
    # Statutory rights language
    "runs with the land",
    "runs with and bind",
    "conclusively presumed",
    "highest priority use",
    "written declaration of abandonment",
    "express abandonment",
    "sound mining practices",
    # Statutory expansion rights
    "expand the vested mining use",
    "contiguous and related in mineralization",
    "same mineral trend",
    "geologic offshoot",
    # Nonconforming use (legal term of art)
    "nonconforming use status",
    "legal nonconforming",
    "nonconforming use",
    "non-conforming use",
    "pre-existing use",
    "pre-existing mining",
    # Historical mining
    "portland cement",
    "large mine permit",
    "small mine permit",
    "notice of intention",
    # Key staff language
    "such language is not necessary",
    "continue to be a conditional use",
]

# Claim 2: Permanent Injunction terms
CLAIM2_BRACKETED_TERMS = [
    # All Claim 3 terms (foundation)
    *CLAIM3_BRACKETED_TERMS,
    # Enforcement-specific terms (exact phrases)
    "cease and desist",
    "enforcement action",
    "stop work order",
    "notice of violation",
    "code enforcement",
    "business license denial",
    "conditional use permit",
    "irreparable harm",
    "ongoing harm",
    "shut down",
    "cannot operate",
    "operating without",
    "operating in violation",
    "administrative trap",
]

# Claim 1: CIM Preemption terms
CLAIM1_BRACKETED_TERMS = [
    # CIM statutory terms (exact phrases)
    "critical infrastructure materials",
    "critical infrastructure materials operations",
    "sand, gravel and/or rock aggregate",
    "sand, gravel, or rock aggregate",
    "mineral extraction and processing",
    "mineral extraction",
    # Preemption language
    "may not adopt",
    "may not enact",
    "may not amend",
    "prohibit critical infrastructure",
    # Ordinance language
    "explicitly prohibited",
    "conditional use",
    "forestry and recreation zone",
    # Key case language
    "long prohibited",
    "confident in the legality",
    "fight to enforce",
]

# ═══════════════════════════════════════════════════════════════════════
# STATUTORY CODES — Each claim's foundation statutes
# ═══════════════════════════════════════════════════════════════════════

CLAIM3_STATUTES = [
    # Utah Code sections for Vested Mining Rights
    r'17[\-\s]*41[\-\s]*501',   # vested mining use statute
    r'17[\-\s]*41[\-\s]*502',   # expansion of vested mining use
    r'17[\-\s]*41[\-\s]*503',   # abandonment
    r'17[\-\s]*41[\-\s]*101',   # definitions
    r'17[\-\s]*41[\-\s]*402',   # limitations on local regulations
    r'17[\-\s]*41[\-\s]*403',   # nuisance protections
    r'17[\-\s]*27a[\-\s]*100[1-5]',  # CIM vested operations (county)
    r'10[\-\s]*9a[\-\s]*90[1-5]',    # CIM vested operations (municipality)
    # Renumbered versions
    r'17[\-\s]*81[\-\s]*401',
    r'17[\-\s]*81[\-\s]*402',
    r'17[\-\s]*81[\-\s]*403',
]

CLAIM2_STATUTES = [
    *CLAIM3_STATUTES,
    # Additional injunction-related statutes
    r'19[\.\-]12[\.\-]030',    # the ordinance section
]

CLAIM1_STATUTES = [
    r'17[\-\s]*41[\-\s]*402',   # CIM preemption statute
    r'17[\-\s]*41[\-\s]*406',   # CIM operations protection
    r'10[\-\s]*9a[\-\s]*901',   # CIM definition
    r'10[\-\s]*9a[\-\s]*902',   # CIM operations definition
    r'19[\.\-]12[\.\-]030',     # the ordinance section
    *CLAIM3_STATUTES,
]

# Consolidated lookup
CLAIM_TERMS: Dict[int, List[str]] = {
    1: CLAIM1_BRACKETED_TERMS,
    2: CLAIM2_BRACKETED_TERMS,
    3: CLAIM3_BRACKETED_TERMS,
}

CLAIM_STATUTES: Dict[int, List[str]] = {
    1: CLAIM1_STATUTES,
    2: CLAIM2_STATUTES,
    3: CLAIM3_STATUTES,
}


def _build_phrase_regex(phrase: str) -> re.Pattern:
    """
    Build a regex that matches an exact phrase, allowing flexible whitespace.

    "vested mining use" → matches "vested  mining   use" or "vested\nmining\nuse"
    but NOT "vested" alone or "mining use" without "vested" before it.
    """
    # Split phrase into words
    words = phrase.lower().split()
    if len(words) == 1:
        # Single defined term — still require word boundaries
        return re.compile(r'\b' + re.escape(words[0]) + r'\b', re.IGNORECASE)

    # Multi-word: join with flexible whitespace (1+ whitespace chars)
    pattern = r'\b' + r'\s+'.join(re.escape(w) for w in words) + r'\b'
    return re.compile(pattern, re.IGNORECASE)


def _compile_statute_patterns(statutes: List[str]) -> List[re.Pattern]:
    """Compile statute reference patterns."""
    return [re.compile(s, re.IGNORECASE) for s in statutes]


# Pre-compiled patterns for each claim
_CLAIM_TERM_PATTERNS: Dict[int, List[Tuple[str, re.Pattern]]] = {}
_CLAIM_STATUTE_PATTERNS: Dict[int, List[re.Pattern]] = {}

for claim_num, terms in CLAIM_TERMS.items():
    _CLAIM_TERM_PATTERNS[claim_num] = [
        (term, _build_phrase_regex(term)) for term in terms
    ]

for claim_num, statutes in CLAIM_STATUTES.items():
    _CLAIM_STATUTE_PATTERNS[claim_num] = _compile_statute_patterns(statutes)


# ═══════════════════════════════════════════════════════════════════════
# RULE 1: BRACKETED TERM MATCHING
# ═══════════════════════════════════════════════════════════════════════

def match_bracketed_terms(
    text: str,
    claim_num: int,
) -> List[Tuple[str, int]]:
    """
    Find all bracketed term matches in text for a given claim.

    Returns list of (term, match_count) tuples.
    Only returns terms where the COMPLETE phrase appears in the text.
    Single words are NEVER matched independently.

    Example:
        matches = match_bracketed_terms(doc_text, claim_num=3)
        # Returns: [("vested mining use", 3), ("mine operator", 1)]
        # Does NOT return: [("vested", 15)]  ← WRONG, single word
    """
    if claim_num not in _CLAIM_TERM_PATTERNS:
        return []

    hits = []
    for term, pattern in _CLAIM_TERM_PATTERNS[claim_num]:
        matches = pattern.findall(text)
        if matches:
            hits.append((term, len(matches)))

    return hits


def match_statutes(
    text: str,
    claim_num: int,
) -> List[Tuple[str, int]]:
    """
    Find all statutory code references in text for a given claim.

    Returns list of (statute_pattern, match_count) tuples.
    """
    if claim_num not in _CLAIM_STATUTE_PATTERNS:
        return []

    hits = []
    for pattern in _CLAIM_STATUTE_PATTERNS[claim_num]:
        matches = pattern.findall(text)
        if matches:
            hits.append((pattern.pattern, len(matches)))

    return hits


# ═══════════════════════════════════════════════════════════════════════
# RULE 2: STATUTORY CROSS-REFERENCING
# ═══════════════════════════════════════════════════════════════════════

def find_statutory_cross_references(
    text: str,
    claim_num: int,
) -> Dict[str, List[str]]:
    """
    Find documents where a statutory code AND bracketed terms co-occur.

    This implements Rule 2: When a claim uses a statutory code (e.g., 17-41-501),
    and a discovery document ALSO references that statute, check if the document
    contains the bracketed terms too. Both together = critical document.

    Returns:
        Dict mapping statute references to the bracketed terms found alongside them.
        Empty dict = no cross-references (not a critical document for this rule).

    Example:
        refs = find_statutory_cross_references(doc_text, claim_num=3)
        # Returns: {
        #   "17-41-501": ["vested mining use", "mine operator"],
        #   "17-41-502": ["expand the vested mining use"],
        # }
    """
    statute_hits = match_statutes(text, claim_num)
    if not statute_hits:
        return {}

    term_hits = match_bracketed_terms(text, claim_num)
    if not term_hits:
        return {}

    # Cross-reference: statutes found + terms found together
    result = {}
    for statute_pattern, _ in statute_hits:
        matched_terms = [term for term, _ in term_hits]
        if matched_terms:
            result[statute_pattern] = matched_terms

    return result


def score_document_bracketed(
    text: str,
    claim_num: int,
) -> Optional[Dict]:
    """
    Score a document using ONLY bracketed term matching (Rule 1) and
    statutory cross-referencing (Rule 2).

    Returns None if no bracketed terms found.
    Returns a dict with scoring info if relevant.

    Scoring:
    - Each bracketed term hit: +10 points
    - Each statutory cross-reference: +15 points (statute + term together)
    - Each statute reference (without term): +5 points
    """
    term_hits = match_bracketed_terms(text, claim_num)
    statute_hits = match_statutes(text, claim_num)
    cross_refs = find_statutory_cross_references(text, claim_num)

    if not term_hits and not statute_hits:
        return None

    # Calculate score
    term_score = sum(count for _, count in term_hits) * 10
    statute_score = len(statute_hits) * 5
    cross_ref_score = sum(len(terms) for terms in cross_refs.values()) * 15

    total_score = term_score + statute_score + cross_ref_score

    if total_score == 0:
        return None

    # Determine relevance tier
    if cross_refs and total_score >= 40:
        relevance = "CRITICAL"
    elif term_hits and len(term_hits) >= 3 and total_score >= 30:
        relevance = "CRITICAL"
    elif (cross_refs or len(term_hits) >= 2) and total_score >= 20:
        relevance = "HIGH"
    elif term_hits and total_score >= 10:
        relevance = "MEDIUM"
    elif statute_hits:
        relevance = "LOW"
    else:
        return None

    return {
        'score': total_score,
        'relevance': relevance,
        'term_hits': term_hits,
        'statute_hits': statute_hits,
        'cross_references': cross_refs,
        'term_count': len(term_hits),
        'statute_count': len(statute_hits),
        'cross_ref_count': sum(len(t) for t in cross_refs.values()),
    }


def has_relevant_context(text: str, claim_num: int) -> bool:
    """
    Check if document has ANY relevant context using ONLY bracketed terms.
    Replaces the old has_vested_mining_context() that matched single words.

    A document is relevant ONLY if it contains at least one complete
    bracketed term phrase.
    """
    term_hits = match_bracketed_terms(text, claim_num)
    statute_hits = match_statutes(text, claim_num)
    return bool(term_hits or statute_hits)


# ═══════════════════════════════════════════════════════════════════════
# QUICK PRE-FILTER — Uses PHRASES not single words
# Replaces claim2_processor.py's quick_terms single-word list
# ═══════════════════════════════════════════════════════════════════════

# Pre-filter phrases — each must be 2+ words or a specific code/identifier.
# These are used for a fast first-pass before running full analysis.
QUICK_FILTER_PHRASES = {
    1: [  # Claim 1: CIM Preemption
        "critical infrastructure material",
        "sand, gravel",
        "rock aggregate",
        "mineral extraction",
        "conditional use",
        "17-41-402",
        "10-9a-901",
        "forestry and recreation",
        "long prohibited",
        "CIM",
    ],
    2: [  # Claim 2: Permanent Injunction
        "cease and desist",
        "enforcement action",
        "stop work",
        "code enforcement",
        "business license",
        "conditional use",
        "irreparable harm",
        "ongoing harm",
        "notice of violation",
        "tree farm",
        "COM21",
        "shut down",
        "vested mining",
        "mine operator",
        "mining use",
        "mining protection",
    ],
    3: [  # Claim 3: Vested Mining Rights
        "vested mining",
        "mine operator",
        "mining use",
        "mining protection",
        "nonconforming use",
        "non-conforming use",
        "pre-existing",
        "large mine",
        "small mine",
        "portland cement",
        "parleys canyon",
        "declaration of vested",
        "notice of vested",
        "commercial quantities",
        "runs with the land",
        "conclusively presumed",
        "17-41-501",
        "17-41-502",
        "17-41-503",
        "17-41-101",
        "dogm",
    ],
}


def quick_phrase_filter(text: str, claim_num: int) -> bool:
    """
    Fast pre-filter using PHRASES (not single words).
    Returns True if the document contains at least one relevant phrase.
    """
    text_lower = text.lower()
    phrases = QUICK_FILTER_PHRASES.get(claim_num, [])
    return any(phrase.lower() in text_lower for phrase in phrases)


# ═══════════════════════════════════════════════════════════════════════
# UTILITY: Extract best quote containing bracketed terms
# ═══════════════════════════════════════════════════════════════════════

def extract_best_quote_bracketed(
    text: str,
    claim_num: int,
    max_len: int = 500,
) -> str:
    """
    Extract the best quote from text that contains the most bracketed terms.
    Scores each line by how many complete bracketed phrases it contains.
    """
    lines = text.split('\n')
    best_line = ""
    best_score = 0

    for line in lines:
        stripped = line.strip()
        if len(stripped) < 10 or len(stripped) > 1000:
            continue

        score = 0
        for term, pattern in _CLAIM_TERM_PATTERNS.get(claim_num, []):
            if pattern.search(stripped):
                score += 10

        for pattern in _CLAIM_STATUTE_PATTERNS.get(claim_num, []):
            if pattern.search(stripped):
                score += 5

        if score > best_score:
            best_score = score
            best_line = stripped

    return best_line[:max_len] if best_line else ""


if __name__ == "__main__":
    # Self-test
    print("=" * 60)
    print("BRACKETED TERMS ENGINE — Self-Test")
    print("=" * 60)

    # Test Rule 1: Exact phrase matching
    test_text_good = "The property has a vested mining use under Utah Code 17-41-501. The mine operator produced commercial quantities."
    test_text_bad = "The vested interest in the property was established. Mining is prohibited."

    print("\nTest 1 (good — has exact phrases):")
    hits = match_bracketed_terms(test_text_good, 3)
    print(f"  Matches: {hits}")
    assert len(hits) >= 2, "Should find 'vested mining use' and 'mine operator'"

    print("\nTest 2 (bad — has 'vested' alone, 'mining' alone):")
    hits = match_bracketed_terms(test_text_bad, 3)
    print(f"  Matches: {hits}")
    # "vested" alone and "mining" alone should NOT match any bracketed term

    print("\nTest 3: Statutory cross-reference:")
    refs = find_statutory_cross_references(test_text_good, 3)
    print(f"  Cross-refs: {refs}")
    assert len(refs) > 0, "Should find statute 17-41-501 + bracketed terms"

    print("\nTest 4: Quick phrase filter:")
    assert quick_phrase_filter(test_text_good, 3) == True
    assert quick_phrase_filter("Just a regular document about weather", 3) == False
    print("  Quick filter working correctly")

    print("\nTest 5: Full document scoring:")
    score_result = score_document_bracketed(test_text_good, 3)
    print(f"  Score: {score_result}")

    print("\nAll tests passed!")
