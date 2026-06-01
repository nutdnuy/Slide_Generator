const fs = require("fs");
const path = require("path");

const NODE_MODULES = "/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const sharp = require(path.join(NODE_MODULES, "sharp"));
const pptxgen = require(path.join(NODE_MODULES, "pptxgenjs"));

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "claude-codex-zero-to-one-investor-workbench";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");

const W = 1920;
const H = 1080;

const C = {
  paper: "#F7F2E8",
  paper2: "#FFFAF0",
  ink: "#13213D",
  muted: "#657089",
  line: "#DCCFBD",
  card: "#FFFDF7",
  teal: "#16A4A6",
  mint: "#DDF4EF",
  green: "#2FA36B",
  paleGreen: "#E8F7EE",
  gold: "#F5B93F",
  paleGold: "#FFF5D8",
  coral: "#E15659",
  paleCoral: "#FFF0EF",
  purple: "#8D6CC4",
  palePurple: "#F1EAF9",
  blue: "#4D8FE2",
  paleBlue: "#EAF3FF",
  dark: "#101B35",
};

const slides = [
  {
    label: "HOOK",
    type: "cover",
    title: "Claude/Codex\nZero to One",
    subtitle: "Investor AI Workbench Curriculum\n1-day hands-on workshop สำหรับ non-code นักลงทุน",
    message: "จากไอเดียลงทุน 1 ตัว → workflow + dashboard ที่ใช้ต่อได้จริง",
    note: "เปิดด้วย positioning ว่า AI ไม่ได้มาแทนการตัดสินใจลงทุน แต่มาช่วยทำให้ research disciplined ขึ้น",
  },
  {
    label: "COURSE PROMISE",
    type: "flow",
    title: "คอร์สนี้ไม่ได้สอนให้ถาม AI\nเก่งขึ้นอย่างเดียว",
    subtitle: "เป้าหมายคือสร้างระบบทำงานซ้ำได้ ไม่ใช่สะสม prompt แยกชิ้น",
    flow: ["Question", "Evidence", "Thesis", "Risk", "Dashboard", "Weekly Review"],
    callout: "ผู้เรียนจบวันพร้อมไฟล์จริง + workflow จริง + mini tool ที่เปิดใน browser ได้",
    note: "ย้ำว่า output สำคัญกว่าทฤษฎี ผู้เรียนต้องกลับไปพร้อมไฟล์และ workflow ที่เปิดใช้เองได้",
  },
  {
    label: "FINAL OUTPUTS",
    type: "outputs",
    title: "สิ่งที่ผู้เรียนจะสร้างวันนี้",
    subtitle: "ทุก lab ต่อกันเป็น Investor AI Workbench 1 ชุด",
    items: [
      ["01", "Case brief", "ไอเดียลงทุน 1 ตัวที่ AI เข้าใจตรงกัน"],
      ["02", "Research map", "คำถามที่ตรวจสอบได้ ไม่ใช่ความรู้สึกลอยๆ"],
      ["03", "Evidence log", "source log + claim grading"],
      ["04", "Thesis card", "bull / bear / metric / kill criteria"],
      ["05", "Mini dashboard", "single-file HTML จาก watchlist.csv"],
    ],
    note: "ทำให้ผู้เรียนเห็นเส้นชัยตั้งแต่ต้นวัน และรู้ว่าทุก lab ต่อกันเป็นระบบเดียว",
  },
  {
    label: "GUARDRAILS",
    type: "guardrails",
    title: "กติกา: AI ช่วยคิด\nไม่ใช่คนบอกให้ซื้อขาย",
    subtitle: "ทุก insight ต้องถูกจัดประเภทก่อนนำไปใช้",
    columns: [
      ["Fact", "มาจาก source ตรวจได้", C.teal, C.mint],
      ["Interpretation", "การตีความจากหลักฐาน", C.gold, C.paleGold],
      ["Assumption", "สมมติฐานที่ต้อง verify", C.coral, C.paleCoral],
    ],
    warning: "ห้ามให้ dashboard สร้าง buy/sell recommendation อัตโนมัติ",
    note: "ปักหมุด compliance และ responsible investing ตั้งแต่ต้น ไม่ให้ dashboard กลายเป็น buy/sell signal",
  },
  {
    label: "DAY FLOW",
    type: "timeline",
    title: "แผนทั้งวัน",
    subtitle: "7 ช่วงแบบทำไปเรียนไป ตั้งแต่เลือกเคสจนถึง showcase",
    rows: [
      ["09:30", "Setup, mindset, case selection"],
      ["10:15", "Research question + Claude prompt foundation"],
      ["11:15", "Evidence workflow + source log"],
      ["13:15", "Thesis card + anti-thesis + risk"],
      ["14:15", "Codex builds mini dashboard"],
      ["15:30", "Test, improve, add one feature"],
      ["16:30", "Showcase + 7-day operating system"],
    ],
    note: "เดิน agenda ให้เห็นว่าทุกช่วงมี lab ไม่ใช่ lecture ยาว",
  },
  {
    label: "TOOL MAP",
    type: "toolmap",
    title: "Claude กับ Codex\nแบ่งงานกันชัด",
    subtitle: "ผู้เรียนไม่ต้องใช้ทุกอย่างพร้อมกัน แค่รู้ว่าโจทย์ไหนควรส่งให้ตัวไหน",
    tools: [
      ["Claude", "Think / Read / Write", "ตั้งคำถาม สรุป source เขียน thesis review risk", C.teal, C.mint],
      ["Codex", "Build / Debug / Test", "สร้าง dashboard แก้ logic เพิ่ม feature ตรวจ behavior", C.purple, C.palePurple],
    ],
    note: "ลดความสับสนว่าเมื่อไรควรใช้ tool ไหน",
  },
  {
    label: "MODULE 0",
    type: "module",
    title: "Setup & Mindset",
    subtitle: "เริ่มจากเคสลงทุน 1 ตัวและ workspace ที่จัดระเบียบได้",
    objective: "เข้าใจว่า Claude ใช้คิด/อ่าน/สรุป ส่วน Codex ใช้สร้าง/แก้/ทดสอบเครื่องมือ",
    lab: "เลือก case: หุ้น, ETF, crypto หรือ sector theme 1 ตัว",
    artifact: "case brief 1 หน้า",
    guardrail: "คอร์สนี้สอน workflow วิเคราะห์ ไม่ใช่คำแนะนำซื้อขาย",
    note: "ให้ผู้เรียนเลือกเคสง่ายพอสำหรับทำจบในวันเดียว เช่น ETF, หุ้นใหญ่, sector theme",
  },
  {
    label: "LAB 0",
    type: "template",
    title: "Case Brief 1 หน้า",
    subtitle: "brief ที่ดีทำให้ Claude และ Codex เข้าใจโจทย์เดียวกัน",
    templateTitle: "Case Brief",
    fields: ["Asset / theme", "Why now?", "Initial question", "Known sources", "Unknowns", "What not to decide today"],
    sideNote: "ถ้า brief หลวม\nทุก output หลังจากนี้จะหลวม",
    note: "ถ้า brief ไม่ชัด ทุก output หลังจากนี้จะหลวม",
  },
  {
    label: "MODULE 1",
    type: "module",
    title: "From Blank Page\nto Research Question",
    subtitle: "เปลี่ยน “อยากดูตัวนี้” เป็นคำถามลงทุนที่ตรวจสอบได้",
    objective: "บังคับให้ AI เริ่มจากคำถาม ไม่ใช่เริ่มจากข้อสรุป",
    lab: "ใช้ Claude แตก business, valuation, catalyst, risk, red flag",
    artifact: "research question map",
    guardrail: "คำถามทุกข้อควรบอก evidence ที่ต้องหา",
    note: "จุดเปลี่ยนคือเลิกถาม AI แบบกว้าง แล้วบังคับให้ตอบในกรอบ evidence",
  },
  {
    label: "LAB 1",
    type: "matrix",
    title: "Research Question Map",
    subtitle: "คำถามที่ดีต้องบอกว่าเราต้องหา evidence อะไร",
    headers: ["Category", "Question", "Evidence needed"],
    rows: [
      ["Business", "รายได้โตจากอะไร", "segment / filing"],
      ["Valuation", "แพงเพราะอะไร", "multiple / peer"],
      ["Catalyst", "อะไรจะเปลี่ยน narrative", "event / data"],
      ["Risk", "อะไรทำให้ thesis พัง", "red flag source"],
    ],
    note: "ผลลัพธ์ต้องเป็น map ที่เอาไปเก็บหลักฐานต่อได้ ไม่ใช่คำตอบสำเร็จรูป",
  },
  {
    label: "MODULE 2",
    type: "module",
    title: "Evidence First Research",
    subtitle: "ลด hallucination ด้วย source log และ claim grading",
    objective: "แยก fact, interpretation, assumption ก่อนสร้าง thesis",
    lab: "ให้ Claude อ่าน source แล้วสรุปเฉพาะ claim ที่ support ได้",
    artifact: "source log + evidence table",
    guardrail: "ทุก insight ต้องโยงกับ source หรือ mark เป็น assumption",
    note: "สอนให้ผู้เรียนไม่เอาคำตอบสวยๆ เป็นข้อสรุปทันที",
  },
  {
    label: "LAB 2",
    type: "evidence",
    title: "Source Log + Evidence Table",
    subtitle: "หนึ่ง claim ต่อหนึ่งแหล่งอ้างอิง หรือระบุว่าเป็น assumption",
    cards: [
      ["Source ID", "S1, S2, S3"],
      ["Claim", "สิ่งที่ source สนับสนุนจริง"],
      ["Grade", "High / Medium / Low"],
      ["Missing data", "อะไรยังไม่รู้"],
    ],
    note: "นี่คือหัวใจของคอร์สสำหรับนักลงทุน non-code เพราะช่วยยกระดับจาก opinion เป็น process",
  },
  {
    label: "MODULE 3",
    type: "thesis",
    title: "Build the Investor Thesis",
    subtitle: "Thesis ที่ดีต้องบอกทั้งเหตุผลที่น่าสนใจและเงื่อนไขที่ทำให้เปลี่ยนใจ",
    quadrants: [
      ["Bull case", "ทำไม idea นี้อาจถูก"],
      ["Bear case", "ทำไม idea นี้อาจผิด"],
      ["Key metric", "ตัวเลขไหนต้อง monitor"],
      ["Kill criteria", "อะไรทำให้หยุดเชื่อ thesis"],
    ],
    note: "ทำให้ผู้เรียนมีวิธีคิดฝั่งตรงข้าม และรู้ว่าอะไรจะทำให้เปลี่ยนใจ",
  },
  {
    label: "MODULE 4",
    type: "system",
    title: "Turn Workflow\ninto a System",
    subtitle: "ใช้ไฟล์ธรรมดาแทน database เพื่อให้ non-code learner แก้เองได้",
    tree: [
      "investor-ai-workbench/",
      "  watchlist.csv",
      "  source_log.md",
      "  thesis_cards/",
      "    NVDA.md",
      "    VOO.md",
      "  prompts/",
      "  investor-dashboard.html",
    ],
    note: "โครงไฟล์เป็นสะพานจาก AI chat ไปสู่ระบบทำงานจริง",
  },
  {
    label: "MODULE 5",
    type: "dashboard",
    title: "Codex Builds\nthe Mini Dashboard",
    subtitle: "single-file HTML dashboard จาก watchlist.csv ไม่ต้อง login ไม่ต้อง deploy",
    features: ["CSV upload", "risk filter", "sort by score", "search", "export notes"],
    note: "จำกัด scope ให้ชัดเพื่อให้สร้างสำเร็จใน 75 นาที",
  },
  {
    label: "LAB 5",
    type: "brief",
    title: "Codex Build Brief",
    subtitle: "คนเรียนไม่ต้องเขียน code แต่ต้องสั่งงานแบบ product owner",
    items: [
      ["Input", "watchlist.csv columns"],
      ["Output", "local HTML dashboard"],
      ["Constraints", "no API, no login, no deploy"],
      ["Behavior", "filter, sort, search, export"],
      ["Tests", "import sample, verify rows, no advice"],
    ],
    note: "ผู้เรียนไม่ต้องเขียน code แต่ต้องเรียนรู้การสั่งงานแบบ product owner",
  },
  {
    label: "MODULE 6",
    type: "review",
    title: "Review, Test, Iterate",
    subtitle: "AI-generated tool ต้องผ่าน test ก่อนเพิ่ม feature",
    checks: [
      "CSV import แสดงครบทุกแถว",
      "risk filter ทำงานถูก",
      "sort score ไม่สลับค่าผิด",
      "export notes เปิดอ่านได้",
      "ไม่มี buy/sell recommendation",
    ],
    addFeature: "หลังผ่าน test ค่อยเพิ่ม feature เล็ก เช่น filter risk level หรือ export note",
    note: "สอน mindset ว่า AI-generated tool ต้องผ่านการ review เหมือนงานจริง",
  },
  {
    label: "MODULE 7",
    type: "showcase",
    title: "Final Showcase\n& 7-Day OS",
    subtitle: "ปิดด้วย presentation 3 นาที และแผนใช้ workflow กับ watchlist 5 ตัว",
    steps: ["Question", "Evidence", "Thesis", "Risk", "Dashboard", "Next 7 days"],
    note: "ทำให้คอร์สไม่จบแค่ demo แต่กลายเป็น habit",
  },
  {
    label: "MATERIALS",
    type: "materials",
    title: "Learner Material Pack",
    subtitle: "starter kit ที่ผู้เรียนเปิดใช้ต่อได้ทันทีหลังจบ workshop",
    files: [
      "watchlist.csv",
      "source_log_template.md",
      "thesis_card_template.md",
      "claude_prompt_pack.md",
      "codex_build_brief.md",
      "final_checklist.md",
      "weekly_review_sop.md",
      "investor-dashboard.html",
    ],
    note: "บอกผู้เรียนว่า material เหล่านี้คือ starter kit ไม่ใช่เอกสารอ่านเล่น",
  },
  {
    label: "ACCEPTANCE",
    type: "acceptance",
    title: "Success Checklist",
    subtitle: "คอร์สสำเร็จเมื่อผู้เรียนอธิบาย process และเปิด dashboard ได้เอง",
    checks: [
      "สร้าง thesis card อย่างน้อย 1 ใบ",
      "อธิบาย fact / interpretation / assumption ได้",
      "เปิด dashboard ใน browser ได้",
      "import CSV แล้วเห็น score, risk, thesis, next action",
      "รู้ว่า dashboard ไม่ใช่เครื่องมือให้สัญญาณซื้อขาย",
    ],
    note: "ใช้ checklist นี้เป็น rubric สำหรับ facilitator ตอนจบวัน",
  },
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[m]));
}

