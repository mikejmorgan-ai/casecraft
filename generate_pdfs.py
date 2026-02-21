#!/usr/bin/env python3
"""
Generate individual PDFs for each Cause of Action packet.
Tree Farm LLC v. Salt Lake County (Case No. 220903418)

Uses fpdf2 for reliable PDF generation without font subsetting issues.
"""

import os
import re
import datetime
from fpdf import FPDF

BINDER_DIR = os.path.join(os.path.dirname(__file__), 'binder')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'binder', 'pdfs')
SOURCE_FILE = os.path.join(BINDER_DIR, 'CAUSE_OF_ACTION_PACKETS.md')
MASTER_BINDER_FILE = os.path.join(BINDER_DIR, 'MASTER_BINDER.md')


def sanitize_text(text: str) -> str:
    """Replace Unicode characters that Helvetica can't render."""
    replacements = {
        '\u2014': '--',    # em-dash
        '\u2013': '-',     # en-dash
        '\u2018': "'",     # left single quote
        '\u2019': "'",     # right single quote
        '\u201c': '"',     # left double quote
        '\u201d': '"',     # right double quote
        '\u2022': '-',     # bullet
        '\u00a7': 'Sec.',  # section sign
        '\u00b6': '',      # pilcrow
        '\u2026': '...',   # ellipsis
        '\u00e9': 'e',     # e-acute
        '\u2010': '-',     # hyphen
        '\u2011': '-',     # non-breaking hyphen
        '\u2012': '-',     # figure dash
        '\u00a0': ' ',     # non-breaking space
        '\u200b': '',      # zero-width space
        '\ufeff': '',      # BOM
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    # Remove any remaining non-latin1 characters
    return text.encode('latin-1', errors='replace').decode('latin-1')


class LegalPDF(FPDF):
    """Custom PDF class for legal documents."""

    def __init__(self):
        super().__init__('P', 'pt', 'Letter')
        self.set_auto_page_break(auto=True, margin=72)
        self.packet_title = ""

    def header(self):
        if self.page_no() > 1:  # Skip header on cover page
            self.set_font('Helvetica', 'I', 7)
            self.set_text_color(153, 153, 153)
            w = self.w - self.l_margin - self.r_margin
            self.cell(w, 10, 'PRIVILEGED & CONFIDENTIAL - ATTORNEY WORK PRODUCT',
                      new_x='LMARGIN', new_y='TOP', align='C')
            self.ln(14)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-54)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(102, 102, 102)
            w = self.w - self.l_margin - self.r_margin
            self.cell(w, 10, f'Page {self.page_no()}',
                      new_x='LMARGIN', new_y='TOP', align='C')

    def cover_page(self, title, subtitle, packet_label):
        """Generate a professional cover page."""
        self.add_page()
        self.ln(144)  # ~2 inches down
        w = self.w - self.l_margin - self.r_margin

        # Case name
        self.set_font('Helvetica', 'B', 22)
        self.set_text_color(26, 26, 26)
        self.cell(w, 30, 'TREE FARM LLC v. SALT LAKE COUNTY', new_x='LMARGIN', new_y='NEXT', align='C')

        self.set_font('Helvetica', '', 14)
        self.set_text_color(68, 68, 68)
        self.cell(w, 20, 'Case No. 220903418', new_x='LMARGIN', new_y='NEXT', align='C')

        self.ln(36)

        # Packet title
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(26, 26, 26)
        self.multi_cell(w, 24, sanitize_text(title), align='C')

        self.set_font('Helvetica', '', 12)
        self.set_text_color(68, 68, 68)
        self.multi_cell(w, 18, sanitize_text(subtitle), align='C')

        self.ln(50)

        # Footer info
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(26, 26, 26)
        self.cell(w, 16, 'PRIVILEGED & CONFIDENTIAL', new_x='LMARGIN', new_y='NEXT', align='C')

        self.set_font('Helvetica', '', 10)
        self.set_text_color(102, 102, 102)
        self.cell(w, 14, 'ATTORNEY WORK PRODUCT', new_x='LMARGIN', new_y='NEXT', align='C')
        self.ln(14)
        self.cell(w, 14, f'Packet {packet_label}', new_x='LMARGIN', new_y='NEXT', align='C')
        self.cell(w, 14, f'Generated: {datetime.datetime.now().strftime("%B %d, %Y")}', new_x='LMARGIN', new_y='NEXT', align='C')

    def _content_width(self):
        """Available content width."""
        return self.w - self.l_margin - self.r_margin

    def section_heading(self, text, level=1):
        """Add a section heading."""
        text = sanitize_text(text)
        w = self._content_width()
        if level == 1:
            self.add_page()
            self.set_font('Helvetica', 'B', 16)
            self.set_text_color(26, 26, 26)
            self.set_x(self.l_margin)
            self.multi_cell(w, 20, text)
            y = self.get_y()
            self.set_draw_color(26, 26, 26)
            self.set_line_width(1.5)
            self.line(self.l_margin, y, self.l_margin + w, y)
            self.ln(8)
        elif level == 2:
            self.ln(6)
            self.set_font('Helvetica', 'B', 13)
            self.set_text_color(51, 51, 51)
            self.set_x(self.l_margin)
            self.multi_cell(w, 17, text)
            y = self.get_y()
            self.set_draw_color(204, 204, 204)
            self.set_line_width(0.5)
            self.line(self.l_margin, y, self.l_margin + w, y)
            self.ln(4)
        elif level == 3:
            self.ln(4)
            self.set_font('Helvetica', 'B', 11)
            self.set_text_color(68, 68, 68)
            self.set_x(self.l_margin)
            self.multi_cell(w, 15, text)
            self.ln(2)

    def body_text(self, text):
        """Add body text."""
        self.set_font('Helvetica', '', 10)
        self.set_text_color(26, 26, 26)
        cleaned = sanitize_text(text.replace('**', ''))
        self.set_x(self.l_margin)
        self.multi_cell(self._content_width(), 13, cleaned)
        self.ln(2)

    def bold_text(self, text):
        """Add bold text."""
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(26, 26, 26)
        cleaned = sanitize_text(text.replace('**', ''))
        self.set_x(self.l_margin)
        self.multi_cell(self._content_width(), 13, cleaned)

    def quote_block(self, text):
        """Add an indented quote block."""
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(51, 51, 51)
        self.set_x(self.l_margin)
        y = self.get_y()
        self.set_draw_color(26, 26, 26)
        self.set_line_width(2)
        cleaned = sanitize_text(text.replace('**', '').strip())
        indent = 14
        self.set_x(self.l_margin + indent)
        cell_width = self._content_width() - indent
        self.multi_cell(cell_width, 12, cleaned)
        y_end = self.get_y()
        self.line(self.l_margin + indent, y, self.l_margin + indent, y_end)
        self.ln(4)

    def add_table(self, headers, rows, col_widths=None):
        """Add a formatted table."""
        available_width = self.w - self.l_margin - self.r_margin
        if col_widths is None:
            col_widths = [available_width / len(headers)] * len(headers)
        else:
            # Scale col_widths to fit
            total = sum(col_widths)
            col_widths = [w / total * available_width for w in col_widths]

        # Header row
        self.set_font('Helvetica', 'B', 8)
        self.set_fill_color(26, 26, 26)
        self.set_text_color(255, 255, 255)
        for i, header in enumerate(headers):
            self.cell(col_widths[i], 18, sanitize_text(header), border=1,
                      new_x='RIGHT', new_y='TOP', align='L', fill=True)
        self.ln()

        # Data rows
        self.set_font('Helvetica', '', 8)
        self.set_text_color(26, 26, 26)
        for row_idx, row in enumerate(rows):
            if row_idx % 2 == 1:
                self.set_fill_color(248, 248, 248)
                fill = True
            else:
                self.set_fill_color(255, 255, 255)
                fill = True

            # Sanitize row cells in place
            row = [sanitize_text(str(c)) for c in row]
            # Pad row to match header count
            while len(row) < len(headers):
                row.append('')

            # Calculate row height based on longest cell
            max_lines = 1
            for i, cell_text in enumerate(row):
                if i >= len(col_widths):
                    break
                text_width = self.get_string_width(cell_text)
                lines = max(1, int(text_width / (col_widths[i] - 4)) + 1)
                max_lines = max(max_lines, lines)

            row_height = max(16, max_lines * 11)

            # Check if we need a page break
            if self.get_y() + row_height > self.h - self.b_margin:
                self.add_page()
                # Reprint header
                self.set_font('Helvetica', 'B', 8)
                self.set_fill_color(26, 26, 26)
                self.set_text_color(255, 255, 255)
                for i, header in enumerate(headers):
                    self.cell(col_widths[i], 18, sanitize_text(header), border=1,
                      new_x='RIGHT', new_y='TOP', align='L', fill=True)
                self.ln()
                self.set_font('Helvetica', '', 8)
                self.set_text_color(26, 26, 26)

            x_start = self.get_x()
            y_start = self.get_y()

            for i, cell_text in enumerate(row):
                if i >= len(col_widths):
                    break
                self.set_xy(x_start + sum(col_widths[:i]), y_start)
                cell_str = str(cell_text)[:200]  # Already sanitized above
                if row_idx % 2 == 1:
                    self.set_fill_color(248, 248, 248)
                else:
                    self.set_fill_color(255, 255, 255)
                self.multi_cell(col_widths[i], 11, cell_str, border='LR', fill=fill)

            # Move to after the tallest cell
            max_y = self.get_y()
            self.set_y(max(y_start + 16, max_y))

        # Bottom border
        y = self.get_y()
        x = self.l_margin
        self.set_draw_color(0, 0, 0)
        self.line(x, y, x + sum(col_widths), y)
        self.ln(6)

    def horizontal_rule(self):
        """Add a horizontal rule."""
        self.ln(4)
        y = self.get_y()
        self.set_draw_color(204, 204, 204)
        self.set_line_width(0.5)
        self.line(self.l_margin, y, self.l_margin + self._content_width(), y)
        self.ln(8)


