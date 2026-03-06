#!/usr/bin/env python3
"""
Claim 2: Permanent Injunction — Refocused Discovery Analysis v2
Tree Farm LLC v. Salt Lake County (Case No. 220903418)

SAME AS CLAIM 1 but seeking INJUNCTIVE RELIEF (stop enforcing) instead
of declaratory judgment (declare ordinance invalid).

STRATEGY: CIM language EXCLUDED. Focus on:
1. CLAIM 2: INJUNCTION + VESTED MINING (same as Claim 1/3 foundation)
2. ENFORCEMENT ACTIONS against Tree Farm
3. ADMINISTRATIVE TRAP (require CUP while eliminating CUP)
4. ONGOING HARM from enforcement

With deduplication and explicit statutory language.
Searches ALL 5,576 discovery documents.
"""

import sqlite3
import os
import re
import sys
import json
import hashlib
from datetime import datetime

DB_PATH = os.path.expanduser("~/tree-farm-discovery/master.db")
DATA_ROOT = "/home/user/casebreak/data"
FOLDERS = ["discovery-0001", "discovery-0002", "discovery-0003",
           "discovery-0004", "discovery-0005", "discovery-0006"]

# Output file for results
OUTPUT_PATH = "/home/user/casebreak/binder/CLAIM2_INJUNCTION_VESTED_RESULTS.md"

# ── CLAIM 2: INJUNCTION + VESTED MINING KEYWORD TIERS ─────────────────────────────────
# NO CIM language in critical/high tiers. Pure vested mining focus.
# EXPLICIT STATUTORY LANGUAGE — not just section numbers.

# CRITICAL: Direct proof of vested mining rights, verbatim statutory
# language, county knowledge of prior mining operations, staff admissions
CRITICAL_PATTERNS = [
    # ── Statute section numbers (both old and potential renumbered) ──
    r'17[\-\s]*41[\-\s]*501',           # vested mining use statute
    r'17[\-\s]*41[\-\s]*502',           # expansion of vested mining use
    r'17[\-\s]*41[\-\s]*503',           # abandonment (only by written declaration)
    r'17[\-\s]*41[\-\s]*101',           # definitions (mine operator, mining use, etc.)
    r'17[\-\s]*41[\-\s]*402',           # limitations on local regulations
    r'17[\-\s]*41[\-\s]*403',           # nuisance protections
    r'17[\-\s]*27a[\-\s]*100[1-5]',     # CIM vested operations (county-specific)
    r'10[\-\s]*9a[\-\s]*90[1-5]',       # CIM vested operations (municipality)
    # Renumbered versions
    r'17[\-\s]*81[\-\s]*401',
    r'17[\-\s]*81[\-\s]*402',
    r'17[\-\s]*81[\-\s]*403',

    # ── VERBATIM STATUTORY LANGUAGE (every word matters) ──
    # Statutory terms of art — exact phrases from the statute
    r'vested\s+mining\s+use',           # defined term: Utah Code 17-41-101
    r'vested\s+mining\s+right',         # common variation
    r'mine\s+operator',                 # defined term: 17-41-101(13)
    r'mining\s+protection\s+area',      # defined term: 17-41-101(15)
    r'mining\s+use',                    # defined term: 17-41-101(16)
    r'declaration\s+of\s+vested',       # the recorded declarations
    r'notice\s+of\s+vested',            # notice filings

    # Statutory qualifiers — the exact language that defines who qualifies
    r'owns,?\s+controls,?\s+or\s+manages',  # mine operator definition
    r'produced\s+commercial\s+quantities',   # mine operator qualification
    r'commercial\s+quantities\s+of\s+a\s+mineral\s+deposit',  # exact statutory phrase
    r'as\s+of\s+january\s+1,?\s+200?9',     # the critical date qualifier for mine operator
    r'as\s+of\s+january\s+1,?\s+2019',      # the CIM operations date qualifier

    # Statutory rights language — what the statute actually says
    r'runs?\s+with\s+the\s+land',            # vested right is a property right
    r'runs?\s+with\s+and\s+bind',            # "runs with and binds the land"
    r'conclusively\s+presumed',              # irrebuttable presumption standard
    r'highest\s+priority\s+use',             # statutory use priority
    r'written\s+declaration\s+of\s+abandonment',  # ONLY way to abandon
    r'express\s+abandonment',                # the abandonment standard
    r'sound\s+mining\s+practices',           # nuisance defense standard
    r'prohibits?,?\s+restricts?,?\s+or\s+otherwise\s+limits?',  # statutory trigger

    # Statutory expansion rights
    r'progress,?\s+extend,?\s+enlarge,?\s+grow,?\s+or\s+expand',  # 17-41-502 language
    r'expand\s+the\s+vested\s+mining\s+use',
    r'contiguous\s+and\s+related\s+in\s+mineralization',  # expansion to new land
    r'same\s+mineral\s+trend',              # expansion criterion
    r'geologic\s+offshoot',                 # expansion criterion

    # County knowledge of prior mining
    r'(exist|prior|pre[\-\s]?exist)\w*\s+(mining|mine|quarr)',
    r'(mining|mine|quarr)\w*\s+.{0,20}(exist|prior|already|before)',
    r'non[\-\s]?conforming\s+use\s+status',
    r'legal\s+nonconforming',
    r'(mining|mine)\s+.{0,15}(1890|189\d|190\d|191\d|192\d)',
    r'portland\s+cement',

    # Staff admissions about mining
    r'staff\s+recommend.*(?:mining|mine|quarr|extract)',
    r'(?:mining|mine|quarr|extract).{0,40}staff\s+recommend',
    r'continue\s+to\s+be\s+a\s+conditional\s+use',
    r'should\s+continue.*conditional\s+use',
    r'such\s+language\s+is\s+not\s+necessary',  # the key staff quote

    # County internal acknowledgments
    r'raised\s+the\s+question.*(?:mining|mineral|extraction)',
    r'notice\s+of\s+intention.*(?:mining|mine|large|small)',

    # ── CLAIM 2 SPECIFIC: Enforcement / Injunction evidence ──
    # Direct enforcement actions
    r'cease\s+and\s+desist',
    r'enforcement\s+action',
    r'(?:stop|shut\s*down|halt)\s+(?:all\s+)?(?:mining|quarr|operation|extract)',
    r'(?:revoke|revoked|revoking)\s+.{0,30}(?:permit|license|approval)',
    r'(?:permit|license|approval)\s+.{0,20}(?:revoke|revoked)',
    r'order\s+to\s+(?:stop|cease|halt)',
    r'cannot\s+(?:legally\s+)?operate',
    # Business license denial (COM21-1590)
    r'COM21[\-\.]?1590',
    r'business\s+license\s+(?:denial|denied|deny|reject)',
    r'(?:denial|denied|deny|reject)\s+.{0,30}business\s+license',
    # Administrative trap: require CUP while eliminating CUP
    r'(?:without|lacks?|no)\s+.{0,20}conditional\s+use\s+permit',
    r'conditional\s+use\s+(?:permit\s+)?.*(?:not\s+available|eliminated|removed|no\s+longer)',
    r'(?:eliminat|remov)\w+\s+.{0,30}(?:CUP|conditional\s+use)',
    r'(?:cannot|can\s*not)\s+.{0,30}(?:get|obtain|apply)\s+.{0,20}(?:CUP|permit|license)',
    # Ongoing harm
    r'(?:irreparable|ongoing|continuing)\s+(?:harm|damage|injury)',
    r'(?:harm|damage|injur)\w*\s+.{0,30}(?:tree\s+farm|mining|operation|business)',
]

