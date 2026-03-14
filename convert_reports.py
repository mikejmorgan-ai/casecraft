#!/usr/bin/env python3
"""Convert markdown reports to styled legal PDFs using WeasyPrint."""

import markdown2
import os
import sys

# Workaround for fontTools bug with unicode range bit 123
import fontTools.ttLib.tables.O_S_2f_2 as _os2mod
_orig_setUnicodeRanges = _os2mod.table_O_S_2f_2.setUnicodeRanges
def _patched_setUnicodeRanges(self, bits):
    _orig_setUnicodeRanges(self, {b for b in bits if 0 <= b <= 122})
_os2mod.table_O_S_2f_2.setUnicodeRanges = _patched_setUnicodeRanges

from weasyprint import HTML

CSS = """
@page {
    size: letter;
    margin: 1in 0.9in 1in 0.9in;
    @top-center {
        content: "Tree Farm LLC v. Salt Lake County — CONFIDENTIAL";
        font-size: 8pt;
        color: #666;
        font-family: 'Georgia', serif;
    }
    @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 8pt;
        color: #666;
        font-family: 'Georgia', serif;
    }
    @bottom-right {
        content: "CaseBreak.ai";
        font-size: 7pt;
        color: #999;
        font-family: 'Georgia', serif;
    }
}

@page :first {
    margin-top: 1.5in;
}

body {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    max-width: 100%;
}

h1 {
    font-size: 20pt;
    font-weight: bold;
    color: #1b2a4a;
    border-bottom: 3px solid #1b2a4a;
    padding-bottom: 8pt;
    margin-top: 24pt;
    margin-bottom: 12pt;
    page-break-after: avoid;
}

h2 {
    font-size: 16pt;
    font-weight: bold;
    color: #2c3e6b;
    border-bottom: 1.5px solid #2c3e6b;
    padding-bottom: 4pt;
    margin-top: 20pt;
    margin-bottom: 10pt;
    page-break-after: avoid;
}

h3 {
    font-size: 13pt;
    font-weight: bold;
    color: #3a4f7a;
    margin-top: 16pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
}

h4, h5, h6 {
    font-size: 11pt;
    font-weight: bold;
    color: #3a4f7a;
    margin-top: 12pt;
    margin-bottom: 6pt;
    page-break-after: avoid;
}

p {
    margin-bottom: 8pt;
    text-align: justify;
    orphans: 3;
    widows: 3;
}

strong {
    color: #1b2a4a;
}

blockquote {
    border-left: 4px solid #1b2a4a;
    padding: 8pt 12pt;
    margin: 12pt 0;
    background: #f4f6fa;
    font-style: italic;
    color: #333;
    page-break-inside: avoid;
}

blockquote p {
    margin-bottom: 4pt;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 9.5pt;
    page-break-inside: auto;
}

thead {
    display: table-header-group;
}

tr {
    page-break-inside: avoid;
}

th {
    background: #1b2a4a;
    color: white;
    font-weight: bold;
    padding: 6pt 8pt;
    text-align: left;
    border: 1px solid #1b2a4a;
}

td {
    padding: 5pt 8pt;
    border: 1px solid #ccc;
    vertical-align: top;
}

tr:nth-child(even) td {
    background: #f8f9fb;
}

code {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background: #f0f2f5;
    padding: 1pt 3pt;
    border-radius: 2pt;
}

pre {
    background: #f0f2f5;
    padding: 10pt;
    border: 1px solid #ddd;
    border-radius: 3pt;
    font-size: 8.5pt;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    page-break-inside: avoid;
}

hr {
    border: none;
    border-top: 2px solid #1b2a4a;
    margin: 18pt 0;
}

ul, ol {
    margin-bottom: 8pt;
    padding-left: 20pt;
}

li {
    margin-bottom: 3pt;
}

a {
    color: #2c3e6b;
    text-decoration: none;
}

/* Emphasis for Bates numbers */
em {
    font-style: italic;
    color: #444;
}
"""


def convert_md_to_pdf(md_path, pdf_path):
    """Convert a markdown file to a styled PDF."""
    print(f"  Reading: {md_path}")
    with open(md_path, "r") as f:
        md_content = f.read()

    print(f"  Converting markdown to HTML...")
    html_content = markdown2.markdown(
        md_content,
        extras=["tables", "fenced-code-blocks", "header-ids", "break-on-newline"]
    )

    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>{CSS}</style>
</head>
<body>
{html_content}
</body>
</html>"""

    print(f"  Generating PDF: {pdf_path}")
    HTML(string=full_html).write_pdf(pdf_path)
    size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    print(f"  Done! ({size_mb:.1f} MB)")


REPORTS = [
    ("binder/MASTER_BINDER.md", "binder/MASTER_BINDER.pdf"),
    ("binder/CAUSE_OF_ACTION_PACKETS.md", "binder/CAUSE_OF_ACTION_PACKETS.pdf"),
    ("binder/VESTED_MINING_RESULTS.md", "binder/VESTED_MINING_RESULTS.pdf"),
    ("KEY_FINDING_INVENTORY.md", "KEY_FINDING_INVENTORY.pdf"),
]

if __name__ == "__main__":
    base = os.path.dirname(os.path.abspath(__file__))
    print("=" * 60)
    print("  CASECRAFT REPORT → STYLED PDF CONVERTER")
    print("=" * 60)

    for md_rel, pdf_rel in REPORTS:
        md_path = os.path.join(base, md_rel)
        pdf_path = os.path.join(base, pdf_rel)
        print(f"\n[{REPORTS.index((md_rel, pdf_rel)) + 1}/4] {os.path.basename(md_rel)}")
        try:
            convert_md_to_pdf(md_path, pdf_path)
        except Exception as e:
            print(f"  ERROR: {e}")
            sys.exit(1)

    print("\n" + "=" * 60)
    print("  ALL 4 REPORTS CONVERTED SUCCESSFULLY")
    print("=" * 60)