function wrapText(value, max = 30) {
  const lines = [];
  String(value).split("\n").forEach((part) => {
    let line = "";
    part.split(" ").forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

function text(value, x, y, size, fill = C.ink, weight = 700, max = 30, lh = 1.18, anchor = "start") {
  const lines = wrapText(value, max);
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Sukhumvit Set, Thonburi, Arial, sans-serif" text-anchor="${anchor}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function rect(x, y, w, h, fill = C.card, stroke = C.line, r = 14, sw = 3) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function label(x, y, value, fill = C.palePurple, stroke = C.purple) {
  const w = Math.max(118, value.length * 14 + 46);
  return `<g>${rect(x, y, w, 48, fill, stroke, 18, 3)}
    <text x="${x + w / 2}" y="${y + 31}" text-anchor="middle" fill="${C.ink}" font-size="20" font-weight="900" font-family="Menlo, Consolas, monospace">${esc(value)}</text>
  </g>`;
}

function bullet(items, x, y, size = 27, gap = 50, color = C.teal, max = 42) {
  return items.map((item, i) => {
    const yy = y + i * gap;
    return `<g>
      <circle cx="${x}" cy="${yy - 7}" r="8" fill="${color}"/>
      ${text(item, x + 28, yy, size, C.ink, 700, max, 1.16)}
    </g>`;
  }).join("");
}

function base(slide, i) {
  const dots = [];
  for (let x = 70; x < W; x += 80) {
    for (let y = 82; y < H; y += 80) {
      if ((x + y * 2) % 240 === 0) dots.push(`<circle cx="${x}" cy="${y}" r="2" fill="${C.line}" opacity="0.45"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="${C.paper2}"/>
        <stop offset="1" stop-color="${C.paper}"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#13213D" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#paper)"/>
    <g>${dots.join("")}</g>
    <path d="M0 105C300 136 650 74 990 104S1540 135 1920 86" fill="none" stroke="${C.line}" stroke-width="3" opacity="0.55"/>
    <path d="M0 1000C330 948 640 1034 1040 986S1548 940 1920 984" fill="none" stroke="${C.line}" stroke-width="3" opacity="0.48"/>
    ${label(92, 66, slide.label)}
    <text x="1762" y="102" fill="${C.muted}" font-size="24" font-weight="700" font-family="Menlo, Consolas, monospace">${String(i + 1).padStart(2, "0")} / ${slides.length}</text>
    <text x="92" y="1018" fill="${C.muted}" font-size="22" font-weight="650" font-family="Sukhumvit Set, Thonburi, Arial">Claude/Codex Zero to One · Investor AI Workbench</text>`;
}

function closeSvg() {
  return "</svg>";
}

function titleBlock(slide, y = 182, max = 28) {
  return `${text(slide.title, 92, y, 66, C.ink, 950, max, 1.1)}
    ${text(slide.subtitle, 98, y + 180, 30, C.muted, 650, 54, 1.22)}`;
}

function renderCover(slide, i) {
  return `${base(slide, i)}
    ${text(slide.title, 92, 190, 86, C.ink, 950, 18, 1.04)}
    ${text(slide.subtitle, 100, 410, 32, C.muted, 700, 45, 1.25)}
    ${label(100, 540, "Claude", C.mint, C.teal)}
    ${label(270, 540, "Codex", C.palePurple, C.purple)}
    ${label(430, 540, "Non-code investors", C.paleGold, C.gold)}
    ${rect(1100, 190, 620, 630, C.card, C.line, 20, 3)}
    ${["Idea", "Research", "Thesis", "Dashboard"].map((v, idx) => {
      const y = 250 + idx * 130;
      const fill = [C.mint, C.paleBlue, C.paleGold, C.palePurple][idx];
      const stroke = [C.teal, C.blue, C.gold, C.purple][idx];
      return `<g filter="url(#shadow)">${rect(1190, y, 440, 82, fill, stroke, 14, 3)}
        ${text(v, 1410, y + 53, 33, C.ink, 900, 18, 1.1, "middle")}
      </g>${idx < 3 ? `<path d="M1410 ${y + 92} L1410 ${y + 122}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` : ""}`;
    }).join("")}
    ${text(slide.message, 100, 720, 34, C.ink, 850, 44, 1.18)}
  ${closeSvg()}`;
}

function renderFlow(slide, i) {
  const startX = 140;
  const y = 590;
  return `${base(slide, i)}
    ${titleBlock(slide, 180, 27)}
    ${slide.flow.map((item, idx) => {
      const x = startX + idx * 285;
      const fill = [C.mint, C.paleBlue, C.paleGold, C.paleCoral, C.palePurple, C.paleGreen][idx];
      const stroke = [C.teal, C.blue, C.gold, C.coral, C.purple, C.green][idx];
      return `<g>
        ${rect(x, y, 210, 94, fill, stroke, 14, 3)}
        ${text(item, x + 105, y + 58, 25, C.ink, 900, 13, 1.1, "middle")}
        ${idx < slide.flow.length - 1 ? `<path d="M${x + 222} ${y + 47} L${x + 270} ${y + 47}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
        <path d="M${x + 270} ${y + 47} l-14 -10 m14 10 l-14 10" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>` : ""}
      </g>`;
    }).join("")}
    ${rect(232, 785, 1456, 104, C.dark, C.dark, 16, 0)}
    ${text(slide.callout, 960, 850, 33, C.paper2, 850, 62, 1.15, "middle")}
  ${closeSvg()}`;
}

function renderOutputs(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 178, 28)}
    ${slide.items.map((item, idx) => {
      const x = 116 + (idx % 3) * 570;
      const y = idx < 3 ? 505 : 735;
      const fills = [C.mint, C.paleBlue, C.paleGold, C.palePurple, C.paleGreen];
      const strokes = [C.teal, C.blue, C.gold, C.purple, C.green];
      return `<g filter="url(#shadow)">
        ${rect(x, y, idx < 3 ? 500 : 785, 155, fills[idx], strokes[idx], 14, 3)}
        ${text(item[0], x + 34, y + 55, 31, strokes[idx], 950, 6)}
        ${text(item[1], x + 96, y + 55, 30, C.ink, 950, 24)}
        ${text(item[2], x + 96, y + 101, 22, C.muted, 700, idx < 3 ? 33 : 52, 1.18)}
      </g>`;
    }).join("")}
  ${closeSvg()}`;
}

function renderGuardrails(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 175, 27)}
    ${slide.columns.map((col, idx) => {
      const x = 150 + idx * 550;
      return `<g filter="url(#shadow)">
        ${rect(x, 505, 470, 225, col[3], col[2], 16, 4)}
        ${text(col[0], x + 235, 590, 43, C.ink, 950, 16, 1.1, "middle")}
        ${text(col[1], x + 235, 650, 27, C.muted, 750, 23, 1.18, "middle")}
      </g>`;
    }).join("")}
    ${rect(205, 810, 1510, 90, C.paleCoral, C.coral, 14, 4)}
    ${text(slide.warning, 960, 866, 32, C.ink, 900, 62, 1.1, "middle")}
  ${closeSvg()}`;
}

function renderTimeline(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 175, 26)}
    <path d="M320 480 L320 900" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
    ${slide.rows.map((row, idx) => {
      const y = 480 + idx * 70;
      return `<g>
        <circle cx="320" cy="${y}" r="18" fill="${idx % 2 ? C.gold : C.teal}" stroke="${C.ink}" stroke-width="4"/>
        ${text(row[0], 188, y + 9, 27, C.ink, 900, 10)}
        ${rect(370, y - 34, 1160, 58, idx % 2 ? C.paleGold : C.mint, idx % 2 ? C.gold : C.teal, 12, 2)}
        ${text(row[1], 405, y + 4, 25, C.ink, 800, 55)}
      </g>`;
    }).join("")}
  ${closeSvg()}`;
}

function renderToolmap(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 24)}
    ${slide.tools.map((tool, idx) => {
      const x = idx === 0 ? 150 : 1020;
      return `<g filter="url(#shadow)">
        ${rect(x, 500, 750, 280, tool[5], tool[4], 18, 4)}
        ${text(tool[0], x + 54, 590, 56, C.ink, 950, 16)}
        ${text(tool[1], x + 58, 650, 31, tool[4], 950, 22)}
        ${text(tool[2], x + 58, 710, 27, C.muted, 750, 35, 1.18)}
      </g>`;
    }).join("")}
    <path d="M905 640 C950 608 982 608 1025 640" stroke="${C.ink}" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${text("Research OS", 960, 842, 34, C.ink, 950, 18, 1.1, "middle")}
  ${closeSvg()}`;
}

function renderModule(slide, i) {
  const cards = [
    ["Objective", slide.objective, C.mint, C.teal],
    ["Lab", slide.lab, C.paleGold, C.gold],
    ["Artifact", slide.artifact, C.palePurple, C.purple],
    ["Guardrail", slide.guardrail, C.paleCoral, C.coral],
  ];
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 23)}
    ${cards.map((card, idx) => {
      const x = 150 + (idx % 2) * 820;
      const y = idx < 2 ? 505 : 720;
      return `<g filter="url(#shadow)">
        ${rect(x, y, 725, 155, card[2], card[3], 14, 3)}
        ${text(card[0], x + 42, y + 51, 26, card[3], 950, 16)}
        ${text(card[1], x + 42, y + 96, 25, C.ink, 750, 43, 1.16)}
      </g>`;
    }).join("")}
  ${closeSvg()}`;
}

function renderTemplate(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 28)}
    ${rect(160, 500, 1050, 395, C.card, C.line, 14, 3)}
    ${text(slide.templateTitle, 205, 570, 41, C.ink, 950, 28)}
    ${slide.fields.map((field, idx) => {
      const y = 625 + idx * 42;
      return `<g>${rect(205, y, 900, 30, idx % 2 ? C.paper : C.paper2, C.line, 6, 1)}
        ${text(field, 228, y + 22, 20, C.muted, 750, 42)}
      </g>`;
    }).join("")}
    ${rect(1290, 565, 420, 250, C.dark, C.dark, 18, 0)}
    ${text(slide.sideNote, 1500, 665, 35, C.paper2, 900, 18, 1.22, "middle")}
  ${closeSvg()}`;
}

function renderMatrix(slide, i) {
  const colW = [320, 570, 570];
  const startX = 150;
  const startY = 505;
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 27)}
    ${rect(startX, startY, 1460, 395, C.card, C.line, 12, 3)}
    ${slide.headers.map((header, idx) => {
      const x = startX + colW.slice(0, idx).reduce((a, b) => a + b, 0);
      return `<g>${rect(x, startY, colW[idx], 64, idx === 0 ? C.mint : C.paleBlue, idx === 0 ? C.teal : C.blue, 0, 2)}
        ${text(header, x + 24, startY + 42, 23, C.ink, 950, 18)}
      </g>`;
    }).join("")}
    ${slide.rows.map((row, r) => row.map((cell, c) => {
      const x = startX + colW.slice(0, c).reduce((a, b) => a + b, 0);
      const y = startY + 64 + r * 82;
      return `<g>${rect(x, y, colW[c], 82, r % 2 ? C.paper : C.paper2, C.line, 0, 1)}
        ${text(cell, x + 24, y + 48, 22, c === 0 ? C.ink : C.muted, c === 0 ? 900 : 700, c === 0 ? 14 : 27)}
      </g>`;
    }).join("")).join("")}
  ${closeSvg()}`;
}

function renderEvidence(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 26)}
    ${slide.cards.map((card, idx) => {
      const x = 185 + idx * 405;
      const colors = [[C.mint, C.teal], [C.paleBlue, C.blue], [C.paleGold, C.gold], [C.paleCoral, C.coral]][idx];
      return `<g filter="url(#shadow)">
        ${rect(x, 540, 335, 245, colors[0], colors[1], 16, 4)}
        ${text(card[0], x + 167, 635, 34, C.ink, 950, 16, 1.1, "middle")}
        ${text(card[1], x + 167, 700, 25, C.muted, 750, 17, 1.18, "middle")}
      </g>`;
    }).join("")}
    ${text("Rule: claim without source = assumption", 960, 875, 34, C.coral, 950, 44, 1.12, "middle")}
  ${closeSvg()}`;
}