def parse_markdown_table(text):
    """Parse a markdown table into headers and rows."""
    lines = [l.strip() for l in text.strip().split('\n') if l.strip()]
    if len(lines) < 2:
        return None, None

    # Parse header
    headers = [c.strip() for c in lines[0].split('|') if c.strip()]

    # Skip separator line (line with ---)
    rows = []
    for line in lines[2:]:
        cells = [c.strip() for c in line.split('|') if c.strip()]
        if cells:
            rows.append(cells)

    return headers, rows


def render_markdown_to_pdf(pdf, md_text):
    """Parse markdown and render to PDF."""
    lines = md_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        # Skip empty lines
        if not line.strip():
            i += 1
            continue

        # Headings
        if line.startswith('# '):
            pdf.section_heading(line[2:].strip(), level=1)
            i += 1
            continue
        if line.startswith('## '):
            pdf.section_heading(line[3:].strip(), level=2)
            i += 1
            continue
        if line.startswith('### '):
            pdf.section_heading(line[4:].strip(), level=3)
            i += 1
            continue

        # Horizontal rule
        if line.strip() == '---':
            pdf.horizontal_rule()
            i += 1
            continue

        # Table detection
        if '|' in line and i + 1 < len(lines) and '---' in lines[i + 1]:
            # Collect all table lines
            table_text = ""
            while i < len(lines) and ('|' in lines[i] or '---' in lines[i]):
                table_text += lines[i] + '\n'
                i += 1
            headers, rows = parse_markdown_table(table_text)
            if headers and rows:
                # Determine column widths based on header count
                num_cols = len(headers)
                if num_cols <= 3:
                    widths = None  # Equal
                elif num_cols == 7:
                    widths = [1, 2.5, 1, 0.8, 0.8, 0.8, 0.8]
                elif num_cols == 4:
                    widths = [1.2, 1, 1, 3]
                else:
                    widths = None
                pdf.add_table(headers, rows[:500], widths)  # Limit rows for very large tables
            continue

        # Blockquote
        if line.startswith('>'):
            quote_text = ""
            while i < len(lines) and lines[i].startswith('>'):
                quote_text += lines[i][1:].strip() + ' '
                i += 1
            pdf.quote_block(quote_text.strip())
            continue

        # List items
        if line.startswith('- ') or line.startswith('* '):
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(26, 26, 26)
            text = sanitize_text(line[2:].strip().replace('**', ''))
            pdf.set_x(pdf.l_margin)
            pdf.cell(14, 12, '-', new_x='RIGHT', new_y='TOP')  # bullet
            cell_width = pdf._content_width() - 14
            pdf.multi_cell(cell_width, 12, text)
            i += 1
            continue

        # Bold line (starts with **)
        if line.startswith('**'):
            pdf.bold_text(line)
            i += 1
            continue

        # Regular paragraph
        pdf.body_text(line)
        i += 1


