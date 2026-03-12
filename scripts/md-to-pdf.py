#!/usr/bin/env python3
"""Convert markdown files to styled PDF using markdown2 + weasyprint."""
import sys
import markdown2
from weasyprint import HTML

def convert(md_path, pdf_path):
    with open(md_path, 'r') as f:
        md_content = f.read()

    html_body = markdown2.markdown(md_content, extras=[
        'tables', 'fenced-code-blocks', 'header-ids', 'break-on-newline'
    ])

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {{
    size: letter;
    margin: 1in 0.85in;
    @top-center {{
      content: "CONFIDENTIAL — ATTORNEY WORK PRODUCT";
      font-size: 8pt;
      color: #999;
    }}
    @bottom-center {{
      content: "Page " counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #999;
    }}
  }}
  body {{
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
  }}
  h1 {{
    font-size: 18pt;
    font-weight: bold;
    color: #1a1a1a;
    border-bottom: 2px solid #333;
    padding-bottom: 8px;
    margin-top: 30px;
  }}
  h2 {{
    font-size: 14pt;
    font-weight: bold;
    color: #2a2a2a;
    border-bottom: 1px solid #999;
    padding-bottom: 4px;
    margin-top: 24px;
    page-break-after: avoid;
  }}
  h3 {{
    font-size: 12pt;
    font-weight: bold;
    color: #333;
    margin-top: 18px;
    page-break-after: avoid;
  }}
  h4 {{
    font-size: 11pt;
    font-weight: bold;
    color: #444;
    page-break-after: avoid;
  }}
  p {{
    margin: 6px 0;
    text-align: justify;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }}
  th {{
    background-color: #2c3e50;
    color: white;
    padding: 8px 6px;
    text-align: left;
    font-weight: bold;
    border: 1px solid #2c3e50;
  }}
  td {{
    padding: 6px;
    border: 1px solid #ddd;
    vertical-align: top;
  }}
  tr:nth-child(even) {{
    background-color: #f8f9fa;
  }}
  blockquote {{
    border-left: 3px solid #2c3e50;
    margin: 12px 0;
    padding: 8px 16px;
    background-color: #f8f9fa;
    font-style: italic;
  }}
  strong {{
    color: #1a1a1a;
  }}
  hr {{
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0;
  }}
  ul, ol {{
    margin: 6px 0;
    padding-left: 24px;
  }}
  li {{
    margin: 3px 0;
  }}
  code {{
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    background-color: #f4f4f4;
    padding: 1px 4px;
    border-radius: 2px;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

    HTML(string=html).write_pdf(pdf_path)
    print(f"PDF written to: {pdf_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python md-to-pdf.py input.md output.pdf")
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