# HIGH: Evidence of county awareness, ordinance targeting, mining history
HIGH_PATTERNS = [
    # Mining operations references
    r'large\s+mine\s+permit',
    r'small\s+mine\s+(?:permit|NOI|notice)',
    r'notice\s+of\s+intention.*(?:mining|mine|commence)',
    r'(?:mining|mine)\s+.*(?:notice|NOI)\s+of\s+intention',
    r'division\s+of\s+oil.*(?:gas|mining)',  # state mining agency (spelled out, not acronym)
    # Nonconforming use language
    r'nonconforming|non[\-\s]conforming',
    r'grandfathered?\s+(?:use|right|mining|operation)',
    r'(?:use|right|mining|operation)\s+.*grandfathered',
    r'pre[\-\s]?existing\s+(?:use|right|mining|operation)',
    r'(?:use|right|mining|operation)\s+.*pre[\-\s]?existing',
    r'prior\s+(?:use|right|mining|operation)',
    # Ordinance targeting Tree Farm specifically
    r'tree\s+farm.*(?:mining|mine|quarr|extract|operation)',
    r'(?:mining|mine|quarr|extract|operation).*tree\s+farm',
    r'(?:triggered|initiated|prompted|caused)\s+by.*(?:tree\s+farm|notice|application)',
    r'(?:tree\s+farm|notice|application).*(?:triggered|initiated|prompted|caused)',
    # Conditional use as it relates to mining
    r'conditional\s+use.*(?:mining|mine|quarr|mineral|extract|gravel|sand)',
    r'(?:mining|mine|quarr|mineral|extract|gravel|sand).*conditional\s+use',
    r'19[\.\-]12[\.\-]030',
    r'(?:eliminate|remove|prohibit).*conditional\s+use',
    r'conditional\s+use.*(?:eliminate|remove|prohibit)',
    # Mining history evidence
    r'(?:mining|mine|quarr)\w*\s+(?:histor|operation|activit)',
    r'(?:commercial|production)\s+(?:quantities|tons|volume)',
    r'(?:90[\s,]*000|725[\s,]*000|386[\s,]*485)\s+tons',
    r'parleys?\s+canyon.*(?:mining|mine|quarr|aggregate|gravel)',
    r'(?:mining|mine|quarr|aggregate|gravel).*parleys?\s+canyon',
    # County staff discussing mining operations
    r'(?:aware|know|knew|knowledge).*(?:mining|mine|quarr|operation)',
    r'(?:mining|mine|quarr|operation).*(?:aware|know|knew|knowledge)',
    # Carrier case — NARROWED to avoid false positives
    r'carrier\s+(?:v\.|vs?\.?|case|decision|ruling)',
    r'(?:court|supreme).*carrier',
    r'2002\s+.*(?:court|decision|ruling|case)',
    # DOGM spelled out (case-insensitive matching handles acronym)
    r'dogm',
]

# MEDIUM: Contextual mining/ordinance references
MEDIUM_PATTERNS = [
    r'(?:mining|mine|quarr)\w*\s+(?:use|right|claim|permit|license)',
    r'(?:gravel|sand|aggregate|rock)\s+(?:extract|mining|quarr|pit|operation)',
    r'mineral\s+(?:extract|right|estate|interest|deposit)',
    r'(?:mining|mine)\s+(?:claim|patent)',
    r'patented\s+(?:claim|mining)',
    r'(?:ordinance|amend).*(?:mining|mine|quarr|mineral|extract)',
    r'(?:mining|mine|quarr|mineral|extract).*(?:ordinance|amend)',
    r'forestry.*recreation\s+zone|FR[\-\s]+zone',
    r'(?:prohibit|ban|eliminat).*(?:mining|mine|quarr|mineral|extract)',
    r'(?:mining|mine|quarr|mineral|extract).*(?:prohibit|ban|eliminat)',
    r'(?:zoning|zone).*(?:mining|mine|quarr|mineral)',
    r'(?:mining|mine|quarr|mineral).*(?:zoning|zone)',
    r'land\s+use.*(?:mining|mine|quarr)',
    r'(?:mining|mine|quarr).*land\s+use',
    r'property\s+right',
    r'takings?\s+(?:claim|analysis|test|issue)',
    r'regulatory\s+taking',
    r'penn\s+central',
    r'economically\s+viable',
    r'investment[\-\s]backed\s+expectation',
    r'(?:target|single|discriminat|spot\s+zon).*(?:tree\s+farm|mining|mine|property)',
    r'(?:tree\s+farm|mining|mine|property).*(?:target|single|discriminat|spot\s+zon)',
    r'due\s+process',
    r'equal\s+protection',
]

# LOW: Tangential references (kept minimal — no CIM clutter)
# RULE 1: No single-word matches. Every pattern is a multi-word phrase.
LOW_PATTERNS = [
    r'\bmining\s+(?:operation|activit|permit|claim|right)\b',  # "mining" + qualifier, not alone
    r'\bquarr[yi]\w*\s+(?:operation|permit|site|pit)\b',       # "quarry" + qualifier, not alone
    r'\bgravel\s+pit\b',           # two-word phrase
    r'\btree\s+farm\b',            # two-word phrase (party name)
    r'\borganic\s+act\b',          # two-word phrase
    r'\breclamation\s+(?:plan|bond|requirement|effort)\b',  # "reclamation" + qualifier
]

# ── EXCLUSION PATTERNS ──────────────────────────────────────────────────
CIM_ONLY_PATTERNS = [
    r'\bcritical\s+infrastructure\s+material',
    r'\bCIM\b',
]


