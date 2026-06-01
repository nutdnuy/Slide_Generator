const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "ai-workbench-insurance-course-proposal-v2";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");
const W = 1920;
const H = 1080;

const C = {
  bg: "#F8F0E6",
  bg2: "#FFF8EC",
  ink: "#111E3A",
  muted: "#657089",
  coral: "#F45D63",
  teal: "#16A6A8",
  yellow: "#F3B63F",
  lavender: "#C8B6DD",
  green: "#32A56F",
  blue: "#4D8FE2",
  navy: "#101B35",
  line: "#D8CBBE",
  card: "#FFFDF7",
  paleTeal: "#EAF8F5",
  paleCoral: "#FFF2F1",
  paleYellow: "#FFF6DC",
  paleBlue: "#EEF6FF",
  paleLav: "#F3EDF8",
};

const slides = [
  {
    tag: "COURSE DECISION",
    title: "คอร์สที่ควรทำ:\nAI Agent Workbench\nสำหรับตัวแทนประกัน",
    subtitle: "2-Day Onsite Flagship สำหรับ agency / ทีมขาย 15-25 คน\nใช้ Claude, Claude Code, Claude Cowork, Codex และ ChatGPT",
    visual: "cover",
  },
  {
    tag: "SHORT ANSWER",
    title: "คำตอบสั้นสำหรับ pitch",
    subtitle: "ขายเป็นคอร์ส onsite ที่ไม่ได้สอน AI แบบลอยๆ แต่ทำให้ทีมขายมี workflow และ mini tool ใช้งานจริง",
    cards: [
      ["คอร์สอะไร", "AI Agent Workbench for Insurance Sales"],
      ["Onsite กี่วัน", "แนะนำ 2 วัน เป็นตัวหลัก"],
      ["ใช้ tools อะไร", "Claude + Claude Code + Cowork, Codex, ChatGPT"],
      ["ราคาเท่าไร", "120,000-160,000 บาท / ทีม"],
    ],
    visual: "answer",
  },
  {
    tag: "WHY 2 DAYS",
    title: "ทำไมตัวหลักควรเป็น\nOnsite 2 วัน",
    subtitle: "1 วันทำให้ใช้ AI เป็น แต่ 2 วันทำให้เริ่มสร้างระบบและ asset ของทีมได้จริง",
    compare: [
      ["1 วัน", "เหมาะกับ public class", "ได้ prompt, content, FAQ", "ยังไม่พอสำหรับ mini tool"],
      ["2 วัน", "เหมาะกับ onsite flagship", "ได้ workflow + mini tool", "ขาย agency ได้คุ้มกว่า"],
      ["3 วัน", "เหมาะกับ implementation", "ทำ SOP + rollout ทีม", "ขายเป็น premium package"],
    ],
    visual: "days",
  },
  {
    tag: "DAY 1",
    title: "Day 1:\nAI Sales Foundation",
    subtitle: "เป้าหมาย: ให้ตัวแทนใช้ AI กับ content, FAQ, script, policy explainer และ proposal ได้ทันที",
    agenda: [
      "AI สำหรับตัวแทนประกันในปี 2026",
      "Responsible AI: PDPA, ข้อมูลลูกค้า, human review",
      "Prompt Framework สำหรับงานขายประกัน",
      "Claude สำหรับ content, FAQ, objection, roleplay",
      "ChatGPT สำหรับ research, วิเคราะห์ไฟล์, สร้างสื่อ",
      "ทำ Policy Explainer และ Proposal Narrative",
    ],
    output: ["Prompt Library", "Content Pack 30 วัน", "FAQ / Objection Bank", "Policy Explainer", "Sales Script"],
    visual: "day1",
  },
  {
    tag: "DAY 2",
    title: "Day 2:\nBuild Your AI Sales Workbench",
    subtitle: "เป้าหมาย: ให้ผู้เรียนสร้าง workflow หรือ mini sales tool 1 ชิ้นจากโจทย์งานขายจริง",
    agenda: [
      "ออกแบบ Personal AI Workflow",
      "Claude Projects: เก็บ context สินค้าและสไตล์การขาย",
      "Claude Code: สร้าง form, calculator, dashboard",
      "Codex: build, debug, review logic, ปรับ prototype",
      "Claude Cowork: จัดการไฟล์หลายชุดและทำ playbook",
      "Showcase + feedback + SOP ใช้งานหลังจบ",
    ],
    output: ["Mini Sales Tool", "AI Workflow", "Team SOP", "Review Checklist", "30-Day Adoption Plan"],
    visual: "day2",
  },
  {
    tag: "TOOLS",
    title: "Tools ที่ใช้ และใช้ทำอะไร",
    subtitle: "วางบทบาท tool ให้ชัด ผู้เรียนไม่สับสนว่าโจทย์ไหนควรใช้ตัวไหน",
    tools: [
      ["Claude", "คิดและเขียน", "content, FAQ, script, proposal, roleplay"],
      ["ChatGPT", "วิเคราะห์และสร้างสื่อ", "research, file/image analysis, Custom GPT"],
      ["Claude Code", "สร้างเครื่องมือเล็ก", "form, calculator, dashboard, landing page"],
      ["Codex", "build / debug / review", "แก้ logic, ตรวจ code, deploy prototype"],
      ["Claude Cowork", "จัดการงานจากไฟล์", "สรุปหลายเอกสาร, playbook, checklist"],
    ],
    visual: "tools",
  },
  {
    tag: "BUILD SESSION",
    title: "Build Session:\nเลือก 1 ชิ้นแล้วทำให้เสร็จ",
    subtitle: "หัวใจของ onsite คือผู้เรียนไม่ได้กลับไปแค่ไอเดีย แต่กลับไปพร้อม asset หรือ tool ที่ทดลองใช้ได้",
    builds: [
      ["Needs Analysis Form", "ถามโจทย์ลูกค้า แล้วสรุป need เบื้องต้น"],
      ["Budget Calculator", "ใส่งบ อายุ เป้าหมาย แล้วจัด scenario"],
      ["Policy Comparison Tool", "เทียบแผน A/B/C ให้อ่านง่าย"],
      ["Objection Finder", "เลือกคำคัดค้าน แล้วได้ script ตอบ"],
      ["Personal Landing Page", "หน้าแนะนำตัวแทนและบริการ"],
      ["Follow-up Tracker", "dashboard ว่าวันนี้ควรตามใครก่อน"],
    ],
    visual: "build",
  },
  {
    tag: "PRICING",
    title: "Package และราคาคอร์ส",
    subtitle: "มี entry product เพื่อเปิดตลาด และมี onsite flagship เป็นตัวทำรายได้หลัก",
    packages: [
      ["Public 1-Day", "2,900 / 3,900", "ตัวแทนรายคน\nทดลองตลาด\nสร้าง demand"],
      ["Onsite 2-Day Flagship", "120,000-160,000", "ทีม 15-25 คน\nworkshop + build session\nsupport 30 วัน"],
      ["Agency Sprint 3-Day", "220,000-280,000", "ทีมที่ต้องการ rollout\nSOP + implementation\ncustom workflow"],
    ],
    visual: "pricing",
  },
  {
    tag: "CLOSE",
    title: "ข้อเสนอที่ควรเอาไปขาย",
    subtitle: "“เราไม่ได้สอนให้ทีมขายใช้ AI เป็นอย่างเดียว แต่ช่วยให้ทีมมีระบบช่วยขายที่ใช้ซ้ำได้จริง”",
    points: [
      "ขายตัวหลักเป็น 2-Day Onsite Flagship",
      "ใช้โจทย์จริงของ agency เป็น workshop material",
      "ให้ผู้เรียนเลือก build ตามบทบาทของตัวเอง",
      "ปิดด้วย 30-day adoption plan สำหรับหัวหน้าทีม",
    ],
    visual: "close",
  },
];

