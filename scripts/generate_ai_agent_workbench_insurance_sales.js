const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "ai-agent-workbench-insurance-sales";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");

const W = 1920;
const H = 1080;

const C = {
  paper: "#F7F0E7",
  paper2: "#FFF8ED",
  ink: "#13213D",
  muted: "#5F6780",
  coral: "#F45D63",
  teal: "#16A4A6",
  mint: "#B9DED9",
  yellow: "#F5B93F",
  lavender: "#C9B8DA",
  green: "#2FA36B",
  blue: "#4E8DDE",
  navy: "#101D39",
  softLine: "#D8CCC0",
  card: "#FFFDF7",
};

const slides = [
  {
    label: "HOOK",
    title: "AI Agent Workbench\nสำหรับตัวแทนประกัน",
    subtitle: "สร้างผู้ช่วย AI ช่วยขายใน 2 วัน ด้วย Claude, ChatGPT และ Codex — ไม่ต้องเขียนโค้ดเอง",
    chips: ["Claude", "Claude Code", "Claude Cowork", "Codex", "ChatGPT"],
    visual: "cover",
    note: "เปิดด้วยภาพว่า AI ไม่ใช่เรื่องไกลตัว แต่เป็นโต๊ะทำงานใหม่ของตัวแทนประกัน",
  },
  {
    label: "PAIN",
    title: "ทีมขายไม่ได้ติดที่ขายไม่เป็น\nแต่ติดที่งานซ้ำกินเวลา",
    subtitle: "ตัวแทนต้องคิด content, เตรียมคำตอบ, อ่านเอกสาร, ทำ proposal, follow-up และจำรายละเอียดลูกค้าพร้อมกัน",
    bullets: ["ทำ content ไม่ทัน", "ตอบคำถามลูกค้าไม่สม่ำเสมอ", "สรุปกรมธรรม์ใช้เวลานาน", "มือใหม่ไม่มี script ตั้งต้น", "หัวหน้าทีม coach ทุกคนไม่ทัน"],
    visual: "pain",
    note: "ทำให้ agency leader เห็นว่าปัญหาเป็นระบบ ไม่ใช่ความขยันของคนใดคนหนึ่ง",
  },
  {
    label: "WHY NOW",
    title: "ปี 2026 AI ไม่ได้มีไว้แค่ถามตอบ\nแต่มันเริ่มทำงานแทนงานย่อยได้",
    subtitle: "จาก chatbot ที่ช่วยคิด → workbench ที่ช่วยเขียน วิเคราะห์ สร้างไฟล์ และ build เครื่องมือเล็กๆ ให้ทีมขาย",
    columns: [
      ["เมื่อใช้แบบ Chatbot", "ถามทีละข้อ", "ได้คำตอบแล้วต้องจัดต่อเอง", "ความรู้กระจัดกระจาย"],
      ["เมื่อใช้แบบ Workbench", "มี project และ context", "สร้าง asset / file / tool ได้", "ใช้ซ้ำเป็นระบบทีม"],
    ],
    visual: "compare",
    note: "Positioning สำคัญ: ขาย workflow และ output ไม่ใช่ขาย prompt อย่างเดียว",
  },
  {
    label: "PROMISE",
    title: "จบ 2 วัน ได้ระบบผู้ช่วย AI\nที่ใช้กับงานขายจริงได้ทันที",
    subtitle: "ทุกคนกลับไปพร้อม prompt library, content workflow, FAQ bank, policy explainer และ mini sales tool 1 ชิ้น",
    steps: ["ตั้งค่า AI Workspace", "สร้างคลัง prompt", "ทำ asset ขาย", "build mini tool", "วาง SOP ใช้งาน"],
    visual: "promise",
    note: "พูดคำว่า hands-on ชัดๆ และย้ำว่าทุกช่วงมี template ให้ ไม่เริ่มจากหน้าว่าง",
  },
  {
    label: "TOOL MAP",
    title: "5 เครื่องมือหลัก\nแต่ละตัวมีหน้าที่ชัดเจน",
    subtitle: "ไม่ต้องใช้ทุกอย่างพร้อมกัน เรียนให้รู้ว่าโจทย์แบบไหนควรใช้ tool ตัวไหน",
    tools: [
      ["Claude", "Think & Write", "content, FAQ, script, proposal"],
      ["Claude Code", "Build small tools", "calculator, form, dashboard"],
      ["Claude Cowork", "Delegate file work", "จัดไฟล์, สรุปหลายเอกสาร, ทำ playbook"],
      ["Codex", "Build & review code", "แก้ tool, review logic, deploy prototype"],
      ["ChatGPT", "Analyze & Create", "research, file/image analysis, Custom GPT"],
    ],
    visual: "toolmap",
    note: "Slide นี้ใช้เป็นแกนเล่า deck ทั้งชุด",
  },
  {
    label: "CLAUDE",
    title: "Claude: ผู้ช่วยคิดและเขียน\nสำหรับงานขายประกัน",
    subtitle: "เหมาะกับงานภาษาไทย งานอธิบายเรื่องซับซ้อน และการซ้อมบทสนทนากับลูกค้า",
    bullets: ["เขียนโพสต์ประกันแบบภาษาคน", "สรุปกรมธรรม์เป็น policy explainer", "ทำ FAQ และ objection handling", "roleplay ลูกค้า 5 บุคลิก", "เขียน proposal narrative เฉพาะกลุ่มลูกค้า"],
    visual: "claude",
    note: "ย้ำว่า Claude ไม่ใช่คนอนุมัติข้อมูลกรมธรรม์ ต้อง human review ก่อนส่งลูกค้า",
  },
  {
    label: "CHATGPT",
    title: "ChatGPT: ผู้ช่วยวิเคราะห์\nและสร้างสื่อขายหลายรูปแบบ",
    subtitle: "เหมาะกับ research, วิเคราะห์ไฟล์/ภาพ/ตาราง, ทำ project แยกตามสินค้า และสร้างสื่อประกอบ pitch",
    bullets: ["Research trend และ pain point ลูกค้า", "วิเคราะห์ PDF, ตาราง, รูป และ slide", "ทำภาพประกอบ content / mockup", "สร้าง Custom GPT สำหรับ product แต่ละกลุ่ม", "สรุป meeting note เป็น next action"],
    visual: "chatgpt",
    note: "ย้ำเรื่องการอ้างอิงแหล่งข้อมูลและไม่ให้ AI สรุปเงื่อนไขประกันเกินเอกสารจริง",
  },
  {
    label: "CODEX + CODE",
    title: "Claude Code + Codex:\nสร้าง mini sales tool",
    subtitle: "ตัวแทนไม่ต้องเป็น programmer แต่สามารถสั่ง AI ช่วยสร้างเครื่องมือเล็กๆ ที่ใช้ซ้ำในงานขาย",
    cards: [
      ["Needs Analysis Form", "ถามข้อมูลลูกค้า แล้วสรุป need เบื้องต้น"],
      ["Budget Calculator", "จัด scenario ตามงบ อายุ และเป้าหมาย"],
      ["Policy Comparison Tool", "เทียบแผน A/B/C ให้เข้าใจง่าย"],
      ["Objection Finder", "เลือกคำคัดค้าน แล้วได้ script ตอบ"],
      ["Personal Landing Page", "หน้าแนะนำตัวแทนและบริการ"],
      ["Follow-up Tracker", "dashboard วันนี้ควรตามใครก่อน"],
    ],
    visual: "builders",
    note: "Slide นี้คือ differentiation หลักของคอร์ส เทียบกับคอร์ส AI ทั่วไปที่จบแค่ prompt",
  },
  {
    label: "COWORK",
    title: "Claude Cowork:\nสั่ง AI จัดการงานจากไฟล์หลายชุด",
    subtitle: "ใช้กับงานที่ต้องเปิดหลายไฟล์ เปรียบเทียบข้อมูล สรุป note หรือเตรียมเอกสารขายเป็นชุด",
    bullets: ["รวมเอกสารสินค้าเป็น playbook เดียว", "สรุป spreadsheet lead เป็นกลุ่มลูกค้า", "ทำ checklist ก่อนคุยลูกค้า", "เตรียม proposal draft จาก note + product doc", "จัด folder เอกสารขายให้ทีมใช้ร่วมกัน"],
    visual: "cowork",
    note: "ต้องบอก limitation และสิทธิ์เข้าถึงไฟล์ชัดเจน ก่อนให้ผู้เรียนทดลอง",
  },
  {
    label: "AGENDA",
    title: "โครงสร้าง Onsite 2 วัน\nใช้งานเป็น → สร้างระบบเอง",
    subtitle: "ออกแบบสำหรับตัวแทนมือใหม่, top agent และหัวหน้าทีม agency ที่ต้องการมาตรฐานการทำงานร่วมกัน",
    agenda: [
      ["Day 1", "AI Sales Foundation", "Claude + ChatGPT, prompt framework, content, FAQ, policy explainer, proposal"],
      ["Day 2", "Build Your AI Workbench", "Claude Code, Codex, Cowork, mini tool build session, showcase, SOP"],
    ],
    visual: "agenda",
    note: "ถ้าเป็น public 1 วัน ให้ตัด Day 2 เหลือ demo mini tool + template",
  },
  {
    label: "PACKAGE",
    title: "Package และราคาแนะนำ\nสำหรับ Public และ Onsite",
    subtitle: "วางราคาให้มี entry product และ flagship onsite สำหรับ agency",
    packages: [
      ["Public 1-Day", "2,900 / 3,900", "เหมาะกับตัวแทนรายคน ทดลองตลาด และสร้าง demand"],
      ["Onsite 2-Day Flagship", "120,000-160,000", "เหมาะกับทีม 15-25 คน พร้อม build session"],
      ["Agency Sprint 3-Day", "220,000-280,000", "เหมาะกับทีมที่ต้องการ implementation และ SOP จริง"],
    ],
    visual: "pricing",
    note: "ราคาไม่รวม VAT, venue, travel, tool subscription และงาน custom integration",
  },
  {
    label: "CTA",
    title: "เริ่มจากทีมแรก\nแล้ววัดผลใน 30 วัน",
    subtitle: "เลือก product จริงของทีมมาเป็นโจทย์ workshop แล้วให้ผู้เรียนสร้าง asset และ mini tool จากโจทย์นั้น",
    steps: ["คุย requirement 30 นาที", "เลือก package และจำนวนผู้เรียน", "เตรียมเอกสารสินค้า / FAQ / ตัวอย่าง lead", "จัด onsite workshop", "follow-up adoption 30 วัน"],
    visual: "cta",
    note: "ปิดด้วย next step ที่ชัด ไม่ใช่แค่ให้แสกน QR",
  },
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function wrapText(value, max = 32) {
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

function text(value, x, y, size, fill = C.ink, weight = 600, max = 30, lh = 1.18, family = "Sukhumvit Set, Thonburi, Arial, sans-serif", anchor = "start") {
  const lines = wrapText(value, max);
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${family}" text-anchor="${anchor}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function pill(x, y, value, fill = C.mint, stroke = C.teal, txt = C.ink) {
  const w = Math.max(120, value.length * 14 + 52);
  return `<g><rect x="${x}" y="${y}" width="${w}" height="48" rx="17" fill="${fill}" stroke="${stroke}" stroke-width="3"/><text x="${x + w / 2}" y="${y + 32}" text-anchor="middle" font-size="22" fill="${txt}" font-weight="800" font-family="Sukhumvit Set, Thonburi, Arial">${esc(value)}</text></g>`;
}

function roughRect(x, y, w, h, fill = C.card, stroke = C.ink, r = 22, dash = "") {
  return `<g>
    <rect x="${x + 3}" y="${y + 4}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" opacity="0.92"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${stroke}" stroke-width="3" stroke-dasharray="${dash}" opacity="0.72"/>
  </g>`;
}

function checkBullet(x, y, value, color = C.teal, size = 30, max = 36) {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="0" r="17" fill="${color}" opacity="0.18" stroke="${color}" stroke-width="3"/>
    <path d="M-8 0L-1 8L11 -9" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${text(value, 34, 10, size, C.ink, 650, max)}
  </g>`;
}

function base(slide, i) {
  const dots = [];
  for (let x = 58; x < W; x += 58) {
    for (let y = 68; y < H; y += 58) {
      if ((x + y) % 174 === 0) dots.push(`<circle cx="${x}" cy="${y}" r="1.8" fill="${C.softLine}" opacity="0.42"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#13213D" flood-opacity="0.14"/></filter>
      <linearGradient id="warm" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${C.paper2}"/><stop offset="1" stop-color="${C.paper}"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#warm)"/>
    <g>${dots.join("")}</g>
    <path d="M0 92C290 118 520 74 850 98S1450 120 1920 78" stroke="${C.softLine}" stroke-width="3" fill="none" opacity="0.55"/>
    <path d="M0 994C360 948 640 1040 1000 982S1540 936 1920 984" stroke="${C.softLine}" stroke-width="3" fill="none" opacity="0.48"/>
    ${pill(92, 70, slide.label, "#E9DDF1", C.lavender)}
    <text x="1768" y="104" font-size="25" fill="${C.muted}" font-family="Menlo, Consolas, monospace">${String(i + 1).padStart(2, "0")} / 12</text>
    <text x="92" y="1018" font-size="24" fill="${C.muted}" font-weight="600" font-family="Sukhumvit Set, Thonburi, Arial">Weekend Vibe Code · AI Agent Workbench for Insurance Sales</text>`;
}

function close() {
  return `</svg>`;
}

function robot(x, y, scale = 1, accent = C.teal) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="-70" y="-58" width="140" height="116" rx="34" fill="#FFFFFF" stroke="${C.ink}" stroke-width="6"/>
    <rect x="-44" y="-24" width="88" height="50" rx="22" fill="${C.navy}"/>
    <circle cx="-20" cy="0" r="8" fill="${accent}"/><circle cx="20" cy="0" r="8" fill="${accent}"/>
    <path d="M-18 26C-5 38 9 38 22 26" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M0 -58V-94" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="-102" r="11" fill="${C.yellow}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M-70 12H-104" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><path d="M70 12H104" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
    <text x="0" y="101" text-anchor="middle" font-size="34" fill="${accent}" font-weight="900" font-family="Inter, Arial">AI</text>
  </g>`;
}

function person(x, y, scale = 1, shirt = C.yellow, mood = "happy") {
  const mouth = mood === "sad" ? "M-18 22C-5 10 8 10 22 22" : "M-18 18C-6 32 10 32 22 18";
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <circle cx="0" cy="-84" r="54" fill="#FFD8B8" stroke="${C.ink}" stroke-width="6"/>
    <path d="M-52 -92C-42 -150 32 -156 55 -98C34 -124 -8 -132 -52 -92Z" fill="${C.ink}"/>
    <circle cx="-18" cy="-82" r="6" fill="${C.ink}"/><circle cx="22" cy="-82" r="6" fill="${C.ink}"/>
    <path d="${mouth}" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-74 56C-50 -20 52 -22 76 56L96 180H-96Z" fill="${shirt}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-38 36C-12 58 15 58 42 36" stroke="${C.ink}" stroke-width="5" fill="none"/>
  </g>`;
}

function laptop(x, y, scale = 1, label = "</>") {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="-110" y="-72" width="220" height="132" rx="14" fill="${C.navy}" stroke="${C.ink}" stroke-width="6"/>
    <text x="0" y="6" text-anchor="middle" font-size="34" fill="${C.teal}" font-weight="900" font-family="Menlo, Consolas, monospace">${esc(label)}</text>
    <path d="M-142 72H142L112 102H-112Z" fill="#D8E7EA" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
  </g>`;
}

function speech(x, y, value, color = C.card, max = 18, w = 250) {
  return `<g>
    <path d="M${x} ${y}h${w}a24 24 0 0 1 24 24v86a24 24 0 0 1-24 24h-72l-42 38l10-38h-120a24 24 0 0 1-24-24v-86a24 24 0 0 1 24-24Z" fill="${color}" stroke="${C.ink}" stroke-width="5"/>
    ${text(value, x + 24, y + 48, 28, C.ink, 750, max)}
  </g>`;
}

function slideTitle(slide, x = 92, y = 210, max = 25) {
  return text(slide.title, x, y, 67, C.ink, 900, max, 1.12);
}

function slideSubtitle(slide, x = 98, y = 405, max = 48) {
  return text(slide.subtitle, x, y, 31, C.muted, 500, max, 1.22);
}

function visualCover(slide) {
  let s = slideTitle(slide, 92, 210, 23);
  s += slideSubtitle(slide, 98, 430, 52);
  slide.chips.forEach((chip, idx) => {
    const x = 98 + (idx % 3) * 245;
    const y = 570 + Math.floor(idx / 3) * 66;
    const colors = [C.mint, "#F8CCCC", "#F6E1A6", "#DDD1EB", "#CDE4FF"];
    s += pill(x, y, chip, colors[idx], [C.teal, C.coral, C.yellow, C.lavender, C.blue][idx]);
  });
  s += person(1215, 520, 1.18, C.yellow);
  s += robot(1540, 455, 1.05, C.teal);
  s += laptop(1215, 760, 1.0, "AI");
  s += laptop(1540, 745, 0.82, "</>");
  s += speech(1210, 190, "วันนี้ทีมขายมีผู้ช่วยของตัวเอง", "#FFFFFF", 17, 390);
  s += `<path d="M1060 890H1765" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
    <text x="98" y="890" font-size="36" fill="${C.coral}" font-weight="900" font-family="Sukhumvit Set, Thonburi, Arial">2-Day Onsite Workshop</text>
    <text x="98" y="945" font-size="28" fill="${C.ink}" font-weight="700" font-family="Sukhumvit Set, Thonburi, Arial">สำหรับตัวแทนประกัน / Top agent / Agency leader</text>`;
  return s;
}

function visualPain(slide) {
  let s = slideTitle(slide, 92, 205, 26);
  s += slideSubtitle(slide, 98, 430, 52);
  slide.bullets.forEach((b, i) => {
    const x = 104 + (i % 2) * 450;
    const y = 590 + Math.floor(i / 2) * 92;
    s += checkBullet(x, y, b, [C.coral, C.teal, C.yellow, C.lavender, C.green][i], 28, 23);
  });
  s += person(1370, 690, 1.0, C.lavender, "sad");
  s += `<g transform="translate(1370,682)"><path d="M-310 -230C-370 -300 -275 -365 -205 -305" fill="none" stroke="${C.coral}" stroke-width="5" stroke-dasharray="12 14"/><path d="M-75 -325C-50 -430 90 -412 105 -322" fill="none" stroke="${C.teal}" stroke-width="5" stroke-dasharray="12 14"/><path d="M215 -205C345 -210 355 -80 252 -62" fill="none" stroke="${C.yellow}" stroke-width="5" stroke-dasharray="12 14"/></g>`;
  s += speech(1040, 235, "ลูกค้าถามเงื่อนไข", "#FFFFFF", 13, 300);
  s += speech(1465, 245, "ต้องทำโพสต์วันนี้", "#FFFFFF", 13, 300);
  s += speech(1515, 610, "ยังไม่ได้ทำ proposal", "#FFFFFF", 13, 310);
  return s;
}

function visualCompare(slide) {
  let s = slideTitle(slide, 92, 205, 27);
  s += slideSubtitle(slide, 98, 430, 50);
  slide.columns.forEach((col, idx) => {
    const x = idx === 0 ? 118 : 1012;
    const color = idx === 0 ? C.coral : C.teal;
    s += roughRect(x, 585, 790, 310, idx === 0 ? "#FFF5F2" : "#EFF9F7", color, 24);
    s += text(col[0], x + 42, 650, 40, color, 900, 23);
    col.slice(1).forEach((item, j) => {
      s += checkBullet(x + 56, 718 + j * 66, item, color, 28, 28);
    });
  });
  s += `<path d="M914 735C946 710 976 710 1008 735" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M986 710L1010 735L986 760" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}

function visualPromise(slide) {
  let s = slideTitle(slide, 92, 205, 25);
  s += slideSubtitle(slide, 98, 430, 50);
  slide.steps.forEach((step, idx) => {
    const x = 148 + idx * 350;
    const y = 740;
    s += `<g>
      ${idx < slide.steps.length - 1 ? `<path d="M${x + 82} ${y}H${x + 275}" stroke="${C.softLine}" stroke-width="7" stroke-linecap="round"/>` : ""}
      <circle cx="${x}" cy="${y}" r="78" fill="${[C.mint, "#F8CCCC", "#F6E1A6", "#DDD1EB", "#CDE4FF"][idx]}" stroke="${C.ink}" stroke-width="6"/>
      <text x="${x}" y="${y + 13}" text-anchor="middle" font-size="43" fill="${C.ink}" font-weight="900" font-family="Menlo, Consolas, monospace">${idx + 1}</text>
      ${text(step, x - 120, y + 128, 27, C.ink, 750, 15, 1.16, "Sukhumvit Set, Thonburi, Arial", "middle")}
    </g>`;
  });
  s += `${robot(1560, 350, 0.82, C.green)}${laptop(1260, 375, 0.65, "tool")}`;
  return s;
}

function visualToolMap(slide) {
  let s = slideTitle(slide, 92, 185, 22);
  s += slideSubtitle(slide, 98, 355, 52);
  slide.tools.forEach((tool, idx) => {
    const x = 110 + (idx % 3) * 590;
    const y = 535 + Math.floor(idx / 3) * 235;
    const color = [C.teal, C.coral, C.yellow, C.green, C.blue][idx];
    s += roughRect(x, y, idx === 4 ? 560 : 520, 170, C.card, color, 22);
    s += `<circle cx="${x + 64}" cy="${y + 70}" r="33" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="4"/>
      <text x="${x + 64}" y="${y + 82}" text-anchor="middle" font-size="30" fill="${color}" font-weight="900" font-family="Menlo, Consolas, monospace">${idx + 1}</text>`;
    s += text(tool[0], x + 118, y + 58, 34, C.ink, 900, 18);
    s += text(tool[1], x + 118, y + 98, 25, color, 850, 22);
    s += text(tool[2], x + 118, y + 134, 22, C.muted, 600, 35);
  });
  return s;
}

function visualUseCase(slide, iconKind) {
  let s = slideTitle(slide, 92, 190, 25);
  s += slideSubtitle(slide, 98, 375, 52);
  slide.bullets.forEach((b, i) => {
    const x = 116 + (i % 2) * 780;
    const y = 585 + Math.floor(i / 2) * 92;
    s += checkBullet(x, y, b, [C.teal, C.coral, C.yellow, C.green, C.blue][i], 29, 34);
  });
  if (iconKind === "claude") {
    s += `${roughRect(1325, 155, 410, 255, "#FFF6E8", C.yellow, 28)}${text("Think", 1390, 250, 52, C.coral, 900, 9)}${text("& Write", 1390, 315, 45, C.teal, 900, 9)}${person(1570, 285, 0.5, C.yellow)}`;
  } else {
    s += `${roughRect(1325, 145, 410, 265, "#EEF7FF", C.blue, 28)}${text("Analyze", 1380, 240, 47, C.blue, 900, 10)}${text("& Create", 1380, 305, 44, C.teal, 900, 10)}${laptop(1570, 300, 0.52, "GPT")}`;
  }
  return s;
}

function visualBuilders(slide) {
  let s = slideTitle(slide, 92, 185, 24);
  s += slideSubtitle(slide, 98, 360, 54);
  slide.cards.forEach((card, idx) => {
    const x = 105 + (idx % 3) * 595;
    const y = 535 + Math.floor(idx / 3) * 220;
    const color = [C.coral, C.teal, C.yellow, C.green, C.blue, C.lavender][idx];
    s += roughRect(x, y, 535, 160, C.card, color, 18);
    s += text(card[0], x + 32, y + 54, 29, C.ink, 900, 22);
    s += text(card[1], x + 32, y + 104, 24, C.muted, 600, 33);
  });
  s += `<text x="112" y="960" font-size="28" fill="${C.coral}" font-weight="900" font-family="Sukhumvit Set, Thonburi, Arial">Key message: ไม่ได้เรียนเพื่อเป็น programmer แต่เรียนเพื่อสั่ง AI สร้างเครื่องมือช่วยขาย</text>`;
  return s;
}

function visualCowork(slide) {
  let s = slideTitle(slide, 92, 185, 24);
  s += slideSubtitle(slide, 98, 370, 52);
  slide.bullets.forEach((b, i) => {
    s += checkBullet(130, 570 + i * 75, b, [C.teal, C.coral, C.yellow, C.green, C.blue][i], 29, 48);
  });
  s += roughRect(1265, 515, 475, 315, "#FFFFFF", C.ink, 28, "12 12");
  s += `<text x="1305" y="580" font-size="32" fill="${C.ink}" font-weight="900" font-family="Sukhumvit Set, Thonburi">Folder งานขาย</text>`;
  ["product.pdf", "faq.docx", "lead.xlsx", "notes.md"].forEach((f, i) => {
    s += `<g transform="translate(1310,${625 + i * 48})"><rect width="210" height="34" rx="8" fill="${[C.mint, "#F8CCCC", "#F6E1A6", "#DDD1EB"][i]}" stroke="${C.ink}" stroke-width="2"/><text x="18" y="24" font-size="20" fill="${C.ink}" font-family="Menlo, Consolas">${f}</text></g>`;
  });
  s += robot(1640, 702, 0.6, C.teal);
  s += `<path d="M1110 690H1248" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/><path d="M1224 664L1254 690L1224 716" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}

function visualAgenda(slide) {
  let s = slideTitle(slide, 92, 185, 24);
  s += slideSubtitle(slide, 98, 365, 52);
  slide.agenda.forEach((row, idx) => {
    const x = idx === 0 ? 130 : 1010;
    const color = idx === 0 ? C.teal : C.coral;
    s += roughRect(x, 575, 760, 320, idx === 0 ? "#EFF9F7" : "#FFF5F2", color, 28);
    s += `<text x="${x + 46}" y="655" font-size="45" fill="${color}" font-weight="900" font-family="Inter, Arial">${row[0]}</text>`;
    s += text(row[1], x + 46, 725, 35, C.ink, 900, 23);
    s += text(row[2], x + 46, 795, 28, C.muted, 600, 38);
  });
  s += `<path d="M914 740C946 715 976 715 1008 740" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M986 715L1010 740L986 765" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s;
}

function visualPricing(slide) {
  let s = slideTitle(slide, 92, 185, 24);
  s += slideSubtitle(slide, 98, 365, 52);
  slide.packages.forEach((pkg, idx) => {
    const x = 118 + idx * 590;
    const color = [C.teal, C.coral, C.yellow][idx];
    s += roughRect(x, 560, 520, 300, C.card, color, 28);
    s += text(pkg[0], x + 36, 625, 34, C.ink, 900, 19);
    s += text(pkg[1], x + 36, 700, 42, color, 900, 18);
    s += text(pkg[2], x + 36, 782, 25, C.muted, 650, 31);
  });
  s += `<text x="124" y="942" font-size="24" fill="${C.muted}" font-weight="600" font-family="Sukhumvit Set, Thonburi, Arial">หมายเหตุ: ราคาไม่รวม VAT, venue, travel, tool subscription และงาน custom integration</text>`;
  return s;
}

function visualCta(slide) {
  let s = slideTitle(slide, 92, 185, 20);
  s += slideSubtitle(slide, 98, 355, 52);
  slide.steps.forEach((step, idx) => {
    const y = 540 + idx * 76;
    s += `<g>
      <circle cx="145" cy="${y}" r="30" fill="${idx === 0 ? C.coral : C.teal}" opacity="0.22" stroke="${idx === 0 ? C.coral : C.teal}" stroke-width="4"/>
      <text x="145" y="${y + 10}" text-anchor="middle" font-size="27" fill="${idx === 0 ? C.coral : C.teal}" font-weight="900" font-family="Menlo, Consolas">${idx + 1}</text>
      ${text(step, 205, y + 10, 30, C.ink, 750, 44)}
    </g>`;
  });
  s += roughRect(1285, 500, 420, 420, "#FFFFFF", C.ink, 30);
  s += `<text x="1495" y="590" text-anchor="middle" font-size="32" fill="${C.ink}" font-weight="900" font-family="Sukhumvit Set, Thonburi">QR / Contact</text>`;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if ((r + c) % 2 === 0 || (r < 2 && c < 2) || (r > 4 && c > 4) || (r < 2 && c > 4)) {
        s += `<rect x="${1380 + c * 30}" y="${635 + r * 30}" width="24" height="24" fill="${C.ink}" rx="3"/>`;
      }
    }
  }
  s += `<text x="1495" y="895" text-anchor="middle" font-size="25" fill="${C.muted}" font-weight="700" font-family="Sukhumvit Set, Thonburi">ใส่ QR จริงตรงนี้</text>`;
  return s;
}