# ── PATTERN → ENGLISH TRANSLATION ──────────────────────────────────────────
# Maps regex patterns to plain English descriptions so attorneys see
# human-readable reasoning, NOT code.
PATTERN_DESCRIPTIONS = {
    # Statute references
    r'17[\-\s]*41[\-\s]*501': "References Utah Code 17-41-501 (Vested Mining Use statute)",
    r'17[\-\s]*41[\-\s]*502': "References Utah Code 17-41-502 (Expansion of Vested Mining Use)",
    r'17[\-\s]*41[\-\s]*503': "References Utah Code 17-41-503 (Abandonment — written declaration only)",
    r'17[\-\s]*41[\-\s]*101': "References Utah Code 17-41-101 (Mining definitions)",
    r'17[\-\s]*41[\-\s]*402': "References Utah Code 17-41-402 (Limits on local regulations)",
    r'17[\-\s]*41[\-\s]*403': "References Utah Code 17-41-403 (Nuisance protections)",
    r'17[\-\s]*27a[\-\s]*100[1-5]': "References CIM vested operations statute (county)",
    r'10[\-\s]*9a[\-\s]*90[1-5]': "References CIM vested operations statute (municipality)",
    r'17[\-\s]*81[\-\s]*401': "References renumbered Utah Code 17-81-401",
    r'17[\-\s]*81[\-\s]*402': "References renumbered Utah Code 17-81-402",
    r'17[\-\s]*81[\-\s]*403': "References renumbered Utah Code 17-81-403",
    # Statutory defined terms
    r'vested\s+mining\s+use': "Contains statutory term 'vested mining use'",
    r'vested\s+mining\s+right': "Contains term 'vested mining right'",
    r'mine\s+operator': "Contains statutory term 'mine operator'",
    r'mining\s+protection\s+area': "Contains statutory term 'mining protection area'",
    r'mining\s+use': "Contains statutory term 'mining use'",
    r'declaration\s+of\s+vested': "References a declaration of vested mining use",
    r'notice\s+of\s+vested': "References a notice of vested mining use",
    # Statutory qualifiers
    r'owns,?\s+controls,?\s+or\s+manages': "Contains statutory 'owns, controls, or manages' language",
    r'produced\s+commercial\s+quantities': "References 'produced commercial quantities' (mine operator qualifier)",
    r'commercial\s+quantities\s+of\s+a\s+mineral\s+deposit': "Contains exact statutory phrase for mine operator qualification",
    r'as\s+of\s+january\s+1,?\s+200?9': "References the critical date qualifier (January 1, 2009)",
    r'as\s+of\s+january\s+1,?\s+2019': "References the CIM operations date qualifier (January 1, 2019)",
    # Statutory rights language
    r'runs?\s+with\s+the\s+land': "Contains 'runs with the land' — vested right is a property right",
    r'runs?\s+with\s+and\s+bind': "Contains 'runs with and binds the land'",
    r'conclusively\s+presumed': "Contains 'conclusively presumed' — irrebuttable presumption standard",
    r'highest\s+priority\s+use': "Contains 'highest priority use' — statutory use priority",
    r'written\s+declaration\s+of\s+abandonment': "References 'written declaration of abandonment' — only way to abandon",
    r'express\s+abandonment': "References 'express abandonment' standard",
    r'sound\s+mining\s+practices': "Contains 'sound mining practices' — nuisance defense",
    r'prohibits?,?\s+restricts?,?\s+or\s+otherwise\s+limits?': "Contains statutory trigger language",
    # Expansion rights
    r'progress,?\s+extend,?\s+enlarge,?\s+grow,?\s+or\s+expand': "Contains 17-41-502 expansion language",
    r'expand\s+the\s+vested\s+mining\s+use': "References right to expand vested mining use",
    r'contiguous\s+and\s+related\s+in\s+mineralization': "Contains expansion criterion language",
    r'same\s+mineral\s+trend': "References 'same mineral trend' expansion criterion",
    r'geologic\s+offshoot': "References 'geologic offshoot' expansion criterion",
    # County knowledge / prior mining
    r'(exist|prior|pre[\-\s]?exist)\w*\s+(mining|mine|quarr)': "Acknowledges existing/prior mining operations",
    r'(mining|mine|quarr)\w*\s+.{0,20}(exist|prior|already|before)': "References mining predating current ordinance",
    r'non[\-\s]?conforming\s+use\s+status': "Acknowledges nonconforming use status",
    r'legal\s+nonconforming': "References legal nonconforming use",
    r'(mining|mine)\s+.{0,15}(1890|189\d|190\d|191\d|192\d)': "References historical mining dating to 1890s-1920s",
    r'portland\s+cement': "References Portland Cement Company (historical mining operator)",
    # Staff admissions
    r'staff\s+recommend.*(?:mining|mine|quarr|extract)': "County staff recommendation regarding mining",
    r'(?:mining|mine|quarr|extract).{0,40}staff\s+recommend': "Staff recommendation about mining operations",
    r'continue\s+to\s+be\s+a\s+conditional\s+use': "Staff acknowledged mining should continue as conditional use",
    r'should\s+continue.*conditional\s+use': "Staff recommended continued conditional use for mining",
    r'such\s+language\s+is\s+not\s+necessary': "Key staff admission: prohibition language 'not necessary'",
    # County internal
    r'raised\s+the\s+question.*(?:mining|mineral|extraction)': "County raised questions about mining/extraction",
    r'notice\s+of\s+intention.*(?:mining|mine|large|small)': "References a Notice of Intention to mine",
    # Enforcement / Injunction
    r'cease\s+and\s+desist': "Contains 'cease and desist' — direct enforcement action",
    r'enforcement\s+action': "References enforcement action",
    r'(?:stop|shut\s*down|halt)\s+(?:all\s+)?(?:mining|quarr|operation|extract)': "References stopping/shutting down mining operations",
    r'(?:revoke|revoked|revoking)\s+.{0,30}(?:permit|license|approval)': "References revoking permits/licenses/approvals",
    r'(?:permit|license|approval)\s+.{0,20}(?:revoke|revoked)': "References permit/license revocation",
    r'order\s+to\s+(?:stop|cease|halt)': "Contains an order to stop/cease operations",
    r'cannot\s+(?:legally\s+)?operate': "States Tree Farm cannot legally operate",
    r'COM21[\-\.]?1590': "References business license application COM21-1590",
    r'business\s+license\s+(?:denial|denied|deny|reject)': "References business license denial",
    r'(?:denial|denied|deny|reject)\s+.{0,30}business\s+license': "References denial of business license",
    r'(?:without|lacks?|no)\s+.{0,20}conditional\s+use\s+permit': "Notes absence of conditional use permit",
    r'conditional\s+use\s+(?:permit\s+)?.*(?:not\s+available|eliminated|removed|no\s+longer)': "CUP no longer available — administrative trap",
    r'(?:eliminat|remov)\w+\s+.{0,30}(?:CUP|conditional\s+use)': "References elimination/removal of CUP category",
    r'(?:cannot|can\s*not)\s+.{0,30}(?:get|obtain|apply)\s+.{0,20}(?:CUP|permit|license)': "States inability to obtain CUP/permit/license",
    r'(?:irreparable|ongoing|continuing)\s+(?:harm|damage|injury)': "Documents irreparable/ongoing harm",
    r'(?:harm|damage|injur)\w*\s+.{0,30}(?:tree\s+farm|mining|operation|business)': "Documents harm to Tree Farm/mining operations",
    # HIGH tier
    r'large\s+mine\s+permit': "References Large Mine Permit",
    r'small\s+mine\s+(?:permit|NOI|notice)': "References Small Mine Permit or Notice of Intention",
    r'notice\s+of\s+intention.*(?:mining|mine|commence)': "References Notice of Intention to commence mining",
    r'(?:mining|mine)\s+.*(?:notice|NOI)\s+of\s+intention': "References mining Notice of Intention",
    r'division\s+of\s+oil.*(?:gas|mining)': "References DOGM (Division of Oil, Gas, and Mining)",
    r'nonconforming|non[\-\s]conforming': "References nonconforming use",
    r'grandfathered?\s+(?:use|right|mining|operation)': "References grandfathered mining use/right",
    r'(?:use|right|mining|operation)\s+.*grandfathered': "References grandfathered operations",
    r'pre[\-\s]?existing\s+(?:use|right|mining|operation)': "References pre-existing mining use/right",
    r'(?:use|right|mining|operation)\s+.*pre[\-\s]?existing': "References pre-existing operations",
    r'prior\s+(?:use|right|mining|operation)': "References prior mining use/right",
    r'tree\s+farm.*(?:mining|mine|quarr|extract|operation)': "References Tree Farm mining operations",
    r'(?:mining|mine|quarr|extract|operation).*tree\s+farm': "References mining operations at Tree Farm",
    r'(?:triggered|initiated|prompted|caused)\s+by.*(?:tree\s+farm|notice|application)': "Ordinance was triggered by Tree Farm's actions",
    r'(?:tree\s+farm|notice|application).*(?:triggered|initiated|prompted|caused)': "Tree Farm's application triggered the ordinance",
    r'conditional\s+use.*(?:mining|mine|quarr|mineral|extract|gravel|sand)': "Discusses conditional use for mining/extraction",
    r'(?:mining|mine|quarr|mineral|extract|gravel|sand).*conditional\s+use': "Mining/extraction as conditional use",
    r'19[\.\-]12[\.\-]030': "References ordinance section 19.12.030",
    r'(?:eliminate|remove|prohibit).*conditional\s+use': "References elimination/prohibition of conditional use",
    r'conditional\s+use.*(?:eliminate|remove|prohibit)': "Conditional use eliminated or prohibited",
    r'(?:mining|mine|quarr)\w*\s+(?:histor|operation|activit)': "References mining history or operations",
    r'(?:commercial|production)\s+(?:quantities|tons|volume)': "References commercial production quantities",
    r'(?:90[\s,]*000|725[\s,]*000|386[\s,]*485)\s+tons': "References specific production tonnage figures",
    r'parleys?\s+canyon.*(?:mining|mine|quarr|aggregate|gravel)': "References mining in Parleys Canyon",
    r'(?:mining|mine|quarr|aggregate|gravel).*parleys?\s+canyon': "References Parleys Canyon mining",
    r'(?:aware|know|knew|knowledge).*(?:mining|mine|quarr|operation)': "County awareness of mining operations",
    r'(?:mining|mine|quarr|operation).*(?:aware|know|knew|knowledge)': "Knowledge of mining operations",
    r'carrier\s+(?:v\.|vs?\.?|case|decision|ruling)': "References Carrier case/decision",
    r'(?:court|supreme).*carrier': "References Carrier court ruling",
    r'2002\s+.*(?:court|decision|ruling|case)': "References 2002 court decision",
    r'dogm': "References DOGM (Division of Oil, Gas, and Mining)",
}


