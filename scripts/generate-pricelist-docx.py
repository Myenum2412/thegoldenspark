#!/usr/bin/env python3
"""Build PRICELIST.docx from PRICELIST.md.

Usage (from the repo root):
    python scripts/generate-pricelist-docx.py

Requires python-docx:  pip install python-docx
"""

from __future__ import annotations

import re
import tempfile
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "PRICELIST.md"
OUTPUT = ROOT / "PRICELIST.docx"
LOGO = ROOT / "public" / "logo.png"

GOLD = RGBColor(0xB8, 0x86, 0x0B)
DARK = RGBColor(0x3A, 0x2A, 0x12)
GREY = RGBColor(0x59, 0x59, 0x59)
HEADER_FILL = "3A2A12"      # dark brown
HEADER_TEXT = RGBColor(0xFF, 0xFF, 0xFF)
ZEBRA_FILL = "FBF5E4"       # soft gold tint
SPECIAL = RGBColor(0x8A, 0x1C, 0x1C)


def clean(text: str) -> str:
    """Strip markdown emphasis/links and normalise whitespace."""
    text = text.strip()
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)   # [label](target)
    text = text.replace("**", "").replace("__", "").replace("*", "")
    return text.strip()


def parse_markdown(path: Path):
    """Return (contact_lines, note, [(category, [rows])])."""
    lines = path.read_text(encoding="utf-8").splitlines()
    contact: list[str] = []
    note = ""
    in_header = True
    categories: list[tuple[str, list[list[str]]]] = []
    current: list[list[str]] | None = None

    for raw in lines:
        line = raw.strip()
        if not line:
            continue
        if line.startswith("# ") or line.startswith("![") or line == "---":
            continue
        if line.startswith("### "):
            in_header = False
            current = []
            categories.append((clean(line[4:]), current))
            continue
        if line.startswith("## "):
            in_header = False
            continue
        if line.startswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            if all(set(c) <= set("-: ") for c in cells):
                continue  # separator row
            if cells and clean(cells[0]).lower() == "code":
                continue  # header row (re-added by the builder)
            if current is not None:
                current.append([clean(c) for c in cells])
            continue
        if line.startswith("**") and "products**" in line:
            note = clean(line)
            continue
        if line.startswith("*Thank you"):
            continue
        if in_header and current is None:
            contact.append(clean(line))

    return contact, note, categories


def shade(cell, hex_fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_fill)
    tc_pr.append(shd)


def set_cell_margins(cell, top=60, bottom=60, left=90, right=90) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement("w:tcMar")
    for tag, value in (("top", top), ("bottom", bottom), ("start", left), ("end", right)):
        node = OxmlElement(f"w:{tag}")
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")
        mar.append(node)
    tc_pr.append(mar)


def set_repeat_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


def set_cant_split(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    cant = OxmlElement("w:cantSplit")
    cant.set(qn("w:val"), "true")
    tr_pr.append(cant)


def cell_text(cell, text: str, *, bold=False, color=None, size=9, align=None) -> None:
    cell.text = ""
    paragraph = cell.paragraphs[0]
    paragraph.paragraph_format.space_before = Pt(0)
    paragraph.paragraph_format.space_after = Pt(0)
    if align is not None:
        paragraph.alignment = align
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.size = Pt(size)
    run.font.name = "Calibri"
    if color is not None:
        run.font.color.rgb = color


def add_bottom_border(paragraph, color="B8860B", size=12) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), "6")
    bottom.set(qn("w:color"), color)
    borders.append(bottom)
    p_pr.append(borders)


def trim_whitespace(image_path: Path) -> Path:
    """Crop the blank canvas around the logo so it doesn't add empty space."""
    image = Image.open(image_path).convert("RGBA")
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    flat = Image.alpha_composite(background, image).convert("RGB")
    diff = ImageChops.difference(flat, Image.new("RGB", image.size, (255, 255, 255)))
    bbox = diff.getbbox()
    if not bbox:
        return image_path
    pad = 8
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(image.width, bbox[2] + pad)
    bottom = min(image.height, bbox[3] + pad)
    cropped = image.crop((left, top, right, bottom))
    output = Path(tempfile.gettempdir()) / "golden-sparks-logo.png"
    cropped.save(output)
    return output


def set_fixed_layout(table) -> None:
    tbl_pr = table._tbl.tblPr
    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    tbl_pr.append(layout)


def add_page_number(paragraph) -> None:
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