function renderSlide(slide, i) {
  let s = base(slide, i);
  if (slide.visual === "cover") s += visualCover(slide);
  if (slide.visual === "pain") s += visualPain(slide);
  if (slide.visual === "compare") s += visualCompare(slide);
  if (slide.visual === "promise") s += visualPromise(slide);
  if (slide.visual === "toolmap") s += visualToolMap(slide);
  if (slide.visual === "claude") s += visualUseCase(slide, "claude");
  if (slide.visual === "chatgpt") s += visualUseCase(slide, "chatgpt");
  if (slide.visual === "builders") s += visualBuilders(slide);
  if (slide.visual === "cowork") s += visualCowork(slide);
  if (slide.visual === "agenda") s += visualAgenda(slide);
  if (slide.visual === "pricing") s += visualPricing(slide);
  if (slide.visual === "cta") s += visualCta(slide);
  return s + close();
}

async function createContactSheet(pngPaths) {
  const thumbW = 480;
  const thumbH = 270;
  const gap = 24;
  const cols = 3;
  const rows = Math.ceil(pngPaths.length / cols);
  const sheetW = cols * thumbW + (cols + 1) * gap;
  const sheetH = rows * thumbH + (rows + 1) * gap;
  const composites = [];
  for (let i = 0; i < pngPaths.length; i++) {
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
  })
    .composite(composites)
    .png()
    .toFile(sheetPath);
  return sheetPath;
}

