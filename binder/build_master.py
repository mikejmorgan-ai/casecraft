#!/usr/bin/env python3
"""
Build the MASTER_BINDER.md from individual section files.
Applies consistent formatting rules throughout.
"""

import re
from datetime import date

def build_header():
    today = date.today().strftime("%B %d, %Y")
    return f"""# TREE FARM LLC v. SALT LAKE COUNTY

## Discovery Document Binder -- Organized by Cause of Action

### 5,576 Documents Reviewed | {today}

---

> **Prepared for litigation use.** This binder organizes all 5,576 discovery documents
> produced by Salt Lake County (Bates range SLCo002489 through SLCo018710) by cause
> of action, relevance tier, and evidentiary value. Each document entry identifies whether
> the document SUPPORTS or UNDERMINES the plaintiff's claims, with key quotes and
> recommended trial use.

---

"""

def build_toc():
    return """## Table of Contents

- [Claim 1: Ordinance Invalid -- State Preemption Under Utah Code 17-41-402(6)](#claim-1-ordinance-invalid--state-preemption-under-utah-code-17-41-4026)
    - [Section 1A: Key Finding Exhibits](#section-1a-key-finding-exhibits--claim-1)
    - [Section 1B: Critical Relevance Documents](#section-1b-critical-relevance-documents--claim-1)
    - [Section 1C: High Relevance Documents](#section-1c-high-relevance-documents--claim-1)
    - [Section 1D: Medium Relevance Documents](#section-1d-medium-relevance-documents--claim-1)
    - [Section 1E: Low Relevance Documents](#section-1e-low-relevance-documents--claim-1)
- [Claim 2: Permanent Injunction -- No Enforcement](#claim-2-permanent-injunction--no-enforcement)
- [Claim 3: Vested Mining Rights Under Utah Code 17-41-501 Through 17-41-503](#claim-3-vested-mining-rights-under-utah-code-17-41-501-through-17-41-503)
    - [Section 3A: Key Finding Exhibits](#section-3a-key-finding-exhibits--claim-3)
    - [Section 3B: Critical Relevance Documents](#section-3b-critical-relevance-documents--claim-3)
    - [Section 3C: High Relevance Documents](#section-3c-high-relevance-documents--claim-3)
    - [Section 3D: Medium Relevance Documents](#section-3d-medium-relevance-documents--claim-3)
    - [Section 3E: Low Relevance Documents](#section-3e-low-relevance-documents--claim-3)
- [Claim 4: Regulatory Taking -- Fifth Amendment and Utah Art. I, Section 22](#claim-4-regulatory-taking--fifth-amendment-and-utah-art-i-section-22)
- [Claim 5: County Defense -- No Preemption](#claim-5-county-defense--no-preemption)

---

"""

def format_key_finding_entry(entry_num, bates, tag, why_critical, recommended_use, key_quote):
    """Format a key finding / Section A entry with full detail."""
    lines = []
    lines.append(f"**{entry_num}.** **[{bates}]** | **{tag}**")
    lines.append("")
    if why_critical:
        lines.append(f"> **Why Critical:** {why_critical}")
        lines.append(">")
    if recommended_use:
        lines.append(f"> **Recommended Use:** {recommended_use}")
        lines.append(">")
    if key_quote:
        lines.append(f'> *"{key_quote}"*')
    lines.append("")
    lines.append("---")
    lines.append("")
    return "\n".join(lines)

def format_critical_entry(entry_num, bates, tag, description, key_quote):
    """Format a Section B (critical relevance) entry."""
    lines = []

    lines.append(f"**{entry_num}.** **[{bates}]** | **{tag}**")
    lines.append("")
    if description:
        lines.append(f"> Description: {description}")
        lines.append(">")
    if key_quote:
        lines.append(f'> *"{key_quote}"*')
    lines.append("")
    return "\n".join(lines)

def format_high_relevance_entry(entry_num, bates, tag, description):
    """Format a Section C (high relevance) entry."""
    lines = []
    lines.append(f"**{entry_num}.** **[{bates}]** | **{tag}**")
    lines.append("")
    if description:
        lines.append(f"> Description: {description}")
    lines.append("")
    return "\n".join(lines)

