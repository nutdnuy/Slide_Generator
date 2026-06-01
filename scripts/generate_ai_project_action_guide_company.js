const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "ai-project-action-guide-company";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");
const PPTX_OUT = path.join(OUT_DIR, "AI_Project_Action_Guide_Company.pptx");
const OUTLINE_OUT = path.join(NOTES_DIR, "ai-project-action-guide-company-outline.md");
const CONTACT_OUT = path.join(IMG_DIR, "contact-sheet.png");
const EN_IMG_DIR = path.join(ROOT, "assets", "images", `${OUT_NAME}-en`);
const EN_PPTX_OUT = path.join(OUT_DIR, "AI_Project_Action_Guide_Company_EN.pptx");
const EN_OUTLINE_OUT = path.join(NOTES_DIR, "ai-project-action-guide-company-en-outline.md");
const EN_CONTACT_OUT = path.join(EN_IMG_DIR, "contact-sheet.png");
const BLANK_IMG_DIR = path.join(ROOT, "assets", "images", `${OUT_NAME}-blank`);
const BLANK_PPTX_OUT = path.join(OUT_DIR, "AI_Project_Action_Guide_Company_Blank.pptx");
const BLANK_OUTLINE_OUT = path.join(NOTES_DIR, "ai-project-action-guide-company-blank-outline.md");
const BLANK_CONTACT_OUT = path.join(BLANK_IMG_DIR, "contact-sheet.png");

const W = 1920;
const H = 1080;
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const C = {
  gold: "#FFD000",
  gold2: "#F5B800",
  dark: "#07111E",
  dark2: "#111827",
  white: "#F8FAFC",
  muted: "#D8DEE9",
  soft: "#AEB7C5",
  teal: "#43D0B9",
  red: "#FF6B5F",
  amber: "#F4A340",
  green: "#6EE7A8",
  line: "#576070",
};

const slides = [
  {
    kicker: "INTERNAL USE | AI PROJECT ACTION GUIDE",
    title: ["AI Projects:", "ต้องทำอะไรบ้าง", "ก่อนเริ่มทำจริง"],
    subtitle: "คู่มือสั้นสำหรับทุกทีม: จากไอเดีย → อนุมัติ → ใช้งาน → monitor",
    type: "cover",
    note:
      "เปิดด้วย framing ว่า AI project ต้องเริ่มจาก governance ตั้งแต่วันแรก ไม่ใช่เริ่มจาก build หรือซื้อ tool ก่อน",
  },
  {
    kicker: "01 | SCOPE",
    title: ["ถ้าเข้าข่าย AI", "ให้เข้า AISLC ก่อน"],
    subtitle: "ไม่ว่าทำเอง ซื้อ vendor ใช้ open-source หรือใช้ GenAI/Agent",
    type: "scope",
    note:
      "ย้ำว่า scope ครอบคลุม Predictive AI, Generative AI, Agentic AI, vendor/open-source/foundation model และทุกช่องทางการพัฒนา",
  },
  {
    kicker: "02 | LIFECYCLE",
    title: ["ใช้ lifecycle เดียวกัน", "ทั้งบริษัท"],
    subtitle: "5 phases + 4 gates และ update inventory ทุก gate",
    type: "lifecycle",
    note:
      "อธิบายภาพรวม AI System Life Cycle: Initiation, Development/Sourcing, Implementation, Operation, Decommissioning",
  },
  {
    kicker: "03 | RISK TIERING",
    title: ["จัด Risk Tier", "ตั้งแต่วันแรก"],
    subtitle: "Impact Risk + Inherent AI Risk + Hard Triggers = Final Risk Level",
    type: "risk",
    note:
      "การจัดระดับความเสี่ยงเป็นตัวกำหนดความเข้มของ control, approval, validation, monitoring และ human oversight",
  },
  {
    kicker: "04 | PHASE 1",
    title: ["ก่อนสร้าง", "ต้องเคลียร์ 6 เรื่อง"],
    subtitle: "Phase 1: Model Initiation → Gate 1 Project Approved",
    type: "phase1",
    note:
      "Phase 1 คือจุดเข้าโครงการ ต้องมี BRD, success metric, owner, initial risk assessment, pre-screen และ portfolio entry",
  },
  {
    kicker: "05 | PHASE 2",
    title: ["พัฒนา / ซื้อ / ปรับแต่ง", "ต้องมีหลักฐาน"],
    subtitle: "Phase 2: Development / Sourcing → Gate 2 Go / No-Go",
    type: "phase2",
    note:
      "Phase 2 ต้องควบคุม data, route การพัฒนา, model quality, responsible AI checklist และ architecture review",
  },
  {
    kicker: "06 | PHASE 3",
    title: ["ก่อน Go-live", "ต้องพร้อมทั้งระบบ"],
    subtitle: "Phase 3: Implementation → Gate 3 Go-Live Approved",
    type: "phase3",
    note:
      "ก่อนขึ้น production ต้องมี security assessment, validation, explainability, HITL/HOTL, rollback-to-human, QA และ OpRisk approval",
  },
  {
    kicker: "07 | PHASE 4-5",
    title: ["หลัง Go-live", "งานยังไม่จบ"],
    subtitle: "Operate, monitor, review, enhance หรือ retire อย่างมีหลักฐาน",
    type: "operate",
    note:
      "AI system ต้องถูก monitor ระหว่างใช้งาน และเมื่อเลิกใช้ต้องมี decommissioning, data/model disposal และ inventory update",
  },
  {
    kicker: "08 | OWNERSHIP",
    title: ["ใครต้องทำอะไร"],
    subtitle: "AI project ต้องมี accountable owner และ reviewer ตามบทบาท",
    type: "roles",
    note:
      "สื่อให้เห็นบทบาทของ BU/Product Owner, AI CoE, Model Validation, Risk, Compliance, Data Governance, Security, ARB, QAD และ Internal Audit",
  },
  {
    kicker: "09 | EVIDENCE",
    title: ["ทุก Gate ต้องมี", "Evidence Pack"],
    subtitle: "ทำให้ audit trail ตรวจย้อนกลับได้ว่าใครอนุมัติอะไร เมื่อไร และด้วยหลักฐานใด",
    type: "evidence",
    note:
      "เน้นเอกสารที่ต้องมีในแต่ละ gate: BRD, risk classification, data approval, prototype review, security, validation, monitoring และ decision record",
  },
  {
    kicker: "10 | HUMAN OVERSIGHT",
    title: ["AI ห้ามตัดสินใจลำพัง", "ในงานเสี่ยงสูง"],
    subtitle: "ต้องมี human oversight, override, escalation และ rollback-to-human",
    type: "oversight",
    note:
      "ย้ำหลักการ HITL/HOTL โดยเฉพาะ high-risk AI และข้อห้ามเรื่อง personal data, autonomous material decision และการข้าม monitoring",
  },
  {
    kicker: "11 | START HERE",
    title: ["ถ้าทีมคุณอยากทำ", "AI Project"],
    subtitle: "Start small. Govern from day one.",
    type: "next",
    note:
      "ปิดด้วย next steps ที่ทีมทำได้ทันที: ตั้ง use case, owner, contact AI CoE, register, risk tiering, pre-screen และเข้า Gate 1",
  },
];