def parse_master_binder(filepath):
    """Parse MASTER_BINDER.md to extract Why Critical / Recommended Use per Bates ID."""
    narratives = {}
    if not os.path.exists(filepath):
        return narratives

    with open(filepath, 'r') as f:
        text = f.read()

    # Match: **N.** **[SLCoXXXXXX]** | **SUPPORTS/UNDERMINES**
    # Followed by blockquote content until next entry or section break
    pattern = re.compile(
        r'\*\*\d+\.\*\*\s+\*\*\[(SLCo\d+)\]\*\*\s+\|\s+\*\*(SUPPORTS|UNDERMINES)\*\*'
        r'(.*?)(?=\*\*\d+\.\*\*\s+\*\*\[SLCo|\n---\n\n(?:---\n|## ))',
        re.DOTALL
    )

    for match in pattern.finditer(text):
        bates_id = match.group(1)
        direction = match.group(2)
        content = match.group(3)

        # Extract Why Critical
        why_match = re.search(
            r'\*\*Why Critical:\*\*\s*(.+?)(?=\n>\s*\n|\*\*Recommended Use:)',
            content, re.DOTALL
        )
        why_text = ""
        if why_match:
            why_text = why_match.group(1).strip()
            why_text = re.sub(r'\n>\s*', ' ', why_text)  # Flatten blockquote continuation
            why_text = why_text.replace('>', '').strip()

        # Extract Recommended Use
        rec_match = re.search(
            r'\*\*Recommended Use:\*\*\s*(.+?)(?=\n>\s*\n|\n>\s*\*"|$)',
            content, re.DOTALL
        )
        rec_text = ""
        if rec_match:
            rec_text = rec_match.group(1).strip()
            rec_text = re.sub(r'\n>\s*', ' ', rec_text)
            rec_text = rec_text.replace('>', '').strip()

        # Keep first (best) entry for each Bates ID
        if bates_id not in narratives:
            narratives[bates_id] = {
                'direction': direction,
                'why_critical': why_text,
                'recommended_use': rec_text,
            }

    return narratives