function renderThesis(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 26)}
    ${slide.quadrants.map((q, idx) => {
      const x = 175 + (idx % 2) * 800;
      const y = idx < 2 ? 500 : 710;
      const fills = [C.mint, C.paleCoral, C.paleGold, C.palePurple];
      const strokes = [C.teal, C.coral, C.gold, C.purple];
      return `<g filter="url(#shadow)">
        ${rect(x, y, 720, 155, fills[idx], strokes[idx], 14, 3)}
        ${text(q[0], x + 42, y + 56, 31, C.ink, 950, 18)}
        ${text(q[1], x + 42, y + 104, 25, C.muted, 750, 36)}
      </g>`;
    }).join("")}
  ${closeSvg()}`;
}

function renderSystem(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 25)}
    ${rect(180, 500, 760, 390, C.dark, C.dark, 18, 0)}
    ${slide.tree.map((line, idx) => text(line, 235, 565 + idx * 43, 27, idx === 0 ? C.gold : C.paper2, 750, 40, 1.1)).join("")}
    ${rect(1030, 535, 660, 305, C.card, C.line, 18, 3)}
    ${text("Why plain files?", 1090, 610, 42, C.ink, 950, 24)}
    ${bullet(["เปิดดูเองได้", "แก้ใน spreadsheet ได้", "ย้ายเครื่องง่าย", "Codex อ่านและปรับต่อได้"], 1115, 690, 27, 48, C.green, 28)}
  ${closeSvg()}`;
}

