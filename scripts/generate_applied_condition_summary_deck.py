from __future__ import annotations

import importlib.util
from pathlib import Path

from openpyxl import load_workbook
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
PROJECT = "aislc-applied-condition-imagegen"
SUMMARY_PROJECT = "aislc-applied-condition-imagegen-summary"
SOURCE_XLSX = Path("/Users/nuthdanai/Downloads/AI_Risk_Assessment_v2and_Minimum Control Checklist.xlsx")
IMG_DIR = ROOT / "assets" / "images" / PROJECT / "final"
OUT_PPTX = ROOT / "outputs" / f"{SUMMARY_PROJECT}.pptx"
OUTLINE = ROOT / "notes" / f"{SUMMARY_PROJECT}-outline.md"

GUIDE_PATH = ROOT / "scripts" / "generate_applied_condition_action_guide.py"
spec = importlib.util.spec_from_file_location("guide", GUIDE_PATH)
guide = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(guide)

SLIDE_W = 13.333
SLIDE_H = 7.5
FONT_HEAD = "Krungsri Simple"
FONT_BODY = "Sarabun"

C = {
    "white": "FFFFFF",
    "ink": "504545",
    "muted": "77706E",
    "taupe": "37302E",
    "line": "D9D3D0",
    "paper": "FBFAF8",
    "soft": "F3F0EE",
    "soft_yellow": "FEFAEE",
    "yellow": "FFC800",
    "green": "2E7D32",
    "gray": "A5A5A5",
}


def rgb(hex_value: str) -> RGBColor:
    hex_value = hex_value.strip("#")
    return RGBColor(int(hex_value[0:2], 16), int(hex_value[2:4], 16), int(hex_value[4:6], 16))


def add_rect(slide, x, y, w, h, fill, line=None, radius=True):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x),
        Inches(y),
        Inches(w),
        Inches(h),
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb(fill)
    if line:
        shape.line.color.rgb = rgb(line)
        shape.line.width = Pt(0.8)
    else:
        shape.line.fill.background()
    return shape


def add_text(slide, text, x, y, w, h, size=12, color=C["ink"], bold=False, align=PP_ALIGN.LEFT, font=FONT_BODY):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = Inches(0.04)
    tf.margin_right = Inches(0.04)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    tf.vertical_anchor = MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.text = text
    p.alignment = align
    p.line_spacing = 0.9
    for run in p.runs:
        run.font.name = font
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = rgb(color)
    return box


def draw_curve(slide):
    points = []
    for i in range(0, 90):
        t = i / 89
        x = -0.2 + 13.9 * t
        y = 6.18 + 1.22 * (1 - (2 * t - 0.36) ** 2)
        points.append((Inches(x), Inches(y)))
    fb = slide.shapes.build_freeform(points[0][0], points[0][1])
    fb.add_line_segments(points[1:], close=False)
    curve = fb.convert_to_shape()
    curve.fill.background()
    curve.line.color.rgb = rgb(C["yellow"])
    curve.line.width = Pt(4.6)


def add_header(slide, title, subtitle=None, section="SUMMARY"):
    add_rect(slide, 0, 0, SLIDE_W, SLIDE_H, C["white"], None, False)
    draw_curve(slide)
    add_rect(slide, 0, 0, 0.08, SLIDE_H, C["yellow"], None, False)
    add_text(slide, title, 0.42, 0.22, 8.3, 0.48, size=22, bold=True, font=FONT_HEAD)
    if subtitle:
        add_text(slide, subtitle, 0.44, 0.7, 9.25, 0.3, size=10.5, color=C["muted"])
    add_rect(slide, 10.52, 0.28, 2.2, 0.3, C["taupe"], None, True)
    add_text(slide, section, 10.64, 0.335, 1.95, 0.15, size=8.2, color=C["white"], bold=True, align=PP_ALIGN.CENTER, font=FONT_HEAD)


def raw_evident_counts() -> dict[str, int]:
    wb = load_workbook(SOURCE_XLSX, data_only=True)
    ws = wb["Control_Guideline"]
    headers = [c.value for c in ws[1]]
    idx = {h: i for i, h in enumerate(headers) if h}
    counts: dict[str, int] = {}
    for raw in ws.iter_rows(min_row=2, values_only=True):
        action = guide.clean(raw[idx["Action สิ่งที่โปรเจคทีมต้องทำ"]])
        condition = guide.normalize_condition(raw[idx["Applied condition for project"]])
        if not condition and guide.clean(raw[idx["Domain Area"]]) == "Model from 3rd Party":
            condition = "ใช้ Model จาก Vendor / 3rd Party"
        evident = guide.clean(raw[idx["Evident"]])
        if condition and action and evident:
            counts[condition] = counts.get(condition, 0) + 1
    return counts


