#!/usr/bin/env python3
"""
Generate self-contained PDF of Four-Phrase Search Results
with full document text embedded for each referenced Bates number.
One representative doc per deduplicated document type.
"""

import os
import html
import markdown2
from weasyprint import HTML

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DISCOVERY_DIRS = [
    os.path.join(PROJECT_ROOT, f"data/discovery-{i:04d}")
    for i in range(1, 7)
]

# One representative Bates per document type (8 deduplicated types)
REPRESENTATIVE_BATES = [
    ("SLCo002501", "H.B. 288, Enrolled Copy — Critical Infrastructure Materials"),
    ("SLCo003551", "Supplemental Declaration and Notice of Vested Mining Use"),
    ("SLCo003624", "County Calendar Events — TF Notice of Vested Mining Use"),
    ("SLCo006843", "Division's Response to Petitioner's Reply"),
    ("SLCo006947", "Tree Farm Reply Briefs"),
    ("SLCo007246", "Public Comment Letters to Board of Oil, Gas & Mining"),
    ("SLCo003377", "Division Surreply Brief re: Small Mine Operators"),
    ("SLCo004662", "Salt Lake County Council Meeting Agendas"),
]

MAX_LINES_PER_DOC = 500  # Truncate very large docs to keep PDF manageable


def find_document(bates: str) -> str | None:
    filename = f"Tree Farm {bates}.txt"
    for d in DISCOVERY_DIRS:
        path = os.path.join(d, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
    return None


def build_appendix_html() -> str:
    sections = []
    for bates, title in REPRESENTATIVE_BATES:
        content = find_document(bates)
        if content is None:
            content = "[Document not found]"

        lines = content.split("\n")
        truncated = len(lines) > MAX_LINES_PER_DOC
        if truncated:
            lines = lines[:MAX_LINES_PER_DOC]
            lines.append(f"\n[... truncated at {MAX_LINES_PER_DOC} lines — full document: {len(content.splitlines())} lines ...]")

        escaped = html.escape("\n".join(lines))
        sections.append(f"""
        <div class="appendix-doc" style="page-break-before: always;">
            <h3>Exhibit: {html.escape(bates)} — {html.escape(title)}</h3>
            <pre class="doc-content">{escaped}</pre>
        </div>
        """)

    return "\n".join(sections)


def main():
    md_file = os.path.join(PROJECT_ROOT, "binder/FOUR_PHRASE_SEARCH_RESULTS.md")
    pdf_file = os.path.join(PROJECT_ROOT, "binder/pdfs/Four_Phrase_Search_Results.pdf")

    with open(md_file, "r") as f:
        md_content = f.read()

    html_body = markdown2.markdown(md_content, extras=["tables", "fenced-code-blocks"])
    appendix_html = build_appendix_html()

    html_full = f"""<!DOCTYPE html>
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
    margin-top: 18px;
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
  a {{
    color: #2563eb;
    text-decoration: underline;
  }}
  code {{
    font-family: 'Courier New', monospace;
    font-size: 9.5px;
    background-color: #f0f0f0;
    padding: 1px 3px;
    border-radius: 2px;
  }}
  strong {{
    color: #2c3e50;
  }}
  hr {{
    border: none;
    border-top: 1px solid #ccc;
    margin: 16px 0;
  }}
  ol, ul {{
    margin: 6px 0;
    padding-left: 24px;
  }}
  li {{
    margin-bottom: 3px;
  }}
  p {{
    margin: 6px 0;
  }}

  /* Appendix styles */
  .appendix-divider {{
    page-break-before: always;
    border-top: 3px solid #2c3e50;
    padding-top: 16px;
    margin-top: 32px;
  }}
  .appendix-doc h3 {{
    background-color: #2c3e50;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 8px;
  }}
  .doc-content {{
    font-family: 'Courier New', monospace;
    font-size: 8.5px;
    line-height: 1.4;
    background-color: #fafafa;
    border: 1px solid #e5e7eb;
    padding: 12px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }}
</style>
</head>
<body>
{html_body}

<div class="appendix-divider">
  <h1>APPENDIX — Source Documents</h1>
  <p>One representative document per deduplicated type (8 documents). Large documents truncated at {MAX_LINES_PER_DOC} lines.</p>
</div>

{appendix_html}

</body>
</html>"""

    HTML(string=html_full).write_pdf(pdf_file)
    print(f"PDF generated: {pdf_file}")
    size_kb = os.path.getsize(pdf_file) / 1024
    print(f"Size: {size_kb:.0f} KB")


if __name__ == "__main__":
    main()