function renderDashboard(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 24)}
    ${rect(160, 490, 1140, 410, C.card, C.line, 18, 3)}
    ${rect(205, 535, 1050, 64, C.dark, C.dark, 10, 0)}
    ${text("Investor Dashboard", 245, 577, 28, C.paper2, 900, 26)}
    ${["Symbol", "Score", "Risk", "Thesis", "Next action"].map((h, idx) => text(h, 235 + idx * 195, 655, 22, C.muted, 900, 12)).join("")}
    ${["VOO  78  Medium  Core exposure  Review valuation", "NVDA 72  High    AI leader      Check margins", "TLT  64  High    Duration hedge Review rate path"].map((row, idx) => {
      const y = 690 + idx * 58;
      return `<g>${rect(215, y, 1010, 42, idx % 2 ? C.paper : C.paper2, C.line, 6, 1)}
        ${text(row, 245, y + 29, 21, C.ink, 750, 60)}
      </g>`;
    }).join("")}
    ${rect(1370, 535, 360, 305, C.mint, C.teal, 18, 4)}
    ${text("Scope", 1550, 605, 39, C.ink, 950, 14, 1.1, "middle")}
    ${bullet(slide.features, 1425, 675, 23, 43, C.teal, 20)}
  ${closeSvg()}`;
}

function renderBrief(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 26)}
    ${slide.items.map((item, idx) => {
      const x = 130 + idx * 350;
      const fill = [C.mint, C.paleBlue, C.paleGold, C.palePurple, C.paleCoral][idx];
      const stroke = [C.teal, C.blue, C.gold, C.purple, C.coral][idx];
      return `<g filter="url(#shadow)">
        ${rect(x, 535, 300, 260, fill, stroke, 16, 4)}
        ${text(item[0], x + 150, 625, 32, C.ink, 950, 12, 1.1, "middle")}
        ${text(item[1], x + 150, 690, 23, C.muted, 750, 16, 1.18, "middle")}
      </g>`;
    }).join("")}
  ${closeSvg()}`;
}

