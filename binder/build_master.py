#!/usr/bin/env python3
"""
Build the MASTER_BINDER.md from the packet builder output.

Generates a comprehensive master binder organized by the 5 causes of action
plus a 6th category for unassigned documents. All 5,576 bates-stamped
documents are accounted for.

Numbering matches the Complaint and Answer/Counterclaim:
  COA 1: Declaratory Relief — Ordinance Invalid
  COA 2: Permanent Injunction — Stop Enforcement
  COA 3: Declaratory Relief — Vested Mining Use (PRIMARY)
  COA 4: (Alternative) Regulatory Taking
  COA 5: County Counterclaim — 17-41-402(6)(1) Does Not Preempt
  COA 6: Documents Not Tied to a Cause of Action
"""

import os
import sys
import re
from datetime import date
from collections import defaultdict, OrderedDict

# Add parent directory so we can import build_packets
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from build_packets import (
    ALL_PACKETS, PACKET_SUMMARIES, process_all_documents
)

# Also pull in the hand-curated evidence map if available
EVIDENCE_MAP_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'CLAIM_EVIDENCE_MAP.md')


def build_header(total_docs, assigned_count, unassigned_count):
    today = date.today().strftime("%B %d, %Y")
    return f"""# TREE FARM LLC v. SALT LAKE COUNTY

## Master Discovery Binder -- Organized by Cause of Action

### {total_docs:,} Documents Reviewed | {today}

---

> **Prepared for litigation use.** This binder organizes all {total_docs:,} bates-stamped
> discovery documents (Bates range SLCo002489 through SLCo018710) by cause of action,
> relevance tier, and evidentiary value. Every document from both Tree Farm and Salt Lake
> County productions is accounted for.
>
> **Documents assigned to at least one cause of action:** {assigned_count:,}
> **Documents not assigned to any cause of action:** {unassigned_count:,}
>
> **PRIMARY CLAIM:** COA 3 -- Vested Mining Use under Utah Code 17-41-501 to -503.
> Mining on this property dates to the 1890s, before Utah statehood and decades before
> Salt Lake County adopted zoning.

---

"""


def build_toc():
    return """## Table of Contents

- [COA 1: Declaratory Relief -- Ordinance Invalid](#coa-1-declaratory-relief--ordinance-invalid)
- [COA 2: Permanent Injunction -- Stop Enforcement](#coa-2-permanent-injunction--stop-enforcement)
- [COA 3: Declaratory Relief -- Vested Mining Use (PRIMARY)](#coa-3-declaratory-relief--vested-mining-use-primary)
- [COA 4: (Alternative) Regulatory Taking](#coa-4-alternative-regulatory-taking)
- [COA 5: County Counterclaim -- Does Not Preempt](#coa-5-county-counterclaim--does-not-preempt)
- [COA 6: Documents Not Tied to a Cause of Action](#coa-6-documents-not-tied-to-a-cause-of-action)

---

"""


def build_summary_table(packet_results, unassigned):
    lines = []
    lines.append("## Executive Summary\n")
    lines.append("| COA | Cause of Action | Documents | CRITICAL | HIGH | MEDIUM | LOW |")
    lines.append("|-----|----------------|-----------|----------|------|--------|-----|")

    for pkt_num in range(1, 6):
        pkt_def = ALL_PACKETS[pkt_num]
        results = packet_results[pkt_num]
        crit = sum(1 for r in results.values() if r["relevance"] == "CRITICAL")
        high = sum(1 for r in results.values() if r["relevance"] == "HIGH")
        med = sum(1 for r in results.values() if r["relevance"] == "MEDIUM")
        low = sum(1 for r in results.values() if r["relevance"] == "LOW")
        lines.append(f"| {pkt_num} | {pkt_def['short']} | {len(results)} | {crit} | {high} | {med} | {low} |")

    lines.append(f"| 6 | Not Tied to Cause of Action | {len(unassigned)} | -- | -- | -- | -- |")
    lines.append("")
    return "\n".join(lines)