def _pattern_to_english(pattern):
    """Convert a regex pattern to a plain English description.
    Falls back to a cleaned-up version if no translation exists."""
    if pattern in PATTERN_DESCRIPTIONS:
        return PATTERN_DESCRIPTIONS[pattern]
    # Fallback: clean up the regex into something more readable
    cleaned = pattern
    cleaned = cleaned.replace(r'\s+', ' ')
    cleaned = cleaned.replace(r'\b', '')
    cleaned = cleaned.replace(r'\w*', '')
    cleaned = cleaned.replace(r'\w+', '')
    cleaned = cleaned.replace(r'[\-\s]*', '-')
    cleaned = cleaned.replace(r'[\-\s]', '-')
    cleaned = cleaned.replace(r'(?:', '(')
    cleaned = cleaned.replace(r'.{0,', '...')
    cleaned = re.sub(r'\}', '', cleaned)
    cleaned = re.sub(r'[\\|()]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return f"Matches pattern: {cleaned}"


def read_file(filepath):
    """Read file content, return as string."""
    try:
        with open(filepath, 'r', errors='replace') as f:
            return f.read()
    except Exception:
        return ""


def content_hash(text):
    """Generate a hash of normalized content for deduplication."""
    # Normalize: strip whitespace, lowercase, remove Bates stamps
    normalized = re.sub(r'SLCo\d+', '', text.lower())
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    # Use first 5000 chars for hash (enough to detect duplicates)
    return hashlib.md5(normalized[:5000].encode()).hexdigest()


def has_vested_mining_context(text_lower):
    """Check if document has any vested mining context at all.
    RULE 1: Uses BRACKETED TERMS only — multi-word exact phrases.
    Single words like 'vested' or 'mining' alone are NOT matches."""
    # Every term here is a multi-word phrase or statutory citation.
    # No single words. All words in each phrase must appear together.
    vested_terms = [
        r'vested\s+mining\s+use',       # exact phrase, not just "vested"
        r'vested\s+mining\s+right',      # exact phrase
        r'mine\s+operator',              # exact phrase, not just "mine"
        r'mining\s+use',                 # exact phrase, not just "mining"
        r'mining\s+protection\s+area',   # exact phrase
        r'nonconforming\s+use',          # exact phrase, not just "nonconforming"
        r'non[\-\s]conforming\s+use',    # variant
        r'pre[\-\s]?existing\s+(?:use|mining\s+use|mining\s+operation)',  # phrase
        r'prior\s+(?:mining\s+use|mining\s+operation|nonconforming\s+use)',  # phrase
        r'17[\-\s]*41[\-\s]*50[123]',    # statute citation
        r'17[\-\s]*81[\-\s]*40[123]',    # statute citation
        r'17[\-\s]*41[\-\s]*10[13]',     # statute citation
        r'17[\-\s]*41[\-\s]*40[23]',     # statute citation
        r'large\s+mine\s+permit',        # exact phrase, not just "large" or "mine"
        r'small\s+mine\s+permit',        # exact phrase
        r'portland\s+cement',            # exact phrase
        r'parleys?\s+canyon',            # exact phrase
        r'declaration\s+of\s+vested',    # exact phrase
        r'notice\s+of\s+vested',         # exact phrase
        r'mining\s+(?:operation|activit|histor|claim|right)',  # "mining" + qualifier
        r'runs?\s+with\s+the\s+land',    # exact statutory phrase
        r'conclusively\s+presumed',      # exact statutory phrase
        r'produced\s+commercial\s+quantities',  # exact statutory phrase
    ]
    for pat in vested_terms:
        if re.search(pat, text_lower):
            return True
    return False


def is_cim_only(text_lower):
    """Check if document is CIM-focused with NO vested mining content."""
    has_cim = any(re.search(p, text_lower) for p in CIM_ONLY_PATTERNS)
    if not has_cim:
        return False
    return not has_vested_mining_context(text_lower)


def score_document(text):
    """
    Score document for Claim 2 (Permanent Injunction + Vested Mining Rights) relevance.
    Returns tuple or None if not relevant.
    """
    text_lower = text.lower()
    text_upper = text

    if len(text_lower.strip()) < 10:
        return None

    if is_cim_only(text_lower):
        return "CIM_EXCLUDED"

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

    score = (len(critical_hits) * 10 + len(high_hits) * 5 +
             len(medium_hits) * 2 + len(low_hits) * 1)

    if score == 0:
        return None

    if critical_hits and score >= 15:
        relevance = "CRITICAL"
    elif critical_hits or (high_hits and score >= 10):
        relevance = "HIGH"
    elif high_hits or (medium_hits and score >= 6):
        relevance = "MEDIUM"
    elif medium_hits or score >= 3:
        relevance = "LOW"
    else:
        return None

    # Supports / Undermines
    undermine_patterns = [
        r'no\s+vested\s+(?:right|mining|use)',
        r'(?:vested|mining)\s+(?:right|use)\s+.*(?:not|no|invalid|fail)',
        r'(?:abandon|waiv|forfeit|relinquish)\w*\s+.*(?:mining|vested|right)',
        r'carrier.*(?:prohibit|prevent|no\s+mining)',
        r'(?:never|no)\s+(?:mining|mine|quarr).*(?:operation|activit)',
        r'(?:not|no)\s+(?:nonconforming|pre[\-\s]?existing|prior)',
        r'(?:mining|mine)\s+.*(?:not\s+permitted|prohibited|banned|illegal)',
        r'zoning\s+authority.*(?:override|supersede|control).*(?:mining|vested)',
    ]

    support_patterns = [
        r'vested\s+(?:mining|right|use)',
        r'mine\s+operator',
        r'mining\s+protection\s+area',
        r'(?:exist|prior|pre[\-\s]?exist)\w*\s+(?:mining|mine|quarr|operation)',
        r'non[\-\s]?conforming\s+use',
        r'legal\s+nonconforming',
        r'grandfathered',
        r'large\s+mine\s+permit',
        r'17[\-\s]*41[\-\s]*50[123]|17[\-\s]*81[\-\s]*40[123]',
        r'(?:mining|mine)\s+.*(?:histor|since|dating|continuous)',
        r'portland\s+cement',
        r'(?:triggered|initiated|prompted).*(?:tree\s+farm|application)',
        r'staff\s+recommend.*(?:remov|not\s+necessary)',
        r'continue\s+to\s+be\s+a\s+conditional\s+use',
        r'runs?\s+with\s+the\s+land',
        r'conclusively\s+presumed',
        r'produced\s+commercial\s+quantities',
    ]

    support_score = sum(1 for p in support_patterns if re.search(p, text_lower))
    undermine_score = sum(1 for p in undermine_patterns if re.search(p, text_lower))

    su = "SUPPORTS" if support_score >= undermine_score else "UNDERMINES"

    # Best quote extraction
    lines = text_upper.split('\n')
    best_line = ""
    best_line_score = 0
    for line in lines:
        if len(line.strip()) < 10:
            continue
        line_lower = line.lower()
        ls = 0
        for pat in CRITICAL_PATTERNS:
            if re.search(pat, line_lower):
                ls += 5
        for pat in HIGH_PATTERNS:
            if re.search(pat, line_lower):
                ls += 3
        for pat in MEDIUM_PATTERNS:
            if re.search(pat, line_lower):
                ls += 1
        if ls > best_line_score:
            best_line_score = ls
            best_line = line.strip()

    key_quote = best_line[:500] if best_line else ""

    # Reasoning — plain English descriptions, NOT regex code
    reasons = []
    if critical_hits:
        descs = [_pattern_to_english(p) for p, c in critical_hits[:4]]
        reasons.append(f"CRITICAL evidence: {'; '.join(descs)}")
    if high_hits:
        descs = [_pattern_to_english(p) for p, c in high_hits[:3]]
        reasons.append(f"HIGH evidence: {'; '.join(descs)}")
    if medium_hits:
        reasons.append(f"MEDIUM contextual references: {len(medium_hits)}")

    reasoning = ". ".join(reasons)[:1000]

    # Key finding detection
    is_sg = False
    sg_why = ""
    sg_use = ""

    if relevance == "CRITICAL":
        sg_indicators = [
            (r'(?:exist|current)\s+operation.*non[\-\s]?conforming\s+use\s+status',
             "County staff acknowledges existing operations have nonconforming use status",
             "Exhibit proving county KNEW about pre-existing mining operations before ordinance"),
            (r'such\s+language\s+is\s+not\s+necessary',
             "Staff said prohibition language 'not necessary in light of existing case law'",
             "Summary judgment exhibit: county's own staff said the prohibition was unnecessary"),
            (r'staff\s+recommend.*(?:not\s+necessary|remov|should\s+not)',
             "Staff recommended extraction language not necessary — admitted existing protections",
             "Summary judgment exhibit: county's own staff said the prohibition was unnecessary"),
            (r'continue\s+to\s+be\s+a\s+conditional\s+use.*(?:raised|question)',
             "Staff report admits ordinance was triggered by Tree Farm's specific application",
             "Exhibit proving ordinance targeted specific property owner, not general welfare"),
            (r'(?:raised|question).*(?:mineral|mining|extraction).*continue.*conditional',
             "Staff report admits ordinance triggered by Tree Farm filing",
             "Exhibit proving targeted legislation"),
            (r'vested\s+mining\s+use.*(?:declaration|notice|record)',
             "Recorded declaration of vested mining use under 17-41-501",
             "Foundation exhibit establishing statutory vested mining rights"),
            (r'runs?\s+with\s+(?:the\s+land|and\s+bind)',
             "Statutory language: vested mining use 'runs with the land'",
             "Foundation exhibit proving vested right is a property right, not personal"),
            (r'conclusively\s+presumed',
             "Statutory language: mining use 'conclusively presumed' — irrebuttable",
             "Foundation exhibit proving highest legal standard of protection"),
            (r'mine\s+operator.*(?:17[\-\s]*41|17[\-\s]*81|produced|commercial)',
             "Statutory mine operator qualification under Utah Code",
             "Foundation exhibit proving mine operator status and statutory protections"),
            (r'(?:mining|mine).*(?:1890|189\d).*(?:before|prior|statehood)',
             "Mining operations dating to 1890s — before Utah statehood",
             "Historical evidence of mining predating all county zoning by decades"),
            (r'large\s+mine\s+permit.*(?:approved|active|1996|1995|dogm)',
             "DOGM-approved Large Mine Permit active since 1996",
             "State approval exhibit proving continuous permitted mining operations"),
            (r'(?:90[\s,]*000|725[\s,]*000|386[\s,]*485)\s+tons',
             "Commercial production quantities documented — continuous mining",
             "Production records proving active, commercially viable mining operation"),
            (r'pending\s+ordinance.*(?:limit|prohibit|development).*mining',
             "County acknowledged pending ordinance would affect existing mining",
             "Exhibit showing county acted with knowledge of existing operations"),
            # Claim 2 specific key findings
            (r'COM21[\-\.]?1590',
             "Business license denial COM21-1590 — direct enforcement action",
             "Core exhibit proving active enforcement against Tree Farm mining operations"),
            (r'cease\s+and\s+desist.*tree\s+farm|tree\s+farm.*cease\s+and\s+desist',
             "Cease and desist directed at Tree Farm mining",
             "Direct enforcement action exhibit for injunction relief"),
            (r'(?:cannot|can\s*not)\s+(?:legally\s+)?operate.*(?:tree\s+farm|mining)',
             "Statement that Tree Farm cannot legally operate",
             "Enforcement posture exhibit proving need for injunctive relief"),
            (r'(?:eliminat|remov)\w+.*(?:CUP|conditional\s+use).*(?:require|need|must)',
             "Administrative trap: eliminated CUP while requiring CUP",
             "Catch-22 exhibit proving impossible compliance requirement"),
            (r'(?:irreparable|ongoing)\s+(?:harm|damage|injury).*(?:tree\s+farm|mining)',
             "Documents irreparable/ongoing harm to Tree Farm from enforcement",
             "Injunction element exhibit proving irreparable harm"),
        ]
        for pat, why, use in sg_indicators:
            if re.search(pat, text_lower):
                is_sg = True
                sg_why = why
                sg_use = use
                break

    doc_type = classify_doc_type(text_lower, text_upper)
    doc_date = extract_date(text_upper)
    doc_title = extract_title(lines)
    doc_summary = generate_summary(text_upper, key_quote)
    element = identify_element(text_lower, critical_hits, high_hits)

    return (relevance, su, reasoning, key_quote, is_sg, sg_why, sg_use,
            doc_title, doc_date, doc_type, doc_summary, element, score)


def identify_element(text_lower, critical_hits, high_hits):
    """Identify which Claim 3 element this document supports."""
    elements = []
    if re.search(r'(?:exist|prior|pre[\-\s]?exist|histor|1890|189\d|portland\s+cement|before\s+.*zon)', text_lower):
        elements.append("A-Prior-Use")
    if re.search(r'(?:large\s+mine|dogm|invest|permit.*approv|commercial\s+quantit|tons)', text_lower):
        elements.append("B-Investment")
    if re.search(r'(?:conditional\s+use|relied|reliance|good\s+faith|19[\.\-]12[\.\-]030)', text_lower):
        elements.append("C-Reliance")
    if re.search(r'(?:eliminat|prohibit|ban|destroy).*(?:mining|mine|quarr|extract|conditional\s+use)', text_lower):
        elements.append("D-Destruction")
    if re.search(r'(?:aware|know|knew|knowledge|acknowledge|admit|staff\s+report).*(?:mining|mine|quarr|operation)', text_lower):
        elements.append("E-Knowledge")
    return "|".join(elements) if elements else "General"


def classify_doc_type(text_lower, text_upper):
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
    return "document"


def extract_date(text):
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
    for line in lines[:10]:
        stripped = line.strip()
        if len(stripped) > 5 and not stripped.startswith('{') and not stripped.startswith('--'):
            return stripped[:200]
    return None


def generate_summary(text, key_quote):
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 10]
    summary = ' '.join(lines[:5])[:500]
    return summary