function esc(v) {
  return String(v).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function wrap(v, max = 30) {
  const lines = [];
  String(v).split("\n").forEach((part) => {
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

function text(v, x, y, size, fill = C.ink, weight = 700, max = 30, lh = 1.18, anchor = "start") {
  const lines = wrap(v, max);
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Sukhumvit Set, Thonburi, Arial, sans-serif">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function roughRect(x, y, w, h, fill = C.card, stroke = C.ink, r = 22, sw = 4) {
  return `<g>
    <rect x="${x + 4}" y="${y + 5}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="0.88"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="0.78"/>
  </g>`;
}

function pill(x, y, label, fill = C.paleLav, stroke = C.lavender, txt = C.ink) {
  const w = Math.max(138, label.length * 14 + 52);
  return `<g>${roughRect(x, y, w, 52, fill, stroke, 18, 3)}<text x="${x + w / 2}" y="${y + 34}" text-anchor="middle" fill="${txt}" font-size="22" font-weight="900" font-family="Sukhumvit Set, Thonburi, Arial">${esc(label)}</text></g>`;
}

function fixedChip(x, y, w, label, fill = C.paleLav, stroke = C.lavender, txt = C.ink) {
  return `<g>${roughRect(x, y, w, 48, fill, stroke, 16, 3)}<text x="${x + w / 2}" y="${y + 31}" text-anchor="middle" fill="${txt}" font-size="20" font-weight="900" font-family="Sukhumvit Set, Thonburi, Arial">${esc(label)}</text></g>`;
}

function base(slide, i) {
  const dots = [];
  for (let x = 54; x < W; x += 64) {
    for (let y = 70; y < H; y += 64) {
      if ((x * 3 + y) % 256 === 0) dots.push(`<circle cx="${x}" cy="${y}" r="2" fill="${C.line}" opacity="0.38"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${C.bg2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#paper)"/>
    <g>${dots.join("")}</g>
    <path d="M0 94C350 130 650 72 980 98S1560 126 1920 84" fill="none" stroke="${C.line}" stroke-width="3" opacity="0.58"/>
    <path d="M0 996C360 948 650 1040 1040 985S1550 938 1920 982" fill="none" stroke="${C.line}" stroke-width="3" opacity="0.52"/>
    ${pill(92, 68, slide.tag)}
    <text x="1760" y="104" fill="${C.muted}" font-size="25" font-weight="600" font-family="Menlo, Consolas, monospace">${String(i + 1).padStart(2, "0")} / 09</text>
    <text x="92" y="1018" fill="${C.muted}" font-size="23" font-weight="650" font-family="Sukhumvit Set, Thonburi, Arial">Weekend Vibe Code · AI Workbench Insurance Course Proposal</text>`;
}

function close() {
  return "</svg>";
}

function title(slide, x = 92, y = 185, max = 24, size = 64) {
  return text(slide.title, x, y, size, C.ink, 950, max, 1.12);
}

function subtitle(slide, x = 98, y = 400, max = 54, size = 30) {
  return text(slide.subtitle, x, y, size, C.muted, 550, max, 1.22);
}

function robot(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-72" y="-58" width="144" height="116" rx="34" fill="#FFFFFF" stroke="${C.ink}" stroke-width="6"/>
    <rect x="-45" y="-24" width="90" height="52" rx="24" fill="${C.navy}"/>
    <circle cx="-20" cy="0" r="8" fill="${C.teal}"/><circle cx="21" cy="0" r="8" fill="${C.teal}"/>
    <path d="M-18 25C-5 38 10 38 23 25" stroke="${C.teal}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M0 -58V-94" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="-103" r="11" fill="${C.yellow}" stroke="${C.ink}" stroke-width="5"/>
    <text x="0" y="105" text-anchor="middle" font-size="34" fill="${C.teal}" font-weight="900" font-family="Inter, Arial">AI</text>
  </g>`;
}

function person(x, y, s = 1, shirt = C.yellow) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <circle cx="0" cy="-82" r="54" fill="#FFD8B8" stroke="${C.ink}" stroke-width="6"/>
    <path d="M-52 -92C-42 -150 34 -154 56 -96C28 -126 -12 -132 -52 -92Z" fill="${C.ink}"/>
    <circle cx="-18" cy="-80" r="6" fill="${C.ink}"/><circle cx="22" cy="-80" r="6" fill="${C.ink}"/>
    <path d="M-18 18C-6 31 10 31 23 18" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-78 62C-50 -22 54 -22 80 62L100 180H-100Z" fill="${shirt}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
  </g>`;
}

function laptop(x, y, s = 1, label = "</>") {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-112" y="-75" width="224" height="134" rx="14" fill="${C.navy}" stroke="${C.ink}" stroke-width="6"/>
    <text x="0" y="6" text-anchor="middle" fill="${C.teal}" font-size="34" font-weight="900" font-family="Menlo, Consolas, monospace">${esc(label)}</text>
    <path d="M-145 74H145L112 104H-112Z" fill="#DCEBED" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
  </g>`;
}

function check(x, y, label, color = C.teal, max = 35, size = 28) {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="0" r="18" fill="${color}" opacity="0.18" stroke="${color}" stroke-width="3"/>
    <path d="M-8 0L-1 8L12 -10" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${text(label, 36, 9, size, C.ink, 700, max, 1.15)}
  </g>`;
}

function renderCover(slide) {
  let s = title(slide, 92, 190, 24, 66);
  s += subtitle(slide, 98, 470, 50, 31);
  s += pill(98, 650, "Core: 2-Day Onsite", C.paleCoral, C.coral, C.coral);
  s += pill(98, 722, "Team: 15-25 คน", C.paleTeal, C.teal, C.teal);
  s += pill(98, 794, "Output: Workflow + Mini Tool", C.paleYellow, C.yellow, C.ink);
  s += person(1240, 520, 1.12, C.yellow);
  s += robot(1530, 410, 1.0);
  s += laptop(1235, 760, 0.9, "AI");
  s += laptop(1530, 750, 0.82, "</>");
  s += `<path d="M1035 890H1748" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`;
  return s;
}

function renderAnswer(slide) {
  let s = title(slide, 92, 190, 26, 70);
  s += subtitle(slide, 98, 320, 56, 31);
  slide.cards.forEach((card, i) => {
    const x = 115 + (i % 2) * 865;
    const y = 520 + Math.floor(i / 2) * 210;
    const color = [C.teal, C.coral, C.yellow, C.blue][i];
    const bg = [C.paleTeal, C.paleCoral, C.paleYellow, C.paleBlue][i];
    s += roughRect(x, y, 790, 154, bg, color, 24);
    s += text(card[0], x + 40, y + 55, 31, color, 900, 20);
    s += text(card[1], x + 40, y + 106, 35, C.ink, 900, 28);
  });
  return s;
}

function renderDays(slide) {
  let s = title(slide, 92, 185, 24, 64);
  s += subtitle(slide, 98, 380, 56, 30);
  slide.compare.forEach((col, i) => {
    const x = 112 + i * 592;
    const color = [C.teal, C.coral, C.yellow][i];
    const bg = [C.paleTeal, C.paleCoral, C.paleYellow][i];
    s += roughRect(x, 560, 520, 320, bg, color, 26);
    s += text(col[0], x + 38, 632, 45, color, 950, 14);
    s += check(x + 52, 705, col[1], color, 26, 25);
    s += check(x + 52, 770, col[2], color, 26, 25);
    s += check(x + 52, 835, col[3], color, 26, 25);
  });
  return s;
}

function renderDay(slide, mode) {
  let s = title(slide, 92, 178, 25, 63);
  s += subtitle(slide, 98, 360, 58, 29);
  const color = mode === "day1" ? C.teal : C.coral;
  slide.agenda.forEach((item, i) => {
    const x = i < 3 ? 122 : 950;
    const y = 535 + (i % 3) * 92;
    s += check(x, y, item, [C.teal, C.coral, C.yellow, C.green, C.blue, C.lavender][i], 38, 27);
  });
  s += roughRect(116, 850, 1690, 105, "#FFFFFF", color, 24);
  s += text("Output:", 150, 914, 31, color, 950, 10);
  const xs = [285, 563, 851, 1179, 1467];
  const ws = [260, 270, 310, 270, 260];
  slide.output.forEach((out, i) => {
    s += fixedChip(xs[i], 878, ws[i], out, [C.paleTeal, C.paleCoral, C.paleYellow, C.paleBlue, C.paleLav][i], [C.teal, C.coral, C.yellow, C.blue, C.lavender][i]);
  });
  return s;
}

function renderTools(slide) {
  let s = title(slide, 92, 185, 26, 66);
  s += subtitle(slide, 98, 350, 56, 30);
  slide.tools.forEach((tool, i) => {
    const x = 115 + (i % 3) * 590;
    const y = 525 + Math.floor(i / 3) * 220;
    const color = [C.teal, C.coral, C.yellow, C.green, C.blue][i];
    const bg = [C.paleTeal, C.paleCoral, C.paleYellow, "#ECF8F1", C.paleBlue][i];
    s += roughRect(x, y, i === 4 ? 560 : 520, 155, bg, color, 23);
    s += `<circle cx="${x + 58}" cy="${y + 70}" r="31" fill="${color}" opacity="0.18" stroke="${color}" stroke-width="4"/>
      <text x="${x + 58}" y="${y + 81}" text-anchor="middle" fill="${color}" font-size="30" font-weight="900" font-family="Menlo, Consolas">${i + 1}</text>`;
    s += text(tool[0], x + 108, y + 52, 32, C.ink, 950, 20);
    s += text(tool[1], x + 108, y + 91, 25, color, 900, 22);
    s += text(tool[2], x + 108, y + 128, 21, C.muted, 650, 36);
  });
  return s;
}

function renderBuild(slide) {
  let s = title(slide, 92, 185, 25, 62);
  s += subtitle(slide, 98, 365, 58, 29);
  slide.builds.forEach((b, i) => {
    const x = 110 + (i % 3) * 592;
    const y = 535 + Math.floor(i / 3) * 190;
    const color = [C.coral, C.teal, C.yellow, C.green, C.blue, C.lavender][i];
    s += roughRect(x, y, 522, 135, C.card, color, 20);
    s += text(b[0], x + 32, y + 52, 28, C.ink, 950, 22);
    s += text(b[1], x + 32, y + 93, 23, C.muted, 650, 34);
  });
  s += `<text x="116" y="940" fill="${C.coral}" font-size="30" font-weight="950" font-family="Sukhumvit Set, Thonburi, Arial">Key: ผู้เรียนเลือก 1 ชิ้น แล้วทำให้พอ demo ได้ในห้อง</text>`;
  return s;
}

function renderPricing(slide) {
  let s = title(slide, 92, 185, 25, 64);
  s += subtitle(slide, 98, 350, 56, 30);
  slide.packages.forEach((pkg, i) => {
    const x = 116 + i * 592;
    const color = [C.teal, C.coral, C.yellow][i];
    const bg = [C.paleTeal, C.paleCoral, C.paleYellow][i];
    s += roughRect(x, 545, 520, 330, bg, color, 27);
    s += text(pkg[0], x + 38, 615, 33, C.ink, 950, 20);
    s += text(pkg[1], x + 38, 700, 43, color, 950, 18);
    s += text(pkg[2], x + 38, 785, 26, C.muted, 700, 26);
  });
  s += `<text x="122" y="943" fill="${C.muted}" font-size="24" font-weight="650" font-family="Sukhumvit Set, Thonburi, Arial">ไม่รวม VAT, venue, travel, tool subscription และ custom integration นอก scope</text>`;
  return s;
}

function renderClose(slide) {
  let s = title(slide, 92, 185, 25, 66);
  s += roughRect(98, 360, 1125, 150, "#FFFFFF", C.coral, 28);
  s += text(slide.subtitle, 145, 425, 34, C.ink, 900, 44, 1.22);
  slide.points.forEach((p, i) => {
    s += check(135, 610 + i * 78, p, [C.teal, C.coral, C.yellow, C.green][i], 48, 30);
  });
  s += roughRect(1350, 520, 390, 360, C.card, C.ink, 28);
  s += text("Next step", 1424, 600, 40, C.coral, 950, 12);
  s += text("คุย requirement\n30 นาที แล้วเลือก\npackage สำหรับ\nทีมแรก", 1400, 690, 31, C.ink, 800, 18, 1.18);
  s += robot(1630, 755, 0.62);
  return s;
}

function render(slide, i) {
  let s = base(slide, i);
  if (slide.visual === "cover") s += renderCover(slide);
  if (slide.visual === "answer") s += renderAnswer(slide);
  if (slide.visual === "days") s += renderDays(slide);
  if (slide.visual === "day1") s += renderDay(slide, "day1");
  if (slide.visual === "day2") s += renderDay(slide, "day2");
  if (slide.visual === "tools") s += renderTools(slide);
  if (slide.visual === "build") s += renderBuild(slide);
  if (slide.visual === "pricing") s += renderPricing(slide);
  if (slide.visual === "close") s += renderClose(slide);
  return s + close();
}

async function contactSheet(pngs) {
  const tw = 480;
  const th = 270;
  const gap = 24;
  const cols = 3;
  const rows = Math.ceil(pngs.length / cols);
  const composites = [];
  for (let i = 0; i < pngs.length; i++) {
    composites.push({
      input: await sharp(pngs[i]).resize(tw, th).png().toBuffer(),
      left: gap + (i % cols) * (tw + gap),
      top: gap + Math.floor(i / cols) * (th + gap),
    });
  }
  const out = path.join(IMG_DIR, "contact-sheet.png");
  await sharp({
    create: { width: cols * tw + (cols + 1) * gap, height: rows * th + (rows + 1) * gap, channels: 4, background: C.bg },
  })
    .composite(composites)
    .png()
    .toFile(out);
  return out;
}

async function main() {
  [IMG_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Weekend Vibe Code";
  pptx.subject = "AI Workbench Insurance Course Proposal";
  pptx.title = "AI Workbench Insurance Course Proposal";
  pptx.lang = "th-TH";
  pptx.theme = { headFontFace: "Sukhumvit Set", bodyFontFace: "Sukhumvit Set", lang: "th-TH" };

  const notes = [
    "# AI Workbench Insurance Course Proposal V2",
    "",
    "Objective: answer course structure, onsite duration, topics, tools, and pricing clearly.",
    "Visual system: hand-drawn workshop style based on reference image.",
    "",
  ];

  const pngs = [];
  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const svg = render(slides[i], i);
    const svgPath = path.join(IMG_DIR, `slide-${n}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${n}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    pngs.push(pngPath);

    const page = pptx.addSlide();
    page.background = { color: "F8F0E6" };
    page.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });
    page.addNotes(`${slides[i].tag}: ${slides[i].subtitle || slides[i].title}`);
    notes.push(`## Slide ${n}: ${slides[i].title.replace(/\n/g, " ")}`);
    if (slides[i].subtitle) notes.push(`- ${slides[i].subtitle.replace(/\n/g, " ")}`);
    notes.push("");
  }
  const sheet = await contactSheet(pngs);
  notes.push(`Contact sheet: ${sheet}`);
  fs.writeFileSync(path.join(NOTES_DIR, `${OUT_NAME}-outline.md`), notes.join("\n"));
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${OUT_NAME}.pptx`) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