def write_coa_section(pkt_num, pkt_def, results):
    """Write a single COA section with all documents by relevance tier."""
    lines = []
    lines.append(f"# COA {pkt_num}: {pkt_def['name']}\n")
    lines.append(f"**Legal Basis:** {pkt_def['legal_basis']}")
    lines.append(f"**Total Documents:** {len(results)}\n")

    # Argument summary
    if pkt_num in PACKET_SUMMARIES:
        lines.append(f"> {PACKET_SUMMARIES[pkt_num]}\n")

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

    lines.append("### Relevance Breakdown\n")
    lines.append("| CRITICAL | HIGH | MEDIUM | LOW |")
    lines.append("|----------|------|--------|-----|")
    lines.append(f"| {tier_counts.get('CRITICAL', 0)} | {tier_counts.get('HIGH', 0)} "
                 f"| {tier_counts.get('MEDIUM', 0)} | {tier_counts.get('LOW', 0)} |\n")

    # Elements breakdown
    element_counts = defaultdict(int)
    for bates_id, result in sorted_results:
        for elem in result["element_names"]:
            element_counts[elem] += 1

    lines.append("### Elements Addressed\n")
    lines.append("| Element | Documents |")
    lines.append("|---------|----------|")
    for elem, count in sorted(element_counts.items(), key=lambda x: -x[1]):
        clean = elem.split("-", 1)[1].replace("-", " ").title()
        lines.append(f"| {clean} | {count} |")
    lines.append("")

    # CRITICAL documents -- grouped by primary element
    critical_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "CRITICAL"]
    if critical_docs:
        lines.append(f"### CRITICAL Documents ({len(critical_docs)})\n")

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
            lines.append(f"#### {element_name} ({len(docs)} documents)\n")
            for bates_id, result in docs:
                all_elements = ', '.join(
                    e.split('-', 1)[1].replace('-', ' ').title()
                    for e in result['element_names']
                )
                lines.append(f"**{bates_id}** | Score: {result['score']} | Elements: {all_elements}")
                lines.append(f"> {result['reasoning']}")
                if result.get("quote"):
                    lines.append(f'> *"{result["quote"][:200]}"*')
                lines.append("")

    # HIGH documents
    high_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "HIGH"]
    if high_docs:
        lines.append(f"### HIGH Relevance Documents ({len(high_docs)})\n")
        for bates_id, result in high_docs:
            all_elements = ', '.join(
                e.split('-', 1)[1].replace('-', ' ').title()
                for e in result['element_names']
            )
            lines.append(f"**{bates_id}** | Score: {result['score']} | Elements: {all_elements}")
            lines.append(f"> {result['reasoning']}\n")

    # MEDIUM documents (compact table)
    med_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "MEDIUM"]
    if med_docs:
        lines.append(f"### MEDIUM Relevance Documents ({len(med_docs)})\n")
        lines.append("| Bates ID | Score | Elements | Key Phrase |")
        lines.append("|----------|-------|----------|------------|")
        for bates_id, result in med_docs:
            elems = ", ".join(e.split('-', 1)[1].replace('-', ' ') for e in result['element_names'])
            reason = result['reasoning'][:150]
            lines.append(f"| {bates_id} | {result['score']} | {elems} | {reason} |")
        lines.append("")

    # LOW documents -- count only
    low_docs = [(b, r) for b, r in sorted_results if r["relevance"] == "LOW"]
    if low_docs:
        lines.append(f"### LOW Relevance Documents: {len(low_docs)} (not listed)\n")
        lines.append(f"> {len(low_docs)} documents matched cause of action keywords at LOW relevance. "
                     f"These are omitted to reduce noise but are available in the underlying scan data.")
        lines.append("")

    lines.append("---\n")
    return "\n".join(lines)


def write_unassigned_section(unassigned):
    lines = []
    lines.append("# COA 6: Documents Not Tied to a Cause of Action\n")
    lines.append(f"**{len(unassigned)} documents** did not match any cause of action's search terms.\n")
    lines.append("These documents may include:")
    lines.append("- Public comments without specific legal references")
    lines.append("- Calendar entries / meeting invites without substantive content")
    lines.append("- News articles and media coverage")
    lines.append("- Administrative correspondence not referencing legal issues")
    lines.append("- Duplicates or attachments with minimal text\n")

    sorted_unassigned = sorted(unassigned, key=lambda x: int(re.search(r'\d+', x).group()))
    if len(sorted_unassigned) > 200:
        lines.append(f"### Bates Numbers (showing first 100 and last 100 of {len(sorted_unassigned)}):\n")
        for b in sorted_unassigned[:100]:
            lines.append(f"- {b}")
        lines.append(f"\n*... {len(sorted_unassigned) - 200} documents omitted ...*\n")
        for b in sorted_unassigned[-100:]:
            lines.append(f"- {b}")
    else:
        lines.append(f"### All {len(sorted_unassigned)} Bates Numbers:\n")
        for b in sorted_unassigned:
            lines.append(f"- {b}")

    lines.append("")
    return "\n".join(lines)