def parse_section_a(text):
    """Parse a key finding section (1A or 3A) into formatted entries."""
    # Split on horizontal rules
    blocks = re.split(r'\n---\n', text)
    entries = []

    for block in blocks:
        block = block.strip()
        if not block:
            continue
        # Skip section headers
        if block.startswith('###'):
            continue

        # Extract entry number and bates
        entry_match = re.match(r'\*\*(\d+)\.\*\*\s+\*\*\[([^\]]+)\]\*\*\s+\*\*(\w+)\*\*', block)
        if not entry_match:
            continue

        entry_num = entry_match.group(1)
        bates = entry_match.group(2)
        tag = entry_match.group(3)

        # Extract WHY CRITICAL
        why_match = re.search(r'\*\*WHY CRITICAL:\*\*\s*(.*?)(?=\n\n|\*\*RECOMMENDED USE|\*\*KEY QUOTE|$)', block, re.DOTALL)
        why_critical = why_match.group(1).strip() if why_match else ""

        # Extract RECOMMENDED USE
        use_match = re.search(r'\*\*RECOMMENDED USE:\*\*\s*(.*?)(?=\n\n|\*\*KEY QUOTE|$)', block, re.DOTALL)
        recommended_use = use_match.group(1).strip() if use_match else ""

        # Extract KEY QUOTE
        quote_match = re.search(r'\*\*KEY QUOTE:\*\*\s*\*"([^"]*(?:"[^"]*)*?)"\*', block, re.DOTALL)
        if not quote_match:
            quote_match = re.search(r'\*\*KEY QUOTE:\*\*\s*\*"(.*?)"\*', block, re.DOTALL)
        key_quote = quote_match.group(1).strip() if quote_match else ""

        entries.append(format_key_finding_entry(entry_num, bates, tag, why_critical, recommended_use, key_quote))

    return "\n".join(entries)

def parse_section_b_claim1(text):
    """Parse Claim 1 Section B entries."""
    lines = text.strip().split('\n')
    entries = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Match entry pattern: **N.** **[SLCoXXXXXX]** **TAG**
        entry_match = re.match(r'\*\*(\d+)\.\*\*\s+\*\*\[([^\]]+)\]\*\*\s+\*\*(\w+)\*\*', line)
        if entry_match:
            entry_num = entry_match.group(1)
            bates = entry_match.group(2)
            tag = entry_match.group(3)

            # Collect subsequent lines for description and quote
            description_parts = []
            key_quote = ""
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if not next_line:
                    i += 1
                    continue
                # Check if next entry
                if re.match(r'\*\*\d+\.\*\*', next_line):
                    break
                # Check if it's a section header
                if next_line.startswith('###'):
                    break
                # Check for italic quote
                quote_match = re.match(r'\*"(.+?)"\*$', next_line)
                if quote_match:
                    key_quote = quote_match.group(1)
                    i += 1
                    continue
                # Otherwise it's description text
                description_parts.append(next_line)
                i += 1

            description = " ".join(description_parts)

            # Clean up description text - remove raw filter/regex-like category labels
            # These are machine-generated classification tags, not human descriptions
            description = re.sub(r'[Rr]eferences? (?:illegality|unlawfulness|invalidity|void status)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:removal of sand,? gravel,? and(?: aggregate)? extraction)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:Utah Code 17-41-402)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:violation of state law or Utah Code)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:inability to adopt ordinance)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:conflict with state law)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:warnings? or legal counsel advisement)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:talking points?)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:sham or pretextual conduct)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:open meeting|meeting violation|OPMA)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:"long prohibited"|"always prohibited"|"historically prohibited"|"talking point")[^;.]*[;.]?\s*', '', description)
            description = re.sub(r'[Rr]eferences? (?:illegal,? illegality,? unlawful,? invalid,? or void)[^;.]*[;.]?\s*', '', description)
            description = re.sub(r';?\s*[Cc]ontains? ordinance/CIM/extraction references\.?\s*', '', description)
            description = re.sub(r'[Cc]ritical language identified:\s*[^.]+\.?\s*', '', description)
            description = re.sub(r'[Hh]igh-relevance language identified:\s*[^.]+\.?\s*', '', description)
            description = re.sub(r'[Dd]ocument contains critical references to [^.]+\.?\s*', '', description)
            # Clean up semicolons and whitespace
            description = re.sub(r'\s*;\s*;+\s*', '; ', description)
            description = re.sub(r'^\s*[;,]\s*', '', description)
            description = re.sub(r'\s+', ' ', description)
            description = description.strip()
            if description and not description.endswith('.'):
                description = description.rstrip(';,').strip()

            entries.append(format_critical_entry(entry_num, bates, tag, description, key_quote))
        else:
            i += 1

    return "\n".join(entries)