def process_all():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    stats = {
        'total': 0, 'reviewed': 0, 'relevant': 0,
        'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0,
        'key_findings': 0, 'supports': 0, 'undermines': 0,
        'empty': 0, 'not_relevant': 0, 'duplicates': 0,
        'cim_excluded': 0,
    }
    # Document type breakdown — track what kinds of documents are in the repository
    doc_type_counts = {}

    key_findings_list = []
    critical_docs = []
    all_relevant = []

    # ── DEDUPLICATION TRACKING ──────────────────────────────────────
    # hash → {'primary_bates': lowest_bates, 'all_bates': [list], 'data': result_dict}
    content_hashes = {}

    for folder in FOLDERS:
        folder_path = os.path.join(DATA_ROOT, folder)

        c.execute("SELECT id, bates, filename, file_path FROM documents WHERE discovery_folder=? ORDER BY bates", (folder,))
        docs = c.fetchall()

        print(f"\n{'='*60}")
        print(f"Processing {folder}: {len(docs)} documents")
        print(f"{'='*60}")

        folder_relevant = 0

        for i, (doc_id, bates, filename, file_path) in enumerate(docs):
            stats['total'] += 1

            full_path = os.path.join(folder_path, filename)
            if not os.path.exists(full_path) and file_path:
                full_path = file_path

            text = read_file(full_path)

            if len(text.strip()) < 10:
                stats['empty'] += 1
                stats['reviewed'] += 1
                continue

            # Track document type for every document (even if not relevant)
            dt = classify_doc_type(text.lower(), text)
            doc_type_counts[dt] = doc_type_counts.get(dt, 0) + 1

            result = score_document(text)

            if result == "CIM_EXCLUDED":
                stats['cim_excluded'] += 1
                stats['reviewed'] += 1
                c.execute("DELETE FROM claim_assignments WHERE doc_id=? AND claim_num=2", (doc_id,))
                c.execute("DELETE FROM smoking_guns WHERE doc_id=? AND claim_num=2", (doc_id,))
                continue

            if result is None:
                stats['not_relevant'] += 1
                stats['reviewed'] += 1
                c.execute("DELETE FROM claim_assignments WHERE doc_id=? AND claim_num=2", (doc_id,))
                c.execute("DELETE FROM smoking_guns WHERE doc_id=? AND claim_num=2", (doc_id,))
                continue

            (relevance, su, reasoning, key_quote, is_sg, sg_why, sg_use,
             doc_title, doc_date, doc_type, doc_summary, element, score) = result

            stats['reviewed'] += 1
            stats['relevant'] += 1
            stats[relevance] += 1
            folder_relevant += 1
            if su == "SUPPORTS":
                stats['supports'] += 1
            else:
                stats['undermines'] += 1

            # ── DEDUPLICATION CHECK ──────────────────────────────────
            chash = content_hash(text)
            if chash in content_hashes:
                # This is a duplicate — add bates to existing entry
                content_hashes[chash]['all_bates'].append(bates)
                stats['duplicates'] += 1
                # Still write to DB for completeness
                c.execute("DELETE FROM claim_assignments WHERE doc_id=? AND claim_num=2", (doc_id,))
                c.execute("""INSERT INTO claim_assignments
                            (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                            VALUES (?, 2, ?, ?, ?, ?)""",
                         (doc_id, relevance, su, reasoning, key_quote))
                c.execute("""UPDATE documents SET reviewed=1,
                            title=COALESCE(?, title), date=COALESCE(?, date),
                            type=COALESCE(?, type), summary=COALESCE(?, summary)
                            WHERE id=?""",
                         (doc_title, doc_date, doc_type, doc_summary, doc_id))
                continue  # Skip adding to output lists — it's a dupe

            # First time seeing this content
            content_hashes[chash] = {
                'primary_bates': bates,
                'all_bates': [bates],
                'data': {
                    'bates': bates,
                    'relevance': relevance,
                    'su': su,
                    'score': score,
                    'reasoning': reasoning,
                    'key_quote': key_quote,
                    'is_sg': is_sg,
                    'sg_why': sg_why,
                    'sg_use': sg_use,
                    'doc_title': doc_title,
                    'doc_date': doc_date,
                    'doc_type': doc_type,
                    'element': element,
                },
                'chash': chash,
            }

            all_relevant.append(content_hashes[chash])

            # Upsert claim assignment for Claim 3
            c.execute("DELETE FROM claim_assignments WHERE doc_id=? AND claim_num=2", (doc_id,))
            c.execute("""INSERT INTO claim_assignments
                        (doc_id, claim_num, relevance, supports_undermines, reasoning, key_quote)
                        VALUES (?, 2, ?, ?, ?, ?)""",
                     (doc_id, relevance, su, reasoning, key_quote))

            c.execute("""UPDATE documents SET reviewed=1,
                        title=COALESCE(?, title), date=COALESCE(?, date),
                        type=COALESCE(?, type), summary=COALESCE(?, summary)
                        WHERE id=?""",
                     (doc_title, doc_date, doc_type, doc_summary, doc_id))

            if is_sg:
                stats['key_findings'] += 1
                c.execute("DELETE FROM smoking_guns WHERE doc_id=? AND claim_num=2", (doc_id,))
                c.execute("""INSERT INTO smoking_guns
                            (doc_id, claim_num, why_critical, recommended_use)
                            VALUES (?, 2, ?, ?)""",
                         (doc_id, sg_why, sg_use))
                key_findings_list.append(content_hashes[chash])
                print(f"  *** KEY FINDING: {bates} - {sg_why}")

            if relevance == "CRITICAL":
                critical_docs.append(content_hashes[chash])

            if (i + 1) % 100 == 0:
                print(f"  [{folder}] {i+1}/{len(docs)} | Relevant: {folder_relevant}")
                conn.commit()

        print(f"  [{folder}] DONE: {len(docs)} processed, {folder_relevant} relevant")
        conn.commit()

    conn.commit()
    conn.close()

    return stats, key_findings_list, critical_docs, all_relevant, content_hashes, doc_type_counts