def summary_rows(counts: dict[str, int]):
    return [
        {
            "condition": "ทุกกรณี",
            "label": "ทุกกรณี",
            "action": "กำหนด KPI/criteria ใน BRD, ทำ Risk Assessment, register use case, เตรียม monitoring/security baseline",
            "evidence": "BRD, AI Risk Form, Registration ID, ARB Pack, Monitoring Report",
            "gate": "Initiation / ARB / Go-live",
        },
        {
            "condition": "AI Risk Assessment = Medium or High",
            "label": "AI Risk = Medium / High",
            "action": "เตรียม edge case dataset และทดสอบเทียบกับ criteria ที่กำหนดไว้",
            "evidence": "Edge case dataset, Model Performance Report",
            "gate": "Go-live",
        },
        {
            "condition": "AI Risk Assessment = High",
            "label": "AI Risk = High",
            "action": "ทำ robustness test, ตั้ง quality alert, ออกแบบ kill switch และ stop-use/fallback plan",
            "evidence": "Model Performance Report, Dashboard, Alert Config, Incident Plan",
            "gate": "Go-live / Operation",
        },
        {
            "condition": "มีการนำระบบ AI มาใช้กับงานหลักที่เกี่ยวข้องกับการตัดสินใจเชิงกลยุทธ์(ตามประกาศ BOT) หรือ งานที่ส่งผลกระทบโดยตรงต่อลูกค้า",
            "label": "Strategic / Customer Impact",
            "action": "ออกแบบ HITL/HOTL และแสดงจุด human review/override ใน process หรือ UI",
            "evidence": "Process Flow, Customer Journey, Use Case Diagram, UI Capture",
            "gate": "ARB / Model Gov",
        },
        {
            "condition": "ใช้สนทนาหรือสื่อสารกับลูกค้าแทนมนุษย์",
            "label": "Customer-facing AI",
            "action": "ใส่ AI disclosure, แจ้งวัตถุประสงค์การใช้ข้อมูล และมีทางเลือกติดต่อเจ้าหน้าที่",
            "evidence": "UI Screenshot, Chatbot Wording, Approval Record",
            "gate": "Model Gov",
        },
        {
            "condition": "ข้อมูลขาเข้าหรือขาออกจากระบบ AI ถูกจัดเตรียมให้เป็นรายบุคคล",
            "label": "Personalized Input / Output",
            "action": "เลือก fairness metrics, ทดสอบ bias ต่อกลุ่มที่เกี่ยวข้อง และระบุ mitigation",
            "evidence": "Fairness Test, Bias Review, AI Safety Checklist",
            "gate": "Go-live",
        },
        {
            "condition": "Business-critical supervised model",
            "label": "Business-critical Supervised",
            "action": "ทำ explainability เช่น SHAP/LIME/feature importance และอธิบาย drivers ของผลลัพธ์",
            "evidence": "Model Performance Report, Explainability Section",
            "gate": "Go-live",
        },
        {
            "condition": "เป็น Generative AI",
            "label": "Generative AI",
            "action": "ออกแบบ RAG/source citation และ capture output ที่เห็น reference ก่อน go-live",
            "evidence": "RAG Design, Source Citation, Output Screenshot",
            "gate": "Go-live",
        },
        {
            "condition": "ทำ Model Training หรือ Finetuning",
            "label": "Training / Fine-tuning",
            "action": "ใช้ registry/experiment tracking, กำหนด data quality, ทำ EDA, Model Card และ lineage",
            "evidence": "Model Training Report, EDA Report, Model Card, Lineage Record, ARB Pack",
            "gate": "ARB / Go-live",
        },
        {
            "condition": "Deploy ระบบ AI ภายในระบบธนาคาร",
            "label": "Internal Bank Deployment",
            "action": "กำกับ model version, เก็บ deploy log, เตรียม rollback/fallback และ security control",
            "evidence": "Model Deployment Record, Deploy Log, Incident Plan, Security Evidence",
            "gate": "CCB / Go-live",
        },
        {
            "condition": "ใช้ Model จาก Vendor / 3rd Party",
            "label": "Vendor Model",
            "action": "ตรวจ contract clauses, License/ToS, SLA, vendor due diligence และ model/security risk",
            "evidence": "Vendor DD, Contract, Legal Review, SLA Report, ARB Pack",
            "gate": "Procurement / ARB",
        },
        {
            "condition": "ใช้งาน External data ซึ่งได้รับมาจาก vendor / 3rd party",
            "label": "External Data from Vendor",
            "action": "ผ่าน procurement, ให้ Legal/PDPA ตรวจ contract และระบุสิทธิ use/retain/share",
            "evidence": "Data Governance Checklist, Contract, Legal Review, PDPA Review",
            "gate": "Procurement / ARB",
        },
        {
            "condition": "ใช้งาน External data ซึ่งเป็น Open data",
            "label": "External Open Data",
            "action": "ระบุ source, collector, license, version/date และเก็บ provenance ใน ARB Pack",
            "evidence": "Data Provenance, License Evidence, ARB Pack",
            "gate": "ARB",
        },
        {
            "condition": "ใช้งาน Generative AI / LLM / prompt‑based system",
            "label": "LLM / Prompt-based",
            "action": "อ้างอิง AI Security Guideline, ทดสอบ prompt injection/jailbreak และบันทึก mitigation",
            "evidence": "System Architecture, Security Test Result, Mitigation Record",
            "gate": "Go-live",
        },
        {
            "condition": "ใช้ Open Source Model",
            "label": "Open Source Model",
            "action": "เก็บ license evidence และตรวจ compatibility กับ business use และ deployment",
            "evidence": "License Evidence, Compatibility Review, Architecture Design",
            "gate": "ARB",
        },
        {
            "condition": "ใช้งาน External data ซึ่งเป็น Non-Open data เช่น web scraping",
            "label": "Non-open External Data",
            "action": "ตรวจ source rights, PDPA, copyright และ cyber risk ก่อนใช้ข้อมูล",
            "evidence": "Data Governance Checklist, PDPA Review, Copyright Review, Source Risk Record",
            "gate": "ARB",
        },
    ]