function renderReview(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 27)}
    ${rect(170, 515, 1000, 330, C.card, C.line, 16, 3)}
    ${bullet(slide.checks, 230, 590, 27, 48, C.green, 44)}
    ${rect(1240, 570, 470, 220, C.paleGold, C.gold, 18, 4)}
    ${text("Add one feature", 1475, 650, 34, C.ink, 950, 18, 1.1, "middle")}
    ${text(slide.addFeature, 1475, 720, 24, C.muted, 750, 23, 1.18, "middle")}
  ${closeSvg()}`;
}

function renderShowcase(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 26)}
    ${slide.steps.map((step, idx) => {
      const x = 135 + idx * 285;
      const y = 585 + (idx % 2) * 115;
      const fill = idx % 2 ? C.paleGold : C.mint;
      const stroke = idx % 2 ? C.gold : C.teal;
      return `<g>
        ${rect(x, y, 230, 78, fill, stroke, 14, 3)}
        ${text(step, x + 115, y + 50, 25, C.ink, 900, 13, 1.1, "middle")}
      </g>`;
    }).join("")}
    ${rect(290, 838, 1340, 74, C.dark, C.dark, 14, 0)}
    ${text("Showcase: question, evidence, thesis, risk, dashboard, next 7 days", 960, 884, 25, C.paper2, 850, 90, 1.1, "middle")}
  ${closeSvg()}`;
}

