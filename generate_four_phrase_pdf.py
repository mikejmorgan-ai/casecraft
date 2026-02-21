#!/usr/bin/env python3
"""
Generate a fully self-contained PDF of Four-Phrase Search Results.

Part 1: Search results analysis (summary, tables, key findings)
Part 2: Full source document text for each of the 8 document types,
         with the four search phrases highlighted in-line.

No links. Everything is on the page.
"""

import os
import re
import html as html_mod

from weasyprint import HTML

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DISCOVERY_DIRS = [
    os.path.join(PROJECT_ROOT, f"data/discovery-{i:04d}")
    for i in range(1, 7)
]

FOUR_PHRASES = [
    "vested mining use",
    "vested mining rights",
    "mine operator",
    "mining protection area",
]

# Build case-insensitive regex that highlights any of the four phrases
HIGHLIGHT_RE = re.compile(
    "|".join(re.escape(p) for p in FOUR_PHRASES),
    re.IGNORECASE,
)

# One representative Bates per deduplicated document type
DOCUMENTS = [
    {
        "num": 1,
        "title": "H.B. 288, Enrolled Copy — Critical Infrastructure Materials (Utah Code Title 17, Ch. 41)",
        "bates": "SLCo002501",
        "all_bates": ["SLCo002501", "SLCo008382", "SLCo012814", "SLCo013323"],
        "phrases": "Vested mining use, Mine operator, Mining protection area",
    },
    {
        "num": 2,
        "title": "Supplemental Declaration and Notice of Vested Mining Use (Recorded 11/12/2021)",
        "bates": "SLCo003551",
        "all_bates": ["SLCo003551", "SLCo003560", "SLCo003569", "SLCo003602", "SLCo003611", "SLCo003699",
                       "SLCo010728", "SLCo010795", "SLCo010804", "SLCo010813", "SLCo015369", "SLCo015414", "SLCo015423"],
        "phrases": "ALL FOUR PHRASES",
    },
    {
        "num": 3,
        "title": 'County Calendar Events — "TF Notice of Vested Mining Use" (March 29, 2022)',
        "bates": "SLCo003624",
        "all_bates": ["SLCo003624", "SLCo003626", "SLCo003628", "SLCo010822", "SLCo010824"],
        "phrases": "Vested mining use",
    },
    {
        "num": 4,
        "title": "Division's Response to Petitioner's Reply (AG for DOGM)",
        "bates": "SLCo006843",
        "all_bates": ["SLCo006843", "SLCo006857", "SLCo010158", "SLCo010172"],
        "phrases": "Vested mining use, Mine operator",
    },
    {
        "num": 5,
        "title": "Tree Farm Reply Briefs (Parr Brown / Kass Wallin, Filed Feb 18, 2022)",
        "bates": "SLCo006947",
        "all_bates": ["SLCo006947", "SLCo006963", "SLCo010271", "SLCo010287"],
        "phrases": "Vested mining use",
    },
    {
        "num": 6,
        "title": "Public Comment Letters to Board of Oil, Gas & Mining (Filed March 22, 2022)",
        "bates": "SLCo007246",
        "all_bates": ["SLCo007246", "SLCo010692"],
        "phrases": "Vested mining rights",
    },
    {
        "num": 7,
        "title": "Division Surreply Brief re: Small Mine Operators (AG for DOGM)",
        "bates": "SLCo003377",
        "all_bates": ["SLCo003377", "SLCo009126", "SLCo013723"],
        "phrases": "Mine operator",
    },
    {
        "num": 8,
        "title": "Salt Lake County Council Meeting Agendas — April 5, 2022",
        "bates": "SLCo004662",
        "all_bates": ["SLCo004662", "SLCo005003", "SLCo011435", "SLCo011775",
                       "SLCo016040", "SLCo016381", "SLCo017485", "SLCo017826", "SLCo018710"],
        "phrases": "Mine operator",
    },
]