def write_results(stats, key_findings, critical_docs, all_relevant, content_hashes, doc_type_counts=None):
    """Write comprehensive deduplicated results to markdown file."""
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    # Count unique documents
    unique_count = len(all_relevant)

    with open(OUTPUT_PATH, 'w') as f:
        f.write("# CLAIM 2: INJUNCTION + VESTED MINING — Refocused Discovery Analysis v2\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Claim 2:** Permanent Injunction + Vested Mining Rights\n")
        f.write(f"**Strategy:** CIM EXCLUDED. Pure vested mining focus.\n")
        f.write(f"**Deduplication:** ON — same document with different Bates stamps consolidated.\n")
        f.write(f"**Statutory Language:** VERBATIM phrases searched, not just section numbers.\n\n")

        f.write("---\n\n")
        f.write("## SUMMARY STATISTICS — 100% DOCUMENT COVERAGE\n\n")
        f.write("### Repository Coverage\n\n")
        f.write(f"| Metric | Count | % of Total |\n")
        f.write(f"|--------|-------|------------|\n")
        f.write(f"| **Total documents in repository** | **{stats['total']}** | **100%** |\n")
        f.write(f"| Documents analyzed | {stats['reviewed']} | {stats['reviewed']*100//max(stats['total'],1)}% |\n")
        f.write(f"| CIM-only documents (excluded from results) | {stats['cim_excluded']} | {stats['cim_excluded']*100//max(stats['total'],1)}% |\n")
        f.write(f"| Empty/trivial documents | {stats['empty']} | {stats['empty']*100//max(stats['total'],1)}% |\n")
        f.write(f"| Not relevant to this claim | {stats['not_relevant']} | {stats['not_relevant']*100//max(stats['total'],1)}% |\n")
        accounted = stats['relevant'] + stats['cim_excluded'] + stats['empty'] + stats['not_relevant']
        f.write(f"| **Total accounted for** | **{accounted}** | **{accounted*100//max(stats['total'],1)}%** |\n\n")

        f.write("> **Note:** CIM (Critical Infrastructure Materials) documents are excluded from\n")
        f.write("> this claim's analysis because Claim 2 focuses on vested mining rights, not CIM\n")
        f.write("> preemption. These documents ARE analyzed — they are specifically identified and\n")
        f.write("> set aside. Every document in the repository is accounted for.\n\n")

        # Document type breakdown
        if doc_type_counts:
            f.write("### Document Type Breakdown (All Documents)\n\n")
            f.write(f"| Document Type | Count | % of Total |\n")
            f.write(f"|--------------|-------|------------|\n")
            for dt, count in sorted(doc_type_counts.items(), key=lambda x: -x[1]):
                pct = count * 100 // max(stats['total'], 1)
                f.write(f"| {dt} | {count} | {pct}% |\n")
            f.write(f"\n")

        f.write("### Relevance Results\n\n")
        f.write(f"| Relevance Tier | Count |\n")
        f.write(f"|----------------|-------|\n")
        f.write(f"| Relevant to Claim 2 (total) | {stats['relevant']} |\n")
        f.write(f"| **Unique documents (deduplicated)** | **{unique_count}** |\n")
        f.write(f"| Duplicate Bates stamps removed | {stats['duplicates']} |\n")
        f.write(f"| CRITICAL | {stats['CRITICAL']} |\n")
        f.write(f"| HIGH | {stats['HIGH']} |\n")
        f.write(f"| MEDIUM | {stats['MEDIUM']} |\n")
        f.write(f"| LOW | {stats['LOW']} |\n")
        f.write(f"| Key Findings (unique) | {len(key_findings)} |\n")
        f.write(f"| Supports our claim | {stats['supports']} |\n")
        f.write(f"| Undermines our claim | {stats['undermines']} |\n\n")

        # Key findings section — DEDUPLICATED
        f.write("---\n\n")
        f.write("## KEY FINDINGS (Deduplicated)\n\n")
        if key_findings:
            for i, entry in enumerate(key_findings, 1):
                d = entry['data']
                all_bates = entry['all_bates']
                f.write(f"### SG-{i}: {d['bates']} (primary)\n")
                if len(all_bates) > 1:
                    dupes = [b for b in all_bates if b != d['bates']]
                    f.write(f"- **Also appears as:** {', '.join(dupes)}\n")
                f.write(f"- **Why critical:** {d['sg_why']}\n")
                f.write(f"- **Recommended use:** {d['sg_use']}\n")
                f.write(f"- **Date:** {d.get('doc_date', 'Unknown')}\n")
                f.write(f"- **Type:** {d.get('doc_type', 'Unknown')}\n")
                f.write(f"- **Element:** {d.get('element', 'General')}\n")
                f.write(f"- **Key quote:** \"{d['key_quote'][:300]}\"\n\n")
        else:
            f.write("*No key findings identified.*\n\n")

        # Critical documents section — DEDUPLICATED
        f.write("---\n\n")
        f.write("## CRITICAL DOCUMENTS (Deduplicated)\n\n")
        if critical_docs:
            for entry in critical_docs:
                d = entry['data']
                all_bates = entry['all_bates']
                f.write(f"### {d['bates']}\n")
                if len(all_bates) > 1:
                    dupes = [b for b in all_bates if b != d['bates']]
                    f.write(f"- **Also appears as:** {', '.join(dupes)}\n")
                f.write(f"- **{d['su']}** | Date: {d.get('doc_date', 'Unknown')} | Type: {d.get('doc_type', 'Unknown')}\n")
                f.write(f"- **Element:** {d.get('element', 'General')}\n")
                f.write(f"- **Reasoning:** {d['reasoning'][:200]}\n")
                f.write(f"- **Quote:** \"{d['key_quote'][:200]}\"\n\n")
        else:
            f.write("*No critical documents identified.*\n\n")

        # Element breakdown
        f.write("---\n\n")
        f.write("## EVIDENCE BY CLAIM ELEMENT (Deduplicated)\n\n")
        elements = {}
        for entry in all_relevant:
            d = entry['data']
            for elem in d['element'].split('|'):
                if elem not in elements:
                    elements[elem] = {'CRITICAL': [], 'HIGH': [], 'MEDIUM': [], 'LOW': []}
                elements[elem][d['relevance']].append(d['bates'])

        for elem in sorted(elements.keys()):
            counts = elements[elem]
            total = sum(len(v) for v in counts.values())
            f.write(f"### {elem} ({total} unique documents)\n")
            for level in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
                if counts[level]:
                    bates_list = ', '.join(counts[level][:20])
                    more = f" (+{len(counts[level])-20} more)" if len(counts[level]) > 20 else ""
                    f.write(f"- **{level}** ({len(counts[level])}): {bates_list}{more}\n")
            f.write("\n")

        # All relevant documents sorted by score — DEDUPLICATED
        f.write("---\n\n")
        f.write("## ALL RELEVANT DOCUMENTS — Deduplicated, by score\n\n")
        sorted_entries = sorted(all_relevant, key=lambda x: x['data']['score'], reverse=True)
        for entry in sorted_entries[:200]:
            d = entry['data']
            all_bates = entry['all_bates']
            dupe_str = ""
            if len(all_bates) > 1:
                dupes = [b for b in all_bates if b != d['bates']]
                dupe_str = f" | **DUPES:** {', '.join(dupes)}"
            f.write(f"- **{d['bates']}** [{d['relevance']}] (score: {d['score']}) ")
            f.write(f"| {d['su']} | {d.get('doc_type', '')} | {d.get('doc_date', '')}")
            f.write(f" | Element: {d['element']}{dupe_str}\n")
            if d['key_quote']:
                f.write(f"  > \"{d['key_quote'][:150]}...\"\n")

    print(f"\nResults written to: {OUTPUT_PATH}")