const englishSlides = [
  {
    kicker: "INTERNAL USE | AI PROJECT ACTION GUIDE",
    title: ["AI Projects:", "What to Do", "Before You Start"],
    subtitle: ["A practical guide for every team:", "idea -> approval -> launch", "-> monitoring"],
    type: "cover",
    note:
      "Frame AI projects as governed work from day one. Teams should not start by building or buying tools before intake, risk tiering, and gate approval.",
  },
  {
    kicker: "01 | SCOPE",
    title: ["If It Uses AI,", "Enter AISLC First"],
    subtitle: "Whether you build, buy, use open-source, or use GenAI / agents",
    type: "scope",
    scopeIntro: ["Whether you build, buy, use open-source,", "or use GenAI / agents"],
    scopeCards: [
      ["Predictive AI", ["score / forecast", "recommendation"]],
      ["Generative AI", ["LLM / image", "content / chatbot"]],
      ["Agentic AI", ["calls tools", "runs multi-step work"]],
      ["Vendor / Open-source", ["foundation model", "third-party AI"]],
    ],
    rule: ["Rule:", "Register and risk-tier", "before build / procure"],
    note:
      "Scope includes Predictive AI, Generative AI, Agentic AI, vendor models, open-source models, foundation models, and every development channel.",
  },
  {
    kicker: "02 | LIFECYCLE",
    title: ["One Lifecycle", "Company-Wide"],
    subtitle: "5 phases + 4 gates",
    type: "lifecycle",
    phases: [
      ["01", "Initiation", "define and register"],
      ["02", "Dev / Sourcing", "build / buy / adapt"],
      ["03", "Implementation", "production readiness"],
      ["04", "Operation", "monitor / review"],
      ["05", "Decommission", "retire safely"],
    ],
    inventoryNote: "Update inventory at every gate with audit trail",
    note:
      "Explain the AI System Life Cycle: Initiation, Development/Sourcing, Implementation, Operation, and Decommissioning.",
  },
  {
    kicker: "03 | RISK TIERING",
    title: ["Assign the Risk Tier", "on Day One"],
    subtitle: "Impact Risk + Inherent AI Risk + Hard Triggers = Final Risk Level",
    type: "risk",
    hardTriggersTitle: "Hard Triggers to Check",
    hardTriggers: [
      ["Personal / sensitive data"],
      ["Customer impact or", "critical business function"],
      ["External data / model sharing"],
      ["Vendor, open-source,", "foundation model"],
      ["Autonomous or", "material decision"],
    ],
    note:
      "Risk tiering determines control intensity, approval path, validation depth, monitoring frequency, and required human oversight.",
  },
  {
    kicker: "04 | PHASE 1",
    title: ["Before You Build,", "Clear 6 Items"],
    subtitle: "Phase 1: Model Initiation -> Gate 1 Approved",
    type: "phase1",
    note:
      "Phase 1 is the entry point: BRD, success metrics, owner, initial risk assessment, pre-screening, and portfolio entry.",
  },
  {
    kicker: "05 | PHASE 2",
    title: ["Build, Buy, or Adapt", "with Evidence"],
    subtitle: "Phase 2 -> Gate 2 Go / No-Go",
    type: "phase2",
    routeCards: [
      ["Maker", ["build internally", "control from start"]],
      ["Adopt", ["use vendor /", "pre-trained model"]],
      ["Customize", ["fine-tune / adapt", "for the use case"]],
    ],
    note:
      "Phase 2 controls data, sourcing route, model quality, responsible AI evidence, and architecture review.",
  },
  {
    kicker: "06 | PHASE 3",
    title: ["Before Go-live,", "Production Ready"],
    subtitle: ["Phase 3: Implementation", "-> Gate 3 Go-Live Approved"],
    type: "phase3",
    note:
      "Before production, complete security assessment, validation, explainability, HITL/HOTL, rollback-to-human, QA sign-off, and OpRisk approval.",
  },
  {
    kicker: "07 | PHASE 4-5",
    title: ["After Go-live,", "Work Continues"],
    subtitle: "Monitor, review, enhance, or retire",
    type: "operate",
    note:
      "AI systems must be monitored during use. When retired, teams need decommissioning approval, data/model disposal, and inventory updates.",
  },
  {
    kicker: "08 | OWNERSHIP",
    title: ["Who Must Do What"],
    subtitle: ["Each AI project needs an accountable owner", "and defined reviewers"],
    type: "roles",
    noOwnerText: "No owner = do not start the AI project",
    note:
      "Show the role split across BU/Product Owner, AI CoE, Model Validation, Risk, Compliance, Data Governance, Security, ARB, QAD, IT, and Internal Audit.",
  },
  {
    kicker: "09 | EVIDENCE",
    title: ["Every Gate Needs", "an Evidence Pack"],
    subtitle: "Audit trail: who approved what, when, and why",
    type: "evidence",
    note:
      "Evidence should include BRD, risk classification, data approval, prototype review, security assessment, validation evidence, monitoring report, and decision record.",
  },
  {
    kicker: "10 | HUMAN OVERSIGHT",
    title: ["High-Risk AI Needs", "Human Oversight"],
    subtitle: ["Human oversight, override, escalation,", "and rollback-to-human must be ready"],
    type: "oversight",
    note:
      "Emphasize HITL/HOTL for high-risk AI, plus restrictions around personal data, autonomous material decisions, and bypassing monitoring.",
  },
  {
    kicker: "11 | START HERE",
    title: ["If Your Team Wants", "an AI Project"],
    subtitle: "Start small. Govern from day one.",
    type: "next",
    note:
      "Close with practical next steps: name the use case, assign the owner, contact AI CoE, register, complete risk tiering, pre-screen, and enter Gate 1.",
  },
];