def add_overview_slide(prs, rows, counts):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(
        slide,
        "หน้าสรุป: ต้องทำอะไรในแต่ละกรณี",
        "ใช้ไล่ดูว่าโปรเจกต์เข้า condition ไหน แล้วต้องเตรียม action/evidence อะไรต่อ",
        "SUMMARY",
    )
    add_rect(slide, 0.55, 1.28, 2.1, 1.05, C["soft_yellow"], C["line"], True)
    add_text(slide, "16", 0.82, 1.44, 0.7, 0.35, size=23, bold=True, font=FONT_HEAD)
    add_text(slide, "condition groups", 1.43, 1.58, 1.0, 0.22, size=9.2, color=C["muted"])
    add_rect(slide, 2.88, 1.28, 2.1, 1.05, C["soft_yellow"], C["line"], True)
    add_text(slide, "31", 3.15, 1.44, 0.7, 0.35, size=23, bold=True, font=FONT_HEAD)
    add_text(slide, "evident count", 3.74, 1.58, 1.0, 0.22, size=9.2, color=C["muted"])
    add_rect(slide, 5.21, 1.28, 2.1, 1.05, C["soft_yellow"], C["line"], True)
    add_text(slide, "2", 5.55, 1.44, 0.45, 0.35, size=23, bold=True, font=FONT_HEAD)
    add_text(slide, "summary pages", 6.02, 1.58, 1.0, 0.22, size=9.2, color=C["muted"])

    add_rect(slide, 8.0, 1.15, 4.8, 1.34, C["taupe"], None, True)
    add_text(
        slide,
        "อ่านแบบเร็ว: ถ้า condition เป็น Yes ให้ดู Action, เก็บ Evidence แล้วส่งตาม Gate",
        8.32,
        1.48,
        4.18,
        0.55,
        size=15,
        color=C["white"],
        bold=True,
        font=FONT_HEAD,
    )

    cards = [
        ("Baseline", "ทุกกรณี", "KPI / Risk Form / Register / Monitoring"),
        ("Risk & Customer", "Medium, High, Customer impact", "Edge case / Alert / Oversight / Disclosure"),
        ("Build & Model", "Training, GenAI, LLM, Supervised", "Lineage / Citation / Prompt security / Explainability"),
        ("Vendor & Data", "Vendor, Open data, Open source", "Contract / License / PDPA / Provenance"),
    ]
    for i, (title, scope, action) in enumerate(cards):
        x = 0.55 + (i % 2) * 6.25
        y = 3.0 + (i // 2) * 1.55
        add_rect(slide, x, y, 5.7, 1.18, C["paper"], C["line"], True)
        add_rect(slide, x, y, 0.09, 1.18, C["yellow"], None, False)
        add_text(slide, title, x + 0.25, y + 0.18, 2.0, 0.25, size=13, bold=True, font=FONT_HEAD)
        add_text(slide, scope, x + 0.25, y + 0.5, 5.1, 0.22, size=9.4, color=C["muted"])
        add_text(slide, action, x + 0.25, y + 0.77, 5.1, 0.22, size=9.6, color=C["ink"], bold=True)

    top_counts = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:4]
    labels = []
    for cond, count in top_counts:
        label = next((row["label"] for row in rows if row["condition"] == cond), cond)
        labels.append(f"{label}: {count}")
    add_text(slide, "Top evidence count: " + "  |  ".join(labels), 0.72, 6.55, 11.9, 0.25, size=9.2, color=C["muted"])
    return slide