async function main() {
  [IMG_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Weekend Vibe Code";
  pptx.subject = "AI Agent Workbench for Insurance Sales";
  pptx.title = "AI Agent Workbench for Insurance Sales";
  pptx.lang = "th-TH";
  pptx.theme = {
    headFontFace: "Sukhumvit Set",
    bodyFontFace: "Sukhumvit Set",
    lang: "th-TH",
  };

  const notes = [
    "# AI Agent Workbench for Insurance Sales — Slide Outline",
    "",
    "Format: 16:9 PowerPoint, hand-drawn workshop visual system",
    "Primary audience: agency leader / insurance sales team",
    "Objective: sales pitch for onsite workshop",
    "",
  ];

  const pngPaths = [];
  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const svg = renderSlide(slides[i], i);
    const svgPath = path.join(IMG_DIR, `slide-${n}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${n}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    pngPaths.push(pngPath);

    const slide = pptx.addSlide();
    slide.background = { color: "F7F0E7" };
    slide.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });
    slide.addNotes(slides[i].note);

    notes.push(`## Slide ${n}: ${slides[i].title.replace(/\n/g, " ")}`);
    notes.push(`- Label: ${slides[i].label}`);
    notes.push(`- Message: ${slides[i].subtitle}`);
    notes.push(`- Speaker note: ${slides[i].note}`);
    notes.push("");
  }

  const contactSheetPath = await createContactSheet(pngPaths);
  notes.push(`Contact sheet: ${contactSheetPath}`);
  fs.writeFileSync(path.join(NOTES_DIR, `${OUT_NAME}-outline.md`), notes.join("\n"));
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${OUT_NAME}.pptx`) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