const blankSlides = slides.map((slide, i) => ({
  ...slide,
  title: [`Blank background ${String(i + 1).padStart(2, "0")}`],
  subtitle: "",
  note: `Blank background version of slide ${String(i + 1).padStart(2, "0")} for custom text or layout.`,
}));

function esc(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function rect(x, y, w, h, fill = C.dark, opacity = 1, rx = 0, stroke = "none", sw = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="${opacity}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function line(x1, y1, x2, y2, color = C.gold, sw = 4, opacity = 1, dash = "") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round" stroke-dasharray="${dash}"/>`;
}

function text(lines, x, y, size, opts = {}) {
  const {
    fill = C.white,
    weight = 700,
    lh = 1.18,
    anchor = "start",
    opacity = 1,
    family = '"Tahoma","Sukhumvit Set","Thonburi","Noto Sans Thai",Arial,sans-serif',
    spacing = "0",
  } = opts;
  const arr = Array.isArray(lines) ? lines : String(lines).split("\n");
  const safeFamily = esc(String(family).replace(/"/g, ""));
  const tspans = arr
    .map((value, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(value)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${safeFamily}" text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${spacing}">${tspans}</text>`;
}

function panel(x, y, w, h, opts = {}) {
  const { opacity = 0.82, stroke = C.gold, sw = 2, rx = 24, fill = C.dark } = opts;
  return [
    rect(x + 8, y + 10, w, h, "#000000", 0.18, rx),
    rect(x, y, w, h, fill, opacity, rx, stroke, sw),
  ].join("");
}

function tag(x, y, value) {
  return [
    rect(x, y, 420, 42, C.gold, 0.96, 18),
    text(value, x + 22, y + 29, 24, { fill: "#231F20", weight: 900, family: '"Arial",sans-serif' }),
  ].join("");
}

function footer(i) {
  return [
    rect(0, 1028, W, 52, "#030712", 0.56),
    text("Internal Use • AI Project Action Guide", 74, 1062, 25, { fill: C.muted, weight: 600 }),
    text(String(i + 1).padStart(2, "0") + " / 12", 1848, 1062, 25, {
      fill: C.gold,
      weight: 800,
      anchor: "end",
      family: '"Arial",sans-serif',
    }),
  ].join("");
}

function bullet(x, y, lines, opts = {}) {
  const { color = C.gold, size = 34, gap = 0, weight = 700 } = opts;
  return [
    `<circle cx="${x}" cy="${y - 10}" r="9" fill="${color}"/>`,
    text(lines, x + 28, y, size, { fill: C.white, weight, lh: 1.16 }),
    gap ? "" : "",
  ].join("");
}

function smallCard(x, y, w, h, head, body, color = C.gold) {
  return [
    panel(x, y, w, h, { opacity: 0.78, stroke: color, sw: 2, rx: 22 }),
    rect(x + 22, y + 22, 64, 10, color, 1, 5),
    text(head, x + 22, y + 78, 34, { fill: C.white, weight: 900 }),
    text(body, x + 22, y + 122, 24, { fill: C.muted, weight: 650, lh: 1.18 }),
  ].join("");
}

function header(slide, i) {
  return [rect(0, 0, W, H, "#000000", 0.22), tag(74, 64, slide.kicker), footer(i)].join("");
}

function cover(slide, i) {
  return [
    header(slide, i),
    panel(86, 156, 710, 720, { opacity: 0.88, stroke: C.gold, sw: 3, rx: 34 }),
    text(slide.title, 138, 286, 86, { fill: C.white, weight: 900, lh: 1.05 }),
    line(142, 574, 640, 574, C.gold, 7),
    text(slide.subtitle, 142, 652, 38, { fill: C.muted, weight: 650, lh: 1.22 }),
    text("Register • Risk Tier • Gate Approval • Monitor", 142, 790, 28, {
      fill: C.gold,
      weight: 900,
      family: '"Arial",sans-serif',
    }),
  ].join("");
}

function scope(slide, i) {
  const cards = slide.scopeCards || [
    ["Predictive AI", ["score / forecast", "recommendation"]],
    ["Generative AI", ["LLM / image", "content / chatbot"]],
    ["Agentic AI", ["เรียก tool", "ทำงานต่อเนื่อง"]],
    ["Vendor / Open-source", ["foundation model", "third-party AI"]],
  ];
  const intro = slide.scopeIntro || ["ไม่ว่าทำเอง ซื้อ vendor ใช้ open-source", "หรือใช้ GenAI / Agent"];
  const rule = slide.rule || ["Rule:", "ยังไม่ build / procure", "ก่อน register และจัด risk tier"];
  return [
    header(slide, i),
    panel(80, 136, 800, 292, { opacity: 0.86, stroke: C.gold }),
    text(slide.title, 128, 228, 70, { fill: C.white, weight: 900, lh: 1.06 }),
    text(intro, 128, 360, 30, {
      fill: C.muted,
      weight: 650,
      lh: 1.18,
    }),
    ...cards.map((c, idx) => {
      const x = 104 + (idx % 2) * 466;
      const y = 506 + Math.floor(idx / 2) * 186;
      return smallCard(x, y, 420, 156, c[0], c[1], idx === 2 ? C.teal : C.gold);
    }),
    panel(1030, 718, 720, 170, { opacity: 0.82, stroke: C.red, rx: 26 }),
    text(rule, 1080, 778, 40, {
      fill: C.white,
      weight: 900,
      lh: 1.12,
    }),
  ].join("");
}

function lifecycle(slide, i) {
  const phases = slide.phases || [
    ["01", "Initiation", "เริ่มโครงการ"],
    ["02", "Dev / Sourcing", "พัฒนา / จัดหา"],
    ["03", "Implementation", "ขึ้น production"],
    ["04", "Operation", "monitor / review"],
    ["05", "Decommission", "เลิกใช้งาน"],
  ];
  const startX = 150;
  const gap = 350;
  return [
    header(slide, i),
    panel(70, 134, 820, 228, { opacity: 0.82, stroke: C.gold }),
    text(slide.title, 118, 232, 66, { fill: C.white, weight: 900, lh: 1.04 }),
    text(slide.subtitle, 118, 326, 31, { fill: C.muted, weight: 650 }),
    line(210, 622, 1710, 622, C.gold, 6, 0.8),
    ...phases.map((p, idx) => {
      const x = startX + idx * gap;
      return [
        `<circle cx="${x}" cy="622" r="74" fill="${C.dark}" opacity="0.9" stroke="${C.gold}" stroke-width="4"/>`,
        text(p[0], x, 606, 34, { fill: C.gold, weight: 900, anchor: "middle", family: '"Arial",sans-serif' }),
        text(p[1], x, 652, 24, { fill: C.white, weight: 900, anchor: "middle", family: '"Arial",sans-serif' }),
        text(p[2], x, 746, 26, { fill: C.muted, weight: 700, anchor: "middle" }),
        idx < 4
          ? [
              rect(x + 122, 578, 110, 58, C.gold, 0.95, 18),
              text("GATE", x + 177, 616, 23, { fill: "#201A12", weight: 900, anchor: "middle", family: '"Arial",sans-serif' }),
            ].join("")
          : "",
      ].join("");
    }),
    panel(510, 858, 900, 92, { opacity: 0.82, stroke: C.teal, rx: 22 }),
    text(slide.inventoryNote || "ต้อง update AI Portfolio / Model Inventory ทุก gate พร้อม audit trail", 960, 916, 32, {
      fill: C.white,
      weight: 850,
      anchor: "middle",
    }),
  ].join("");
}

function risk(slide, i) {
  const hardTriggers = slide.hardTriggers || [
    ["Personal / sensitive data"],
    ["Customer impact หรือ", "critical business function"],
    ["External data / model sharing"],
    ["Vendor, open-source,", "foundation model"],
    ["Autonomous หรือ", "material decision"],
  ];
  return [
    header(slide, i),
    panel(78, 138, 760, 770, { opacity: 0.86, stroke: C.gold }),
    text(slide.title, 130, 236, 68, { fill: C.white, weight: 900, lh: 1.05 }),
    text(["Impact Risk", "+ Inherent AI Risk", "+ Hard Triggers", "= Final Risk Level"], 130, 430, 42, {
      fill: C.white,
      weight: 850,
      lh: 1.36,
    }),
    line(130, 704, 620, 704, C.gold, 7),
    text(["Low = Baseline", "Medium = Enhanced", "High = Strong governance + HITL"], 130, 766, 32, {
      fill: C.muted,
      weight: 700,
      lh: 1.32,
    }),
    panel(1000, 160, 740, 660, { opacity: 0.78, stroke: C.red }),
    text(slide.hardTriggersTitle || "Hard Triggers ที่ต้องระวัง", 1048, 246, 48, { fill: C.white, weight: 900 }),
    ...hardTriggers.map((item, idx) => bullet(1060, [340, 420, 532, 612, 724][idx], item, { color: C.red, size: 34 })),
  ].join("");
}

function phase1(slide, i) {
  const items = [
    ["1", "Business problem + expected outcome"],
    ["2", "Success metric / SLA"],
    ["3", "Business owner + accountable approver"],
    ["4", "Initial risk + hard triggers"],
    ["5", "Data / privacy / security pre-screen"],
    ["6", "AI Portfolio entry + Gate 1 approval"],
  ];
  return [
    header(slide, i),
    panel(82, 136, 830, 228, { opacity: 0.84, stroke: C.gold }),
    text(slide.title, 132, 232, 68, { fill: C.white, weight: 900, lh: 1.04 }),
    text(slide.subtitle, 132, 326, 30, { fill: C.muted, weight: 650 }),
    ...items.map((item, idx) => {
      const y = 460 + idx * 72;
      return [
        `<circle cx="146" cy="${y - 10}" r="24" fill="${C.gold}" opacity="0.96"/>`,
        text(item[0], 146, y, 26, { fill: "#1E1710", weight: 900, anchor: "middle", family: '"Arial",sans-serif' }),
        text(item[1], 190, y, 32, { fill: C.white, weight: 750, family: '"Arial","Tahoma",sans-serif' }),
      ].join("");
    }),
    panel(1030, 712, 670, 164, { opacity: 0.82, stroke: C.teal, rx: 24 }),
    text("Output", 1074, 770, 34, { fill: C.teal, weight: 900, family: '"Arial",sans-serif' }),
    text(["BRD, Risk Classification,", "Portfolio Entry, Approval Memo"], 1074, 820, 31, { fill: C.white, weight: 750, lh: 1.18 }),
  ].join("");
}

function phase2(slide, i) {
  const routeCards = slide.routeCards || [
    ["Maker", ["พัฒนาเอง", "ควบคุมตั้งแต่ต้น"]],
    ["Adopt", ["ใช้ vendor /", "pre-trained model"]],
    ["Customize", ["fine-tune / adapt", "ตาม use case"]],
  ];
  return [
    header(slide, i),
    panel(78, 130, 850, 240, { opacity: 0.85, stroke: C.gold }),
    text(slide.title, 128, 230, 64, { fill: C.white, weight: 900, lh: 1.05 }),
    text(slide.subtitle, 128, 332, 30, { fill: C.muted, weight: 650 }),
    smallCard(118, 480, 330, 160, routeCards[0][0], routeCards[0][1], C.gold),
    smallCard(474, 480, 330, 160, routeCards[1][0], routeCards[1][1], C.teal),
    smallCard(830, 480, 330, 160, routeCards[2][0], routeCards[2][1], C.amber),
    panel(1215, 166, 610, 700, { opacity: 0.84, stroke: C.teal }),
    text("Gate 2 Evidence", 1264, 252, 48, { fill: C.white, weight: 900, family: '"Arial",sans-serif' }),
    bullet(1272, 342, ["Data Governance approval"], { color: C.teal, size: 32 }),
    bullet(1272, 422, ["Data quality, lineage,", "feature documentation"], { color: C.teal, size: 32 }),
    bullet(1272, 532, ["Performance validation"], { color: C.teal, size: 32 }),
    bullet(1272, 612, ["Bias / fairness / privacy", "/ transparency evidence"], { color: C.teal, size: 32 }),
    bullet(1272, 726, ["ARB / architecture sign-off"], { color: C.teal, size: 32 }),
  ].join("");
}

function phase3(slide, i) {
  return [
    header(slide, i),
    panel(78, 134, 750, 750, { opacity: 0.87, stroke: C.gold }),
    text(slide.title, 128, 232, 68, { fill: C.white, weight: 900, lh: 1.04 }),
    text(slide.subtitle, 128, 326, 30, { fill: C.muted, weight: 650 }),
    bullet(142, 456, ["Security assessment / VAPT", "where needed"], { color: C.gold, size: 33 }),
    bullet(142, 568, ["Business KPI + model", "quality validation"], { color: C.gold, size: 33 }),
    bullet(142, 680, ["Explainability + model", "documentation"], { color: C.gold, size: 33 }),
    bullet(142, 792, ["HITL / HOTL +", "rollback-to-human"], { color: C.gold, size: 33 }),
    panel(1064, 724, 610, 152, { opacity: 0.84, stroke: C.green, rx: 24 }),
    text("Gate 3 = Go-live approved", 1368, 812, 40, {
      fill: C.white,
      weight: 900,
      anchor: "middle",
      family: '"Arial","Tahoma",sans-serif',
    }),
  ].join("");
}

function operate(slide, i) {
  return [
    header(slide, i),
    panel(82, 136, 800, 230, { opacity: 0.85, stroke: C.gold }),
    text(slide.title, 132, 232, 70, { fill: C.white, weight: 900, lh: 1.04 }),
    text(slide.subtitle, 132, 328, 30, { fill: C.muted, weight: 650 }),
    panel(116, 462, 800, 400, { opacity: 0.82, stroke: C.teal }),
    text("Operate & Review", 170, 542, 45, { fill: C.teal, weight: 900, family: '"Arial","Tahoma",sans-serif' }),
    bullet(180, 628, ["Monitor performance & SLA"], { color: C.teal, size: 32 }),
    bullet(180, 704, ["Detect data / concept drift"], { color: C.teal, size: 32 }),
    bullet(180, 780, ["Incident + retraining log"], { color: C.teal, size: 32 }),
    panel(1010, 462, 760, 400, { opacity: 0.82, stroke: C.red }),
    text("Retire Safely", 1064, 542, 45, { fill: C.red, weight: 900, family: '"Arial","Tahoma",sans-serif' }),
    bullet(1074, 628, ["Retirement approval"], { color: C.red, size: 32 }),
    bullet(1074, 704, ["Archive evidence & artifacts"], { color: C.red, size: 32 }),
    bullet(1074, 780, ["Delete data/model, revoke keys"], { color: C.red, size: 32 }),
    text("Inventory status = Retired", 1390, 914, 34, { fill: C.gold, weight: 900, anchor: "middle" }),
  ].join("");
}

function roles(slide, i) {
  const roles = slide.roles || [
    ["BU / Product Owner", "owns value, risk, performance"],
    ["AI CoE / Model Validation", "method, model quality, inventory support"],
    ["Risk / Compliance / Data / Security", "challenge controls and approve"],
    ["ARB / QAD / IT", "architecture, build standard, go-live"],
    ["Internal Audit", "independent review"],
  ];
  return [
    header(slide, i),
    panel(970, 128, 820, 770, { opacity: 0.86, stroke: C.gold }),
    text(slide.title, 1024, 230, 70, { fill: C.white, weight: 900 }),
    text(slide.subtitle, 1024, 300, 30, { fill: C.muted, weight: 650 }),
    ...roles.map((r, idx) => {
      const y = 404 + idx * 96;
      return [
        `<circle cx="1040" cy="${y - 14}" r="12" fill="${idx === 0 ? C.gold : idx === 4 ? C.red : C.teal}"/>`,
        text(r[0], 1072, y, 32, { fill: C.white, weight: 900, family: '"Arial","Tahoma",sans-serif' }),
        text(r[1], 1072, y + 38, 26, { fill: C.muted, weight: 650, family: '"Arial","Tahoma",sans-serif' }),
      ].join("");
    }),
    panel(118, 752, 670, 126, { opacity: 0.84, stroke: C.red, rx: 26 }),
    text(slide.noOwnerText || "ไม่มี owner = ไม่ควรเริ่ม AI project", 454, 826, 36, { fill: C.white, weight: 900, anchor: "middle" }),
  ].join("");
}

function evidence(slide, i) {
  const gates = [
    ["Gate 1", ["BRD", "Risk classification", "Portfolio entry", "Initial approvals"]],
    ["Gate 2", ["Data approval", "Prototype review", "Responsible AI checklist", "ARB sign-off"]],
    ["Gate 3", ["Security assessment", "Validation evidence", "Explainability report", "HITL / fallback plan"]],
    ["Gate 4", ["Monitoring report", "Annual review", "Decision record", "Inventory update"]],
  ];
  return [
    header(slide, i),
    panel(78, 128, 790, 228, { opacity: 0.84, stroke: C.gold }),
    text(slide.title, 128, 226, 66, { fill: C.white, weight: 900, lh: 1.04 }),
    text(slide.subtitle, 128, 326, 29, { fill: C.muted, weight: 650 }),
    ...gates.map((g, idx) => {
      const x = 120 + idx * 445;
      const y = 490;
      return [
        panel(x, y, 380, 368, { opacity: 0.84, stroke: idx % 2 ? C.teal : C.gold, rx: 22 }),
        text(g[0], x + 34, y + 74, 40, { fill: idx % 2 ? C.teal : C.gold, weight: 900, family: '"Arial",sans-serif' }),
        ...g[1].map((b, j) => bullet(x + 44, y + 146 + j * 52, [b], { color: idx % 2 ? C.teal : C.gold, size: 25 })),
      ].join("");
    }),
  ].join("");
}

function oversight(slide, i) {
  return [
    header(slide, i),
    panel(78, 132, 780, 760, { opacity: 0.88, stroke: C.gold }),
    text(slide.title, 128, 232, 62, { fill: C.white, weight: 900, lh: 1.08 }),
    text(slide.subtitle, 128, 362, 29, { fill: C.muted, weight: 650 }),
    text("DO", 132, 470, 36, { fill: C.green, weight: 900, family: '"Arial",sans-serif' }),
    bullet(148, 538, ["Define HITL/HOTL before go-live"], { color: C.green, size: 30 }),
    bullet(148, 612, ["Keep override + escalation path"], { color: C.green, size: 30 }),
    bullet(148, 686, ["Explain output and limitations"], { color: C.green, size: 30 }),
    text("DON'T", 132, 754, 36, { fill: C.red, weight: 900, family: '"Arial",sans-serif' }),
    bullet(148, 822, ["Do not let AI auto-approve", "material high-risk decisions"], { color: C.red, size: 30 }),
    panel(1128, 712, 610, 166, { opacity: 0.84, stroke: C.red, rx: 26 }),
    text(["High Risk:", "Human-out-of-the-loop", "is not permitted"], 1434, 772, 34, {
      fill: C.white,
      weight: 900,
      lh: 1.18,
      anchor: "middle",
      family: '"Arial","Tahoma",sans-serif',
    }),
  ].join("");
}

function next(slide, i) {
  const steps = [
    "Name the use case + business owner",
    "Contact AI CoE / register portfolio",
    "Complete risk tiering + hard triggers",
    "Do data / privacy / security pre-screen",
    "Prepare Gate 1 evidence before build",
  ];
  return [
    header(slide, i),
    panel(86, 138, 820, 760, { opacity: 0.88, stroke: C.gold }),
    text(slide.title, 136, 238, 68, { fill: C.white, weight: 900, lh: 1.06 }),
    text(slide.subtitle, 136, 372, 34, { fill: C.gold, weight: 900, family: '"Arial","Tahoma",sans-serif' }),
    ...steps.map((s, idx) => {
      const y = 492 + idx * 80;
      return [
        `<circle cx="152" cy="${y - 12}" r="25" fill="${C.gold}" opacity="0.96"/>`,
        text(String(idx + 1), 152, y, 25, { fill: "#1E1710", weight: 900, anchor: "middle", family: '"Arial",sans-serif' }),
        text(s, 196, y, 31, { fill: C.white, weight: 800, family: '"Arial","Tahoma",sans-serif' }),
      ].join("");
    }),
    text("Build only after approval, then follow Gates 2-4.", 520, 878, 32, {
      fill: C.muted,
      weight: 700,
      anchor: "middle",
      family: '"Arial","Tahoma",sans-serif',
    }),
  ].join("");
}

function overlay(slide, i) {
  const renderers = { cover, scope, lifecycle, risk, phase1, phase2, phase3, operate, roles, evidence, oversight, next };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.28"/></filter>
    </defs>
    ${renderers[slide.type](slide, i)}
  </svg>`;
}

async function renderSlides(deckSlides, outImgDir, opts = {}) {
  const { blank = false } = opts;
  fs.mkdirSync(outImgDir, { recursive: true });
  for (let i = 0; i < deckSlides.length; i += 1) {
    const bgPath = path.join(IMG_DIR, `slide-${String(i + 1).padStart(2, "0")}-bg.png`);
    const outPath = path.join(outImgDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    if (!fs.existsSync(bgPath)) throw new Error(`Missing generated background: ${bgPath}`);
    const pipeline = sharp(bgPath).resize(W, H, { fit: "cover" });
    if (!blank) pipeline.composite([{ input: Buffer.from(overlay(deckSlides[i], i)), top: 0, left: 0 }]);
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  }
}

async function renderContactSheet(deckSlides, imgDir, contactOut) {
  const thumbW = 480;
  const thumbH = 270;
  const gap = 28;
  const cols = 3;
  const rows = 4;
  const canvasW = cols * thumbW + (cols + 1) * gap;
  const canvasH = rows * (thumbH + 44) + (rows + 1) * gap;
  const comps = [];
  for (let i = 0; i < deckSlides.length; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gap + col * (thumbW + gap);
    const y = gap + row * (thumbH + 44 + gap);
    const thumb = await sharp(path.join(imgDir, `slide-${String(i + 1).padStart(2, "0")}.png`))
      .resize(thumbW, thumbH)
      .png()
      .toBuffer();
    const label = Buffer.from(
      `<svg width="${thumbW}" height="44" xmlns="http://www.w3.org/2000/svg">
        <rect width="${thumbW}" height="44" fill="#07111E"/>
        <text x="20" y="30" fill="#FFD000" font-family="Arial" font-size="24" font-weight="800">SLIDE ${String(i + 1).padStart(2, "0")}</text>
      </svg>`
    );
    comps.push({ input: thumb, left: x, top: y });
    comps.push({ input: label, left: x, top: y + thumbH });
  }
  await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: "#111827",
    },
  })
    .composite(comps)
    .png()
    .toFile(contactOut);
}

async function buildPptx(deckSlides, imgDir, pptxOut, opts = {}) {
  const { lang = "en-US", title = "AI Project Action Guide for Company Teams" } = opts;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: SLIDE_W, height: SLIDE_H });
  pptx.layout = "CUSTOM_WIDE";
  pptx.author = "Codex";
  pptx.company = "Internal";
  pptx.subject = "Internal guide for starting AI projects";
  pptx.title = title;
  pptx.lang = lang;
  pptx.theme = {
    headFontFace: "Tahoma",
    bodyFontFace: "Tahoma",
    lang,
  };

  for (let i = 0; i < deckSlides.length; i += 1) {
    const slide = pptx.addSlide();
    slide.background = { color: "07111E" };
    slide.addImage({
      path: path.join(imgDir, `slide-${String(i + 1).padStart(2, "0")}.png`),
      x: 0,
      y: 0,
      w: SLIDE_W,
      h: SLIDE_H,
    });
    slide.addNotes(deckSlides[i].note || "");
  }

  await pptx.writeFile({ fileName: pptxOut });
}

function writeOutline(deckSlides, outlineOut, pptxOut, imgDir, contactOut, opts = {}) {
  const {
    heading = "AI Project Action Guide — Company Internal Deck",
    audience = "พนักงาน / business teams / project teams ที่ต้องการเริ่ม AI project",
    goal = "อธิบายสิ่งที่ต้องทำก่อนและระหว่างทำ AI project ให้เข้าใจเร็วและทำตามได้",
    format = "12 slides, 16:9, image-generator background + deterministic text overlay",
  } = opts;
  fs.mkdirSync(NOTES_DIR, { recursive: true });
  const lines = [
    `# ${heading}`,
    "",
    `- Audience: ${audience}`,
    `- Goal: ${goal}`,
    `- Format: ${format}`,
    "- Source basis: AI-SLC / MDLC working materials in `/Users/nuthdanai/Desktop/AI_POLICY`",
    "",
    "## Slide Outline",
    "",
    ...deckSlides.flatMap((s, i) => [
      `### ${String(i + 1).padStart(2, "0")}. ${s.title.join(" ")}`,
      `- Role: ${s.kicker}`,
      `- Message: ${s.subtitle}`,
      `- Speaker note: ${s.note}`,
      "",
    ]),
    "## Generated Outputs",
    "",
    `- PowerPoint: \`${pptxOut}\``,
    `- Final slide images: \`${imgDir}/slide-01.png\` ... \`slide-12.png\``,
    `- Contact sheet: \`${contactOut}\``,
  ];
  fs.writeFileSync(outlineOut, lines.join("\n"));
}