def inject_narratives(md_text, narratives):
    """Inject MASTER_BINDER narratives into CRITICAL document entries in the packet markdown."""
    if not narratives:
        return md_text

    lines = md_text.split('\n')
    new_lines = []
    i = 0

    while i < len(lines):
        new_lines.append(lines[i])

        # Detect CRITICAL doc entry: **SLCoXXXXXX** | Score: ...
        match = re.match(r'\*\*(SLCo\d+)\*\*\s+\|\s+Score:', lines[i])
        if match:
            bates_id = match.group(1)
            if bates_id in narratives:
                # Skip past existing blockquotes for this entry
                while i + 1 < len(lines) and lines[i + 1].startswith('>'):
                    i += 1
                    new_lines.append(lines[i])

                # Inject narrative from MASTER_BINDER
                narr = narratives[bates_id]
                direction = narr['direction']
                if narr['why_critical']:
                    new_lines.append(f'> **{direction}** -- {narr["why_critical"]}')
                if narr['recommended_use']:
                    new_lines.append(f'> **Recommended Use:** {narr["recommended_use"]}')

        i += 1

    return '\n'.join(new_lines)


def split_into_packets(md_text):
    """Split master markdown into individual packet sections."""
    packets = {}

    # Executive summary (before first PACKET heading)
    exec_match = re.search(r'^(# CAUSE OF ACTION.*?)(?=\n# PACKET 1:)', md_text, re.DOTALL | re.MULTILINE)
    if exec_match:
        packets['executive_summary'] = exec_match.group(1)

    # Find all "# PACKET N:" positions
    packet_positions = []
    for m in re.finditer(r'^# PACKET (\d+):', md_text, re.MULTILINE):
        packet_positions.append((m.start(), m.group(1)))

    for idx, (start, pkt_num) in enumerate(packet_positions):
        if idx + 1 < len(packet_positions):
            end = packet_positions[idx + 1][0]
        else:
            end = len(md_text)
        packets[f'packet_{pkt_num}'] = md_text[start:end]

    return packets