def parse_section_b_claim3(text):
    """Parse Claim 3 Section B entries."""
    lines = text.strip().split('\n')
    entries = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith('###'):
            i += 1
            continue
        if line == '---':
            i += 1
            continue

        entry_match = re.match(r'\*\*(\d+)\.\*\*\s+\*\*\[([^\]]+)\]\*\*\s+\*\*(\w+)\*\*', line)
        if entry_match:
            entry_num = entry_match.group(1)
            bates = entry_match.group(2)
            tag = entry_match.group(3)

            description_parts = []
            key_quote = ""
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if not next_line:
                    i += 1
                    continue
                if re.match(r'\*\*\d+\.\*\*', next_line):
                    break
                if next_line.startswith('###') or next_line == '---':
                    break
                quote_match = re.match(r'\*"(.+?)"\*$', next_line)
                if quote_match:
                    key_quote = quote_match.group(1)
                    i += 1
                    continue
                description_parts.append(next_line)
                i += 1

            description = " ".join(description_parts)

            entries.append(format_critical_entry(entry_num, bates, tag, description, key_quote))
        else:
            i += 1

    return "\n".join(entries)

def parse_section_c(text):
    """Parse a high relevance section (C) into formatted entries."""
    lines = text.strip().split('\n')
    entries = []

    for line in lines:
        line = line.strip()
        if not line or line.startswith('###'):
            continue

        # Match pattern: **N.** **[SLCoXXXXXX]** **TAG** | Description
        entry_match = re.match(r'\*\*(\d+)\.\*\*\s+\*\*\[([^\]]+)\]\*\*\s+\*\*(\w+)\*\*\s*\|\s*(.*)', line)
        if not entry_match:
            # Try without bold tag
            entry_match = re.match(r'\*\*(\d+)\.\*\*\s+\*\*\[([^\]]+)\]\*\*\s+(\w+)\s*\|\s*(.*)', line)
        if entry_match:
            entry_num = entry_match.group(1)
            bates = entry_match.group(2)
            tag = entry_match.group(3)
            description = entry_match.group(4).strip()

            entries.append(format_high_relevance_entry(entry_num, bates, tag, description))

    return "\n".join(entries)