def find_document(bates: str) -> str | None:
    filename = f"Tree Farm {bates}.txt"
    for d in DISCOVERY_DIRS:
        path = os.path.join(d, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
    return None


def highlight_phrases(text: str) -> str:
    """HTML-escape text, then wrap matched phrases in highlight spans."""
    escaped = html_mod.escape(text)
    # After escaping, the phrases are still plain text (no special HTML chars)
    # so we can safely regex-replace on the escaped string
    def replacer(m):
        return f'<span class="hl">{m.group(0)}</span>'
    return HIGHLIGHT_RE.sub(replacer, escaped)


def build_analysis_section() -> str:
    """Part 1: the search analysis (no links, plain Bates numbers)."""
    return """
    <h1>Four-Phrase Search Results</h1>
    <h2>Tree Farm LLC v. Salt Lake County — Discovery Documents (SLCo002489–SLCo018710)</h2>

    <p><strong>Search Date:</strong> February 21, 2026</p>
    <p><strong>Phrases Searched (ONLY these four, case-insensitive):</strong></p>
    <ol>
        <li>"Vested mining use"</li>
        <li>"Vested mining rights"</li>
        <li>"Mine operator"</li>
        <li>"Mining protection area"</li>
    </ol>

    <p><strong>Total discovery documents searched: 5,576</strong><br>
    <strong>Total unique documents with at least one match: 44</strong><br>
    <strong>Deduplicated to unique document types: 8</strong></p>

    <hr>

    <h2>Summary by Phrase</h2>
    <table>
        <tr><th>Phrase</th><th>Unique Documents</th></tr>
        <tr><td>Vested mining use</td><td>31</td></tr>
        <tr><td>Vested mining rights</td><td>15</td></tr>
        <tr><td>Mine operator</td><td>35</td></tr>
        <tr><td>Mining protection area</td><td>22</td></tr>
    </table>

    <hr>

    <h2>Key Findings Summary</h2>
    <table>
        <tr><th>#</th><th>Document Type</th><th>Copies</th><th>Source</th><th>All 4?</th></tr>
        <tr><td>1</td><td>H.B. 288 statute text</td><td>4</td><td>Legislature (not County)</td><td>3 of 4</td></tr>
        <tr><td>2</td><td>Tree Farm's Supplemental Declaration</td><td>13</td><td>Tree Farm's own filing</td><td>YES — ALL 4</td></tr>
        <tr><td>3</td><td>County calendar entries</td><td>5</td><td>County (Tim Bywater)</td><td>1 of 4</td></tr>
        <tr><td>4</td><td>Division Response briefs</td><td>4</td><td>AG/DOGM (not County)</td><td>2 of 4</td></tr>
        <tr><td>5</td><td>Tree Farm Reply briefs</td><td>4</td><td>Tree Farm's own filing</td><td>1 of 4</td></tr>
        <tr><td>6</td><td>Public comment letters</td><td>2</td><td>Third-party citizen</td><td>1 of 4</td></tr>
        <tr><td>7</td><td>Division Surreply briefs</td><td>3</td><td>AG/DOGM (not County)</td><td>1 of 4</td></tr>
        <tr><td>8</td><td>County Council meeting agendas</td><td>9</td><td>County</td><td>1 of 4</td></tr>
    </table>

    <h3>The Bottom Line</h3>
    <p><strong>The County produced ZERO documents showing they independently analyzed, investigated,
    or evaluated Tree Farm's vested mining rights claim.</strong> Every match falls into one of these categories:</p>
    <ol>
        <li><strong>Tree Farm's own filings</strong> reflected back in discovery (17 docs)</li>
        <li><strong>The statute itself</strong> — H.B. 288 text (4 docs)</li>
        <li><strong>Division/AG briefs</strong> arguing vested mining use is "outside the scope" and "irrelevant" (7 docs)</li>
        <li><strong>County calendar entries</strong> noting a meeting — but no analysis, no memo, no legal review (5 docs)</li>
        <li><strong>County Council agendas</strong> with a passing public comment reference (9 docs)</li>
        <li><strong>Third-party public comments</strong> requesting verification (2 docs)</li>
    </ol>
    <p>The County's own work product on this topic amounts to <strong>calendar invites and meeting agendas</strong> — nothing more.</p>
    """


def build_document_section(doc: dict) -> str:
    """Build one document exhibit section with highlighted full text."""
    content = find_document(doc["bates"])
    if content is None:
        body_html = "<p><em>[Document not found on disk]</em></p>"
    else:
        lines = content.split("\n")
        total_lines = len(lines)
        if total_lines <= 800:
            highlighted = highlight_phrases("\n".join(lines))
            body_html = f'<pre class="doc-text">{highlighted}</pre>'
        else:
            # Show first 800 lines
            head_text = "\n".join(lines[:800])
            highlighted_head = highlight_phrases(head_text)
            body_html = f'<pre class="doc-text">{highlighted_head}</pre>'
            body_html += f'<p class="truncation-note">[Showing first 800 of {total_lines} lines.]</p>'

            # Find phrase matches beyond line 800 and show excerpt windows
            CONTEXT = 10  # lines before and after each match
            match_lines = []
            for i, line in enumerate(lines):
                if i < 800:
                    continue
                if HIGHLIGHT_RE.search(line):
                    match_lines.append(i)

            if match_lines:
                body_html += '<h4 style="margin-top:16px; color:#92400e;">Additional excerpt(s) containing matched phrases:</h4>'
                for ml in match_lines:
                    start = max(ml - CONTEXT, 800)
                    end = min(ml + CONTEXT + 1, total_lines)
                    excerpt_text = "\n".join(lines[start:end])
                    highlighted_excerpt = highlight_phrases(excerpt_text)
                    body_html += f'<p class="truncation-note">[Bates {doc["bates"]} — Lines {start + 1}–{end} of {total_lines}]</p>'
                    body_html += f'<pre class="doc-text">{highlighted_excerpt}</pre>'

    bates_list = ", ".join(doc["all_bates"])

    return f"""
    <div class="exhibit" style="page-break-before: always;">
        <div class="exhibit-header">
            <div class="exhibit-num">Document {doc['num']} of 8</div>
            <h3>{html_mod.escape(doc['title'])}</h3>
            <div class="exhibit-meta">
                <strong>Representative Bates:</strong> {doc['bates']}<br>
                <strong>All Bates Nos:</strong> {bates_list}<br>
                <strong>Phrases found:</strong> {html_mod.escape(doc['phrases'])}
            </div>
            <div class="legend">
                <span class="hl">highlighted text</span> = one of the four search phrases
            </div>
        </div>
        {body_html}
    </div>
    """


def main():
    analysis = build_analysis_section()
    exhibits = "\n".join(build_document_section(d) for d in DOCUMENTS)

    full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {{
    size: letter;
    margin: 0.75in;
    @bottom-center {{
      content: "Page " counter(page) " of " counter(pages);
      font-size: 9px;
      color: #888;
    }}
  }}
  body {{
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.5;
    color: #1a1a1a;
  }}
  h1 {{
    font-size: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 6px;
    margin-top: 0;
  }}
  h2 {{
    font-size: 16px;
    color: #2c3e50;
    border-bottom: 1px solid #bbb;
    padding-bottom: 4px;
    margin-top: 24px;
  }}
  h3 {{
    font-size: 13px;
    color: #34495e;
    margin-top: 12px;
    margin-bottom: 4px;
  }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0 16px 0;
    font-size: 10px;
  }}
  th {{
    background-color: #2c3e50;
    color: white;
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
  }}
  td {{
    padding: 5px 8px;
    border: 1px solid #ddd;
    vertical-align: top;
  }}
  tr:nth-child(even) {{
    background-color: #f8f9fa;
  }}
  strong {{ color: #2c3e50; }}
  hr {{
    border: none;
    border-top: 1px solid #ccc;
    margin: 16px 0;
  }}
  ol, ul {{
    margin: 6px 0;
    padding-left: 24px;
  }}
  li {{ margin-bottom: 3px; }}
  p {{ margin: 6px 0; }}

  /* Exhibit styles */
  .exhibit-header {{
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 12px;
  }}
  .exhibit-num {{
    font-size: 10px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }}
  .exhibit-header h3 {{
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #1e293b;
  }}
  .exhibit-meta {{
    font-size: 10px;
    color: #475569;
    line-height: 1.6;
  }}
  .legend {{
    margin-top: 8px;
    font-size: 10px;
    color: #64748b;
  }}
  .doc-text {{
    font-family: 'Courier New', monospace;
    font-size: 8px;
    line-height: 1.35;
    background-color: #fafafa;
    border: 1px solid #e2e8f0;
    padding: 12px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }}
  .hl {{
    background-color: #fef08a;
    padding: 0 2px;
    font-weight: bold;
  }}
  .truncation-note {{
    font-size: 10px;
    color: #92400e;
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    padding: 6px 10px;
    border-radius: 4px;
    margin-top: 8px;
  }}

  /* Divider page */
  .part-divider {{
    page-break-before: always;
    text-align: center;
    padding-top: 200px;
  }}
  .part-divider h1 {{
    border: none;
    font-size: 28px;
    color: #2c3e50;
  }}
  .part-divider p {{
    font-size: 14px;
    color: #64748b;
  }}
</style>
</head>
<body>

{analysis}

<div class="part-divider">
    <h1>PART 2: SOURCE DOCUMENTS</h1>
    <p>Full text of each document type with search phrases highlighted</p>
    <p style="font-size: 12px; margin-top: 24px;">
        <span class="hl">highlighted text</span> = one of the four search phrases<br>
        ("vested mining use" / "vested mining rights" / "mine operator" / "mining protection area")
    </p>
</div>

{exhibits}

</body>
</html>"""

    pdf_path = os.path.join(PROJECT_ROOT, "binder/pdfs/Four_Phrase_Search_Results.pdf")
    HTML(string=full_html).write_pdf(pdf_path)
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"PDF generated: {pdf_path}")
    print(f"Size: {size_kb:.0f} KB")


if __name__ == "__main__":
    main()