async function main() {
  const variants = [
    {
      name: "Thai",
      deckSlides: slides,
      imgDir: IMG_DIR,
      pptxOut: PPTX_OUT,
      outlineOut: OUTLINE_OUT,
      contactOut: CONTACT_OUT,
      lang: "th-TH",
      title: "AI Project Action Guide for Company Teams",
      outline: {
        format: "12 slides, 16:9, Thai, image-generator background + deterministic Thai text overlay",
      },
    },
    {
      name: "English",
      deckSlides: englishSlides,
      imgDir: EN_IMG_DIR,
      pptxOut: EN_PPTX_OUT,
      outlineOut: EN_OUTLINE_OUT,
      contactOut: EN_CONTACT_OUT,
      lang: "en-US",
      title: "AI Project Action Guide for Company Teams — English",
      outline: {
        heading: "AI Project Action Guide — English Version",
        audience: "Employees, business teams, and project teams that want to start an AI project",
        goal: "Explain what teams must do before and during AI projects in a concise, action-oriented format",
        format: "12 slides, 16:9, English-only, image-generator background + deterministic text overlay",
      },
    },
    {
      name: "Blank",
      deckSlides: blankSlides,
      imgDir: BLANK_IMG_DIR,
      pptxOut: BLANK_PPTX_OUT,
      outlineOut: BLANK_OUTLINE_OUT,
      contactOut: BLANK_CONTACT_OUT,
      lang: "en-US",
      title: "AI Project Action Guide — Blank Backgrounds",
      blank: true,
      outline: {
        heading: "AI Project Action Guide — Blank Background Version",
        audience: "Editors who want to add their own text or layout",
        goal: "Provide the same 12 generated visual backgrounds without any overlay text",
        format: "12 slides, 16:9, blank background-only slides",
      },
    },
  ];

  for (const variant of variants) {
    await renderSlides(variant.deckSlides, variant.imgDir, { blank: variant.blank });
    await renderContactSheet(variant.deckSlides, variant.imgDir, variant.contactOut);
    await buildPptx(variant.deckSlides, variant.imgDir, variant.pptxOut, {
      lang: variant.lang,
      title: variant.title,
    });
    writeOutline(variant.deckSlides, variant.outlineOut, variant.pptxOut, variant.imgDir, variant.contactOut, variant.outline);
    console.log(`${variant.name} PPTX: ${variant.pptxOut}`);
    console.log(`${variant.name} contact sheet: ${variant.contactOut}`);
    console.log(`${variant.name} outline: ${variant.outlineOut}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