PACKET_INFO = {
    '1': ('VESTED MINING RIGHTS (PRIMARY)',
          'Utah Code 17-41-501 to -503 -- Tree Farm Holds Vested Mining Rights',
          'Packet_1_Vested_Mining_Rights_PRIMARY.pdf'),
    '2': ('REGULATORY TAKING (ALTERNATIVE)',
          'U.S. Const. Amend. V; Utah Const. Art. I Sec. 22',
          'Packet_2_Regulatory_Taking.pdf'),
    '3': ('PERMANENT INJUNCTION (REMEDY)',
          'Stop County from Enforcing Ordinance Against Vested Mining Rights',
          'Packet_3_Permanent_Injunction.pdf'),
    '4': ('CIM PREEMPTION (SECONDARY)',
          'Utah Code 17-41-402 -- Alternative Theory (Decoy Strategy)',
          'Packet_4_CIM_Preemption_Secondary.pdf'),
    '5': ('COUNTY COUNTERCLAIM (DEFENSE)',
          'County Arguments to Anticipate and Counter',
          'Packet_5_County_Counterclaim.pdf'),
    '6': ('UNASSIGNED DOCUMENTS', 'Documents Not Tied to a Cause of Action',
          'Packet_6_Unassigned_Documents.pdf'),
}


def generate_packet_pdf(pkt_num_str, md_content):
    """Generate a single packet PDF."""
    title, subtitle, filename = PACKET_INFO[pkt_num_str]

    pdf = LegalPDF()
    pdf.packet_title = title
    pdf.cover_page(title, subtitle, pkt_num_str)
    pdf.add_page()
    render_markdown_to_pdf(pdf, md_content)

    output_path = os.path.join(OUTPUT_DIR, filename)
    pdf.output(output_path)
    return output_path


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 60)
    print("PDF PACKET GENERATOR")
    print("Tree Farm LLC v. Salt Lake County")
    print("=" * 60)

    with open(SOURCE_FILE, 'r') as f:
        md_text = f.read()

    # Load MASTER_BINDER narratives and inject into packet markdown
    narratives = parse_master_binder(MASTER_BINDER_FILE)
    print(f"Loaded {len(narratives)} document narratives from MASTER_BINDER.md")
    md_text = inject_narratives(md_text, narratives)
    print(f"Injected narratives into packet markdown")

    packets = split_into_packets(md_text)

    # Executive Summary PDF
    print("\nGenerating Executive Summary PDF...")
    exec_md = packets.get('executive_summary', '')
    pdf = LegalPDF()
    pdf.cover_page('EXECUTIVE SUMMARY', 'All Cause of Action Packets -- Cross-Reference Analysis', 'Summary')
    pdf.add_page()
    render_markdown_to_pdf(pdf, exec_md)
    exec_path = os.path.join(OUTPUT_DIR, 'Packet_0_Executive_Summary.pdf')
    pdf.output(exec_path)
    print(f"  -> Packet_0_Executive_Summary.pdf")

    # Individual Packets
    for pkt_num_str in ['1', '2', '3', '4', '5', '6']:
        key = f'packet_{pkt_num_str}'
        if key not in packets:
            print(f"  WARNING: {key} not found")
            continue

        title = PACKET_INFO[pkt_num_str][0]
        print(f"Generating Packet {pkt_num_str}: {title}...")
        path = generate_packet_pdf(pkt_num_str, packets[key])
        print(f"  -> {os.path.basename(path)}")

    # Combined PDF
    print("\nGenerating Combined All-Packets PDF...")
    pdf = LegalPDF()
    pdf.cover_page('COMPLETE DOCUMENT PACKETS', 'All 6 Cause of Action Packets -- Full Report', '1-6 Combined')
    pdf.add_page()
    render_markdown_to_pdf(pdf, md_text)
    combined_path = os.path.join(OUTPUT_DIR, 'All_Packets_Combined.pdf')
    pdf.output(combined_path)
    print(f"  -> All_Packets_Combined.pdf")

    print(f"\n{'=' * 60}")
    print(f"All PDFs generated in: {OUTPUT_DIR}")
    print(f"{'=' * 60}")

    for f_name in sorted(os.listdir(OUTPUT_DIR)):
        if f_name.endswith('.pdf'):
            size = os.path.getsize(os.path.join(OUTPUT_DIR, f_name))
            if size < 1024 * 1024:
                size_str = f"{size / 1024:.0f} KB"
            else:
                size_str = f"{size / (1024*1024):.1f} MB"
            print(f"  {f_name:<50} {size_str:>10}")


if __name__ == '__main__':
    main()