def format_document_list(text):
    """Format medium/low relevance document lists with consistent dash formatting."""
    # Already uses dashes, just ensure bold bates numbers
    return text

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def main():
    # Read all source files
    c1a = read_file('/home/user/casecraft/binder/sections/claim1_section_a.md')
    c1b = read_file('/home/user/casecraft/binder/sections/claim1_section_b.md')
    c1cde = read_file('/home/user/casecraft/binder/sections/claim1_sections_cde.md')
    c3a = read_file('/home/user/casecraft/binder/sections/claim3_section_a.md')
    c3b = read_file('/home/user/casecraft/binder/sections/claim3_section_b.md')
    c3cde = read_file('/home/user/casecraft/binder/sections/claim3_sections_cde_and_pending.md')

    # Split c1cde into C, D, E sections
    c1c_match = re.search(r'(### Section 1C:.*?)(?=### Section 1D:)', c1cde, re.DOTALL)
    c1d_match = re.search(r'(### Section 1D:.*?)(?=### Section 1E:)', c1cde, re.DOTALL)
    c1e_match = re.search(r'(### Section 1E:.*)', c1cde, re.DOTALL)

    c1c_text = c1c_match.group(1) if c1c_match else ""
    c1d_text = c1d_match.group(1) if c1d_match else ""
    c1e_text = c1e_match.group(1) if c1e_match else ""

    # Split c3cde into C, D, E, and pending sections
    c3c_match = re.search(r'(### Section 3C:.*?)(?=### Section 3D:)', c3cde, re.DOTALL)
    c3d_match = re.search(r'(### Section 3D:.*?)(?=### Section 3E:)', c3cde, re.DOTALL)
    c3e_match = re.search(r'(### Section 3E:.*?)(?=## Causes of Action)', c3cde, re.DOTALL)
    pending_match = re.search(r'(## Causes of Action.*)', c3cde, re.DOTALL)

    c3c_text = c3c_match.group(1) if c3c_match else ""
    c3d_text = c3d_match.group(1) if c3d_match else ""
    c3e_text = c3e_match.group(1) if c3e_match else ""

    # Build the document
    doc = []

    # Title page
    doc.append(build_header())

    # Table of Contents
    doc.append(build_toc())

    # ═══════════════════════════════════════════════
    # CLAIM 1
    # ═══════════════════════════════════════════════
    doc.append("# Claim 1: Ordinance Invalid -- State Preemption Under Utah Code 17-41-402(6)\n")
    doc.append("> **Legal Theory:** The Salt Lake County ordinance eliminating mineral extraction as a")
    doc.append("> conditional use and explicitly prohibiting sand, gravel, and rock aggregate extraction")
    doc.append("> is facially invalid because it directly conflicts with Utah Code 17-41-402(6), which")
    doc.append("> prohibits counties from adopting ordinances that restrict critical infrastructure")
    doc.append("> materials operations.\n")
    doc.append("---\n")

    # Section 1A
    doc.append("## Section 1A: Key Finding Exhibits -- Claim 1\n")
    doc.append("> **52 documents** | These are the highest-value exhibits for Claim 1. Each document")
    doc.append("> contains direct evidence of state law preemption, county knowledge of illegality,")
    doc.append("> or the ordinance's facial conflict with the CIM statute.\n")
    doc.append("---\n")
    doc.append(parse_section_a(c1a))
    doc.append("\n---\n")

    # Section 1B
    doc.append("## Section 1B: Critical Relevance Documents -- Claim 1\n")
    doc.append("> **199 documents** | These documents contain direct references to the CIM statute,")
    doc.append("> ordinance language, state law violations, or the sand/gravel/aggregate prohibition.")
    doc.append("> They are essential supporting exhibits.\n")
    doc.append("---\n")
    doc.append(parse_section_b_claim1(c1b))
    doc.append("\n---\n")

    # Section 1C
    doc.append("## Section 1C: High Relevance Documents -- Claim 1\n")
    doc.append("> **59 documents** | These documents contain significant references to CIM law,")
    doc.append("> legal warnings, procedural concerns, predetermined outcome evidence, or")
    doc.append("> intergovernmental lobbying related to the ordinance.\n")
    doc.append("---\n")
    doc.append(parse_section_c(c1c_text))
    doc.append("\n---\n")

    # Section 1D
    doc.append("## Section 1D: Medium Relevance Documents -- Claim 1\n")
    doc.append("> **1,854 documents** | These documents contain contextual references to the")
    doc.append("> ordinance process, public comments, county communications, or related proceedings.")
    doc.append("> They provide background and pattern evidence.\n")
    doc.append("---\n")
    # Extract just the list portion
    d_lines = c1d_text.split('\n')
    d_list_lines = [l for l in d_lines if l.strip().startswith('- ') or l.strip().startswith('(')]
    doc.append("\n".join(d_list_lines))
    doc.append("\n\n---\n")

    # Section 1E
    doc.append("## Section 1E: Low Relevance Documents -- Claim 1\n")
    doc.append("> **1,108 documents** | These documents have tangential or indirect relevance to")
    doc.append("> Claim 1. They are included for completeness and may contain useful background")
    doc.append("> information.\n")
    doc.append("---\n")
    e_lines = c1e_text.split('\n')
    e_list_lines = [l for l in e_lines if l.strip().startswith('- ') or l.strip().startswith('(')]
    doc.append("\n".join(e_list_lines))
    doc.append("\n\n---\n")

    # ═══════════════════════════════════════════════
    # CLAIM 2 (Pending)
    # ═══════════════════════════════════════════════
    doc.append("# Claim 2: Permanent Injunction -- No Enforcement\n")
    doc.append("> **Legal Theory:** Tree Farm seeks a permanent injunction preventing Salt Lake County")
    doc.append("> from enforcing the invalid ordinance against Tree Farm's mining operations.\n")
    doc.append("---\n")
    doc.append("### Status: PENDING ANALYSIS\n")
    doc.append("> Document analysis for Claim 2 has not yet been completed. Agent processing")
    doc.append("> timed out before results were written to the database. All 5,576 documents")
    doc.append("> require re-analysis against Claim 2 criteria.\n")
    doc.append("> **Action Required:** Re-run analysis for all 5,576 documents against Claim 2 criteria.\n")
    doc.append("---\n")

    # ═══════════════════════════════════════════════
    # CLAIM 3
    # ═══════════════════════════════════════════════
    doc.append("# Claim 3: Vested Mining Rights Under Utah Code 17-41-501 Through 17-41-503\n")
    doc.append("> **Legal Theory:** Tree Farm LLC holds vested mining rights established through over")
    doc.append("> 90 years of continuous mining operations dating to the 1890s Portland Cement Company")
    doc.append("> operations, a DOGM Large Mine Permit approved in 1996, and a formal Supplemental")
    doc.append("> Declaration of Vested Mining Use recorded in November 2021. These rights are")
    doc.append("> protected under the Critical Infrastructure Materials Act (H.B. 288, codified at")
    doc.append("> Utah Code Title 17, Chapter 41).\n")
    doc.append("---\n")

    # Section 3A
    doc.append("## Section 3A: Key Finding Exhibits -- Claim 3\n")
    doc.append("> **57 documents** | These are the highest-value exhibits for Claim 3. Each document")
    doc.append("> contains direct evidence of vested mining rights, county admissions of existing")
    doc.append("> mining operations, DOGM filings, or the statutory vested rights framework.\n")
    doc.append("---\n")
    doc.append(parse_section_a(c3a))
    doc.append("\n---\n")

    # Section 3B
    doc.append("## Section 3B: Critical Relevance Documents -- Claim 3\n")
    doc.append("> **37 documents** | These documents contain direct references to mining operations,")
    doc.append("> nonconforming use status, DOGM proceedings, or county efforts to eliminate")
    doc.append("> mineral extraction as a conditional use.\n")
    doc.append("---\n")
    doc.append(parse_section_b_claim3(c3b))
    doc.append("\n---\n")

    # Section 3C
    doc.append("## Section 3C: High Relevance Documents -- Claim 3\n")
    doc.append("> **65 documents** | These documents reference DOGM proceedings, predecessor mining")
    doc.append("> entities, Portland Cement Company history, county staff communications about")
    doc.append("> vested mining rights, or related legal briefs.\n")
    doc.append("---\n")
    doc.append(parse_section_c(c3c_text))
    doc.append("\n---\n")

    # Section 3D
    doc.append("## Section 3D: Medium Relevance Documents -- Claim 3\n")
    doc.append("> **169 documents** | These documents contain contextual references to mining")
    doc.append("> operations, DOGM proceedings, county communications, or related matters.\n")
    doc.append("---\n")
    d3_lines = c3d_text.split('\n')
    d3_list_lines = [l for l in d3_lines if l.strip().startswith('- ') or l.strip().startswith('(') or (l.strip() and l.strip()[0].isdigit() and 'documents' in l)]
    doc.append("\n".join(d3_list_lines))
    doc.append("\n\n---\n")

    # Section 3E
    doc.append("## Section 3E: Low Relevance Documents -- Claim 3\n")
    doc.append("> **936 documents** | These documents have tangential or indirect relevance to")
    doc.append("> Claim 3. They are included for completeness.\n")
    doc.append("---\n")
    e3_lines = c3e_text.split('\n')
    e3_list_lines = [l for l in e3_lines if l.strip().startswith('- ') or l.strip().startswith('(') or (l.strip() and l.strip()[0].isdigit() and 'documents' in l)]
    doc.append("\n".join(e3_list_lines))
    doc.append("\n\n---\n")

    # ═══════════════════════════════════════════════
    # CLAIM 4 (Pending)
    # ═══════════════════════════════════════════════
    doc.append("# Claim 4: Regulatory Taking -- Fifth Amendment and Utah Art. I, Section 22\n")
    doc.append("> **Legal Theory:** The ordinance effects a regulatory taking of Tree Farm's property")
    doc.append("> by eliminating all economically beneficial use of the mineral estate and destroying")
    doc.append("> Tree Farm's investment-backed expectations in its mining operations. The taking is")
    doc.append("> compensable under the Fifth Amendment to the U.S. Constitution and Article I,")
    doc.append("> Section 22 of the Utah Constitution.\n")
    doc.append("---\n")
    doc.append("### Status: PENDING ANALYSIS\n")
    doc.append("> Document analysis for Claim 4 has not yet been completed. Agent processing")
    doc.append("> timed out before results were written to the database. All 5,576 documents")
    doc.append("> require re-analysis against Claim 4 criteria.\n")
    doc.append("> **Action Required:** Re-run analysis for all 5,576 documents against Claim 4 criteria.\n")
    doc.append("---\n")

    # ═══════════════════════════════════════════════
    # CLAIM 5 (Pending)
    # ═══════════════════════════════════════════════
    doc.append("# Claim 5: County Defense -- No Preemption\n")
    doc.append("> **Legal Theory (County's Position):** Salt Lake County contends that the ordinance")
    doc.append("> does not conflict with the CIM statute because the ordinance does not reference")
    doc.append('> "critical infrastructure materials" by name, and that the county retains general')
    doc.append("> zoning authority over land use within its jurisdiction. The county argues the")
    doc.append("> ordinance is a legitimate exercise of police power.\n")
    doc.append("---\n")
    doc.append("### Status: PENDING ANALYSIS\n")
    doc.append("> Document analysis for Claim 5 has not yet been completed. Agent processing")
    doc.append("> timed out before results were written to the database. All 5,576 documents")
    doc.append("> require re-analysis against Claim 5 criteria.\n")
    doc.append("> **Action Required:** Re-run analysis for all 5,576 documents against Claim 5 criteria.\n")
    doc.append("---\n")

    # Footer
    doc.append("\n---\n")
    doc.append("## Document Statistics\n")
    doc.append("| Claim | Key Findings | Critical | High | Medium | Low | Total |")
    doc.append("|-------|-------------|----------|------|--------|-----|-------|")
    doc.append("| Claim 1 (Ordinance Invalid) | 52 | 199 | 59 | 1,854 | 1,108 | 3,272 |")
    doc.append("| Claim 2 (Permanent Injunction) | -- | -- | -- | -- | -- | Pending |")
    doc.append("| Claim 3 (Vested Mining Rights) | 57 | 37 | 65 | 169 | 936 | 1,264 |")
    doc.append("| Claim 4 (Regulatory Taking) | -- | -- | -- | -- | -- | Pending |")
    doc.append("| Claim 5 (County Defense) | -- | -- | -- | -- | -- | Pending |\n")
    doc.append("> **Note:** Documents may appear under multiple claims where they contain evidence")
    doc.append("> relevant to more than one cause of action. The total across claims may therefore")
    doc.append("> exceed the 5,576 unique documents in the production.\n")
    doc.append("---\n")
    doc.append("*End of Master Binder*\n")

    # Write output
    output = "\n".join(doc)

    with open('/home/user/casecraft/binder/MASTER_BINDER.md', 'w') as f:
        f.write(output)

    print(f"MASTER_BINDER.md written: {len(output)} characters")

    # Count entries
    smoking_count = len(re.findall(r'^\*\*\d+\.\*\* \*\*\[SLCo', output, re.MULTILINE))
    print(f"Total formatted entries: {smoking_count}")

if __name__ == '__main__':
    main()