def main():
    print("Running packet analysis on all 5,576 documents...")
    packet_results, unassigned, all_bates, total_docs, doc_type_counts = process_all_documents()

    assigned_count = len(all_bates - unassigned)

    doc = []

    # Header
    doc.append(build_header(total_docs, assigned_count, len(unassigned)))

    # Table of Contents
    doc.append(build_toc())

    # Executive Summary
    doc.append(build_summary_table(packet_results, unassigned))

    # Document Type Breakdown
    doc.append("\n### Document Type Breakdown\n")
    doc.append("| Type | Count | % |")
    doc.append("|------|-------|---|")
    for dtype, count in sorted(doc_type_counts.items(), key=lambda x: -x[1]):
        pct = count / total_docs * 100
        doc.append(f"| {dtype} | {count} | {pct:.1f}% |")
    doc.append("")

    # Cross-reference
    doc.append("\n---\n")
    doc.append("## Cross-Reference: Documents Supporting Multiple Causes of Action\n")
    multi_packet_docs = defaultdict(list)
    for pkt_num, results in packet_results.items():
        for bates_id in results:
            multi_packet_docs[bates_id].append(pkt_num)

    multi_docs = {b: pkts for b, pkts in multi_packet_docs.items() if len(pkts) >= 3}
    if multi_docs:
        doc.append(f"**{len(multi_docs)} documents** support 3 or more causes of action:\n")
        doc.append("| Bates ID | COAs | Relevance | Key Phrase |")
        doc.append("|----------|------|-----------|------------|")
        for bates_id in sorted(multi_docs.keys()):
            pkts = multi_docs[bates_id]
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
            doc.append(f"| {bates_id} | {pkt_str} | {best_rel} | {best_reason} |")
        doc.append("")

    doc.append("\n---\n")

    # Write each COA section
    for pkt_num in range(1, 6):
        pkt_def = ALL_PACKETS[pkt_num]
        results = packet_results[pkt_num]
        doc.append(write_coa_section(pkt_num, pkt_def, results))

    # Unassigned
    doc.append(write_unassigned_section(unassigned))

    # Footer
    doc.append("\n---\n")
    doc.append("## Document Statistics\n")
    doc.append("| COA | Cause of Action | Documents | CRITICAL | HIGH | MEDIUM | LOW |")
    doc.append("|-----|----------------|-----------|----------|------|--------|-----|")
    for pkt_num in range(1, 6):
        pkt_def = ALL_PACKETS[pkt_num]
        results = packet_results[pkt_num]
        crit = sum(1 for r in results.values() if r["relevance"] == "CRITICAL")
        high = sum(1 for r in results.values() if r["relevance"] == "HIGH")
        med = sum(1 for r in results.values() if r["relevance"] == "MEDIUM")
        low = sum(1 for r in results.values() if r["relevance"] == "LOW")
        doc.append(f"| {pkt_num} | {pkt_def['short']} | {len(results)} | {crit} | {high} | {med} | {low} |")
    doc.append(f"| 6 | Not Tied to Cause of Action | {len(unassigned)} | -- | -- | -- | -- |")
    doc.append("")
    doc.append("> **Note:** Documents may appear under multiple causes of action where they contain")
    doc.append("> evidence relevant to more than one claim. The total across COAs may therefore")
    doc.append("> exceed the 5,576 unique documents in the production.\n")
    doc.append("---\n")
    doc.append("*End of Master Binder*\n")

    # Write output
    output = "\n".join(doc)
    output_path = os.path.join(os.path.dirname(__file__), 'MASTER_BINDER.md')

    with open(output_path, 'w') as f:
        f.write(output)

    print(f"\nMASTER_BINDER.md written: {len(output):,} characters")

    # Count entries
    entry_count = len(re.findall(r'^\*\*SLCo', output, re.MULTILINE))
    print(f"Total formatted entries: {entry_count}")
    print(f"Output: {output_path}")


if __name__ == '__main__':
    main()