def build() -> None:
    contact, note, categories = parse_markdown(SOURCE)

    doc = Document()

    # Page setup: A4, compact margins.
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.4)
    section.bottom_margin = Cm(1.4)
    section.left_margin = Cm(1.8)
    section.right_margin = Cm(1.8)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10)
    normal.font.color.rgb = DARK

    # ── Letterhead ────────────────────────────────────────────
    if LOGO.exists():
        logo_para = doc.add_paragraph()
        logo_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        logo_para.paragraph_format.space_after = Pt(2)
        logo_para.add_run().add_picture(str(trim_whitespace(LOGO)), width=Cm(6.0))

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(2)
    run = title.add_run("Golden Sparks")
    run.bold = True
    run.font.size = Pt(26)
    run.font.color.rgb = GOLD
    run.font.name = "Georgia"

    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(2)

    for line in contact:
        if line == "Golden Sparks":
            continue
        line = line.replace("📞", "Phone:").replace("✉️", "Email:").strip()
        para = doc.add_paragraph()
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        para.paragraph_format.space_after = Pt(0)
        run = para.add_run(line)
        run.font.size = Pt(10)
        run.font.name = "Calibri"

    rule = doc.add_paragraph()
    rule.paragraph_format.space_before = Pt(8)
    rule.paragraph_format.space_after = Pt(10)
    add_bottom_border(rule)

    # ── Pricelist heading ─────────────────────────────────────
    heading = doc.add_paragraph()
    heading.paragraph_format.space_after = Pt(2)
    run = heading.add_run("Product Pricelist 2026")
    run.bold = True
    run.font.size = Pt(18)
    run.font.name = "Georgia"
    run.font.color.rgb = DARK

    if note:
        note_para = doc.add_paragraph()
        note_para.paragraph_format.space_after = Pt(10)
        run = note_para.add_run(note)
        run.italic = True
        run.font.size = Pt(8.5)
        run.font.color.rgb = GREY

    # ── Tables ───────────────────────────────────────────────
    widths = [Cm(2.6), Cm(7.6), Cm(2.3), Cm(2.5), Cm(2.4)]
    headers = ["Code", "Product", "Packing", "MRP", "Special Rate"]

    for index, (category, rows) in enumerate(categories):
        cat = doc.add_paragraph()
        cat.paragraph_format.space_before = Pt(10 if index else 4)
        cat.paragraph_format.space_after = Pt(4)
        cat.paragraph_format.keep_with_next = True
        run = cat.add_run(category)
        run.bold = True
        run.font.size = Pt(12)
        run.font.name = "Georgia"
        run.font.color.rgb = GOLD

        table = doc.add_table(rows=1, cols=len(headers))
        table.style = "Table Grid"
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        set_fixed_layout(table)
        for column, width in zip(table.columns, widths):
            column.width = width

        header_row = table.rows[0]
        set_repeat_header(header_row)
        set_cant_split(header_row)
        for cell, width, label in zip(header_row.cells, widths, headers):
            cell.width = width
            shade(cell, HEADER_FILL)
            set_cell_margins(cell)
            align = WD_ALIGN_PARAGRAPH.RIGHT if label in ("MRP", "Special Rate") else WD_ALIGN_PARAGRAPH.LEFT
            cell_text(cell, label, bold=True, color=HEADER_TEXT, size=9, align=align)

        for row_index, values in enumerate(rows):
            row = table.add_row()
            set_cant_split(row)
            for col, (cell, width, value) in enumerate(zip(row.cells, widths, values)):
                cell.width = width
                special = col == 4
                if row_index % 2 == 1:
                    shade(cell, ZEBRA_FILL)
                set_cell_margins(cell)
                align = WD_ALIGN_PARAGRAPH.RIGHT if col >= 3 else WD_ALIGN_PARAGRAPH.LEFT
                cell_text(
                    cell,
                    value,
                    bold=special,
                    color=SPECIAL if special else None,
                    size=9,
                    align=align,
                )

    # ── Footer ────────────────────────────────────────────────
    footer_para = section.footer.paragraphs[0]
    footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer_para.add_run("Thank you, visit again!   ·   Page ")
    run.italic = True
    run.font.size = Pt(8)
    run.font.color.rgb = GREY
    add_page_number(footer_para)

    doc.save(OUTPUT)
    print(f"Wrote {OUTPUT} ({len(categories)} categories, {sum(len(r) for _, r in categories)} products)")


if __name__ == "__main__":
    build()