if __name__ == "__main__":
    print("=" * 60)
    print("CLAIM 2: INJUNCTION + VESTED MINING — Refocused Analysis v2")
    print("DEDUP ON | EXPLICIT STATUTORY LANGUAGE | All 5,576 Docs")
    print("=" * 60)
    print(f"Database: {DB_PATH}")
    print(f"Data root: {DATA_ROOT}")
    print(f"Folders: {FOLDERS}")
    print(f"Output: {OUTPUT_PATH}")
    print()

    stats, sgs, crits, all_rel, chashes, dtcounts = process_all()

    write_results(stats, sgs, crits, all_rel, chashes, dtcounts)

    # Print summary
    unique_count = len(all_rel)
    print("\n" + "=" * 60)
    print("FINAL RESULTS — CLAIM 2: INJUNCTION + VESTED MINING v2")
    print("=" * 60)
    print(f"Total documents in repo:    {stats['total']} (100%)")
    print(f"  Documents analyzed:       {stats['reviewed']} ({stats['reviewed']*100//max(stats['total'],1)}%)")
    print(f"  CIM-only (excluded):      {stats['cim_excluded']} ({stats['cim_excluded']*100//max(stats['total'],1)}%)")
    print(f"  Empty/trivial:            {stats['empty']} ({stats['empty']*100//max(stats['total'],1)}%)")
    print(f"  Not relevant:             {stats['not_relevant']} ({stats['not_relevant']*100//max(stats['total'],1)}%)")
    accounted = stats['relevant'] + stats['cim_excluded'] + stats['empty'] + stats['not_relevant']
    print(f"  TOTAL ACCOUNTED:          {accounted} ({accounted*100//max(stats['total'],1)}%)")
    print(f"Relevant (total):           {stats['relevant']}")
    print(f"  CRITICAL:                 {stats['CRITICAL']}")
    print(f"  HIGH:                     {stats['HIGH']}")
    print(f"  MEDIUM:                   {stats['MEDIUM']}")
    print(f"  LOW:                      {stats['LOW']}")
    print(f"Supports (our claim):       {stats['supports']}")
    print(f"Undermines (our claim):     {stats['undermines']}")
    print(f"KEY FINDINGS (unique):      {len(sgs)}")
    print(f"DUPLICATE Bates removed:    {stats['duplicates']}")
    print(f"UNIQUE documents:           {unique_count}")
    if dtcounts:
        print(f"\nDOCUMENT TYPE BREAKDOWN:")
        for dt, cnt in sorted(dtcounts.items(), key=lambda x: -x[1]):
            print(f"  {dt:25s} {cnt:5d} ({cnt*100//max(stats['total'],1)}%)")

    if sgs:
        print(f"\n{'='*60}")
        print("KEY FINDINGS — DEDUPLICATED")
        print(f"{'='*60}")
        for entry in sgs:
            d = entry['data']
            all_bates = entry['all_bates']
            print(f"\n  {d['bates']}: {d['sg_why']}")
            if len(all_bates) > 1:
                dupes = [b for b in all_bates if b != d['bates']]
                print(f"  Also: {', '.join(dupes)}")
            print(f"  Use: {d['sg_use']}")
            print(f"  Quote: {d['key_quote'][:200]}")

    if crits:
        print(f"\n{'='*60}")
        print(f"CRITICAL DOCUMENTS — UNIQUE ({len(crits)} total)")
        print(f"{'='*60}")
        for entry in crits[:30]:
            d = entry['data']
            all_bates = entry['all_bates']
            dupe_note = f" (also: {', '.join(b for b in all_bates if b != d['bates'])})" if len(all_bates) > 1 else ""
            print(f"\n  {d['bates']}{dupe_note}: [{d['su']}] {d['reasoning'][:100]}")
            print(f"  Element: {d['element']}")
            if d['key_quote']:
                print(f"  Quote: {d['key_quote'][:150]}")