function renderMaterials(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 27)}
    ${rect(205, 500, 1510, 390, C.card, C.line, 16, 3)}
    ${slide.files.map((file, idx) => {
      const x = 270 + (idx % 2) * 690;
      const y = 570 + Math.floor(idx / 2) * 72;
      return `<g>
        ${rect(x, y - 30, 580, 46, idx % 2 ? C.paleBlue : C.mint, idx % 2 ? C.blue : C.teal, 10, 2)}
        ${text(file, x + 25, y, 23, C.ink, 850, 32)}
      </g>`;
    }).join("")}
  ${closeSvg()}`;
}

function renderAcceptance(slide, i) {
  return `${base(slide, i)}
    ${titleBlock(slide, 170, 25)}
    ${rect(220, 500, 1480, 390, C.card, C.line, 16, 3)}
    ${bullet(slide.checks, 300, 590, 28, 58, C.teal, 60)}
  ${closeSvg()}`;
}

function renderSlide(slide, i) {
  switch (slide.type) {
    case "cover": return renderCover(slide, i);
    case "flow": return renderFlow(slide, i);
    case "outputs": return renderOutputs(slide, i);
    case "guardrails": return renderGuardrails(slide, i);
    case "timeline": return renderTimeline(slide, i);
    case "toolmap": return renderToolmap(slide, i);
    case "module": return renderModule(slide, i);
    case "template": return renderTemplate(slide, i);
    case "matrix": return renderMatrix(slide, i);
    case "evidence": return renderEvidence(slide, i);
    case "thesis": return renderThesis(slide, i);
    case "system": return renderSystem(slide, i);
    case "dashboard": return renderDashboard(slide, i);
    case "brief": return renderBrief(slide, i);
    case "review": return renderReview(slide, i);
    case "showcase": return renderShowcase(slide, i);
    case "materials": return renderMaterials(slide, i);
    case "acceptance": return renderAcceptance(slide, i);
    default: return `${base(slide, i)}${titleBlock(slide)}${closeSvg()}`;
  }
}

async function createContactSheet(pngPaths) {
  const thumbW = 480;
  const thumbH = 270;
  const gap = 24;
  const cols = 4;
  const rows = Math.ceil(pngPaths.length / cols);
  const sheetW = cols * thumbW + (cols + 1) * gap;
  const sheetH = rows * thumbH + (rows + 1) * gap;
  const composites = [];

  for (let i = 0; i < pngPaths.length; i += 1) {
    const input = await sharp(pngPaths[i]).resize(thumbW, thumbH).png().toBuffer();
    composites.push({
      input,
      left: gap + (i % cols) * (thumbW + gap),
      top: gap + Math.floor(i / cols) * (thumbH + gap),
    });
  }

  const sheetPath = path.join(IMG_DIR, "contact-sheet.png");
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: C.paper,
    },
  }).composite(composites).png().toFile(sheetPath);
  return sheetPath;
}

async function main() {
  [IMG_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Weekend Vibe Code";
  pptx.subject = "Claude/Codex Zero to One — Investor AI Workbench Curriculum";
  pptx.title = "Claude/Codex Zero to One — Investor AI Workbench";
  pptx.lang = "th-TH";
  pptx.theme = {
    headFontFace: "Sukhumvit Set",
    bodyFontFace: "Sukhumvit Set",
    lang: "th-TH",
  };

  const notes = [
    "# Claude/Codex Zero to One — Investor AI Workbench Slide Notes",
    "",
    "Generated deck: 16:9 PowerPoint with rendered slide images and speaker notes.",
    "",
  ];

  const pngPaths = [];
  for (let i = 0; i < slides.length; i += 1) {
    const n = String(i + 1).padStart(2, "0");
    const svg = renderSlide(slides[i], i);
    const svgPath = path.join(IMG_DIR, `slide-${n}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${n}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    pngPaths.push(pngPath);

    const pptSlide = pptx.addSlide();
    pptSlide.background = { color: "F7F2E8" };
    pptSlide.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });
    pptSlide.addNotes(slides[i].note);

    notes.push(`## Slide ${n}: ${slides[i].title.replace(/\n/g, " ")}`);
    notes.push(`- Label: ${slides[i].label}`);
    notes.push(`- Message: ${slides[i].subtitle}`);
    notes.push(`- Speaker note: ${slides[i].note}`);
    notes.push("");
  }

  const contactSheet = await createContactSheet(pngPaths);
  notes.push(`Contact sheet: ${contactSheet}`);
  fs.writeFileSync(path.join(NOTES_DIR, `${OUT_NAME}-slide-notes.md`), notes.join("\n"));
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${OUT_NAME}.pptx`) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
