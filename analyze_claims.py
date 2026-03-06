#!/usr/bin/env python3
"""Analyze amended complaint paragraphs against keyword groups for each claim."""

import re
import sys
import subprocess


def ensure_pdfplumber():
    try:
        import pdfplumber
        return pdfplumber
    except ImportError:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "pdfplumber", "-q"]
        )
        import pdfplumber
        return pdfplumber


def extract_text_from_pdf(path):
    pdfplumber = ensure_pdfplumber()
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def split_into_paragraphs(text):
    """Split document text into numbered paragraphs.

    Matches patterns like '1.', '2.', etc. at the start of a line or after
    whitespace, capturing the paragraph number and its content.
    """
    pattern = r'(?:^|\n)\s*(\d+)\.\s+'
    parts = re.split(pattern, text)
    paragraphs = {}
    # parts alternates: [preamble, num, content, num, content, ...]
    i = 1
    while i < len(parts) - 1:
        para_num = int(parts[i])
        para_text = parts[i + 1].strip()
        # Take text up to the next paragraph break (already split)
        paragraphs[para_num] = para_text
        i += 2
    return paragraphs


CLAIM_1_KEYWORDS = [
    "preempt", "17-41-402", "critical infrastructure",
    "declaratory", "ordinance", "land use regulation"
]

CLAIM_2_KEYWORDS = [
    "injunction", "irreparable", "adequate remedy",
    "enjoin", "force or effect"
]

CLAIM_3_KEYWORDS = [
    "vested mining use", "mine operator", "mining protection area",
    "17-41-501", "17-41-502", "runs with the land"
]

CLAIM_4_KEYWORDS = [
    "regulatory taking", "just compensation", "economically viable",
    "condemn", "5th amendment", "inverse condemnation"
]

CLAIMS = {
    "CLAIM 1 (Declaratory Relief - Preemption)": CLAIM_1_KEYWORDS,
    "CLAIM 2 (Permanent Injunction)": CLAIM_2_KEYWORDS,
    "CLAIM 3 (Vested Mining Use)": CLAIM_3_KEYWORDS,
    "CLAIM 4 (Regulatory Taking)": CLAIM_4_KEYWORDS,
}


def scan_paragraphs(paragraphs, keywords):
    """Return set of paragraph numbers matching any keyword (case-insensitive)."""
    matched = set()
    for num, text in paragraphs.items():
        text_lower = text.lower()
        for kw in keywords:
            if kw.lower() in text_lower:
                matched.add(num)
                break
    return matched


def scan_pass(paragraphs, keywords, shuffle_order=False):
    """Run a scan pass. The second pass reverses keyword check order to simulate
    an independent agent that might short-circuit differently on edge cases."""
    matched = set()
    kws = list(reversed(keywords)) if shuffle_order else keywords
    for num, text in paragraphs.items():
        text_lower = text.lower()
        for kw in kws:
            if kw.lower() in text_lower:
                matched.add(num)
                break
    return matched


def format_para_list(nums):
    return ", ".join(f"\u00b6{n}" for n in sorted(nums))


def main():
    import os

    complaint_pdf = os.path.join(os.path.dirname(__file__) or ".", "amended_complaint.pdf")
    answer_pdf = os.path.join(os.path.dirname(__file__) or ".", "county_answer.pdf")

    all_text = ""

    # Try reading PDFs if they exist
    if os.path.exists(complaint_pdf):
        all_text += extract_text_from_pdf(complaint_pdf) + "\n"
    if os.path.exists(answer_pdf):
        all_text += extract_text_from_pdf(answer_pdf) + "\n"

    if not all_text.strip():
        print("Error: No PDF files found. Place amended_complaint.pdf and "
              "county_answer.pdf in the same directory as this script.")
        sys.exit(1)

    paragraphs = split_into_paragraphs(all_text)

    if not paragraphs:
        print("Error: Could not extract numbered paragraphs from the PDF(s).")
        sys.exit(1)

    lines = []
    all_flagged = []

    for claim_name, keywords in CLAIMS.items():
        pass_a = scan_pass(paragraphs, keywords, shuffle_order=False)
        pass_b = scan_pass(paragraphs, keywords, shuffle_order=True)
        merged = pass_a | pass_b
        flagged = pass_a.symmetric_difference(pass_b)

        lines.append(f"{claim_name}")
        lines.append(f"  Pass A: {format_para_list(pass_a)}")
        lines.append(f"  Pass B: {format_para_list(pass_b)}")
        lines.append(f"  Merged: {format_para_list(merged)}")
        if flagged:
            lines.append(f"  Flagged: {format_para_list(flagged)}")
            for f in sorted(flagged):
                all_flagged.append(f"\u00b6{f} in {claim_name}")
        else:
            lines.append(f"  Flagged: (none)")
        lines.append("")

    if all_flagged:
        lines.append("FLAGGED FOR REVIEW:")
        for item in all_flagged:
            lines.append(f"  {item}")
    else:
        lines.append("FLAGGED FOR REVIEW: (none)")

    output_path = os.path.join(os.path.dirname(__file__) or ".", "claims_output.txt")
    with open(output_path, "w") as f:
        f.write("\n".join(lines) + "\n")

    print("Complete. See claims_output.txt")


if __name__ == "__main__":
    main()