def add_matrix_slide(prs, title, subtitle, rows, counts, section):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, title, subtitle, section)

    x0 = 0.38
    y0 = 1.22
    col_w = [2.58, 4.45, 3.28, 1.35, 0.62]
    headers = ["Condition", "สิ่งที่ทีมต้องทำ", "Evidence ที่เตรียม", "Gate", "#"]
    header_h = 0.34
    row_h = 0.64

    add_rect(slide, x0, y0, sum(col_w), header_h, C["taupe"], None, False)
    cx = x0
    for w, header in zip(col_w, headers):
        add_text(slide, header, cx + 0.05, y0 + 0.08, w - 0.1, 0.12, size=7.8, color=C["white"], bold=True, font=FONT_HEAD)
        cx += w

    for r, item in enumerate(rows):
        y = y0 + header_h + r * row_h
        fill = C["white"] if r % 2 == 0 else C["paper"]
        add_rect(slide, x0, y, sum(col_w), row_h, fill, C["line"], False)
        cx = x0
        cell_texts = [
            item["label"],
            item["action"],
            item["evidence"],
            item["gate"],
            str(counts.get(item["condition"], 0)),
        ]
        sizes = [7.3, 7.1, 6.8, 6.7, 9]
        bolds = [True, False, False, False, True]
        for w, text, size, bold in zip(col_w, cell_texts, sizes, bolds):
            color = C["ink"] if text != "0" else C["gray"]
            align = PP_ALIGN.CENTER if w == col_w[-1] else PP_ALIGN.LEFT
            add_text(slide, text, cx + 0.05, y + 0.08, w - 0.1, row_h - 0.12, size=size, color=color, bold=bold, align=align)
            cx += w

    add_rect(slide, 0.58, 6.64, 11.95, 0.34, C["soft_yellow"], C["line"], True)
    add_text(
        slide,
        "# = จำนวนแถวที่มี Evident ใน Pivot ตัวอย่าง; บาง condition ต้องทำ action แม้ช่อง Evident เดิมยังว่าง",
        0.78,
        6.73,
        11.5,
        0.12,
        size=7.8,
        color=C["muted"],
    )
    return slide


def add_image_slide(prs, image_path: Path):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    slide.shapes.add_picture(str(image_path), 0, 0, width=prs.slide_width, height=prs.slide_height)
    return slide


def build_deck():
    counts = raw_evident_counts()
    rows = summary_rows(counts)

    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W)
    prs.slide_height = Inches(SLIDE_H)
    prs.core_properties.title = "AISLC Applied Condition Summary"
    prs.core_properties.subject = "Summary pages plus imagegen condition guide"
    prs.core_properties.author = "Codex"

    add_image_slide(prs, IMG_DIR / "slide-01.png")
    add_overview_slide(prs, rows, counts)
    add_matrix_slide(
        prs,
        "สรุปสิ่งที่ต้องทำ: Baseline / Risk / Customer",
        "เงื่อนไขที่มักใช้กับทุกโปรเจกต์ หรือเกี่ยวกับ risk level และผลกระทบต่อลูกค้า",
        rows[:8],
        counts,
        "SUMMARY 1/2",
    )
    add_matrix_slide(
        prs,
        "สรุปสิ่งที่ต้องทำ: Model / Data / Vendor",
        "เงื่อนไขที่เกี่ยวกับการ train, deploy, ใช้ vendor, ใช้ข้อมูลภายนอก และ open source",
        rows[8:],
        counts,
        "SUMMARY 2/2",
    )
    for i in range(2, 19):
        add_image_slide(prs, IMG_DIR / f"slide-{i:02d}.png")

    OUT_PPTX.parent.mkdir(parents=True, exist_ok=True)
    prs.save(OUT_PPTX)

    OUTLINE.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# AISLC Applied Condition Imagegen Summary Deck",
        "",
        f"Output: `{OUT_PPTX}`",
        "",
        "## Added Summary Slides",
        "1. หน้าสรุป: ต้องทำอะไรในแต่ละกรณี",
        "2. สรุปสิ่งที่ต้องทำ: Baseline / Risk / Customer",
        "3. สรุปสิ่งที่ต้องทำ: Model / Data / Vendor",
        "",
        "## Summary Rows",
    ]
    for item in rows:
        lines.append(f"- {item['label']}: {item['action']} | Evidence: {item['evidence']} | Gate: {item['gate']}")
    OUTLINE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return OUT_PPTX


if __name__ == "__main__":
    print(build_deck())
