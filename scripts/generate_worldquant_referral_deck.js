const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const IMG_DIR = path.join(ROOT, "assets", "images");
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");

const W = 1920;
const H = 1080;
const deckName = "worldquant-brain-referral-th";
const referralId = "[YOUR_ID]";

const sources = [
  "WorldQuant BRAIN Referral Program: https://worldquantbrain.com/referral",
  "WorldQuant BRAIN official page: https://www.worldquant.com/brain/",
  "BRAIN Research Consultant Program: https://platform.worldquantbrain.com/consultant-program/?trk=test",
  "International Quant Championship 2026: https://www.worldquant.com/brain/iqc/",
];

const palette = {
  bg: "#07110f",
  bg2: "#0c1d18",
  panel: "#102620",
  panel2: "#132d25",
  line: "#2df2a0",
  line2: "#4dd8ff",
  gold: "#f7c948",
  red: "#ff5b67",
  text: "#f3f7f2",
  muted: "#a9beb4",
  faint: "#244137",
};

const slides = [
  {
    role: "hook",
    eyebrow: "WORLDQUANT BRAIN REFERRAL",
    title: "งานเสริมที่ไม่ใช่กดแอป\nแต่ใช้สมองทำเงิน",
    subtitle: "ถ้าคุณเขียนโค้ดหรือคิดเป็นระบบได้ นี่คือประตูเข้าวงการ quant ที่เริ่มจากศูนย์ได้",
    bullets: ["เรียน quant finance ฟรี", "สร้าง alpha จากข้อมูลจริง", "มีโอกาสต่อยอดเป็นรายได้"],
    note: "Hook ต้องแรงแต่ไม่สัญญาผลลัพธ์ ใช้คำว่าโอกาสและขึ้นกับคุณภาพงานเสมอ",
    source: "WorldQuant BRAIN official page",
  },
  {
    role: "stats",
    eyebrow: "WHAT IS BRAIN",
    title: "WorldQuant BRAIN คือสนามทดลอง alpha ระดับโลก",
    subtitle: "แพลตฟอร์มให้ผู้ใช้สร้างและทดสอบโมเดลทำนายตลาดการเงิน แล้วสะสมผลงานเพื่อโอกาสต่อยอด",
    stats: [
      ["250K+", "users"],
      ["9K+", "consultants"],
      ["125K+", "data fields"],
      ["17", "consultant regions"],
    ],
    note: "ใช้ตัวเลขจาก official page เพื่อสร้างความน่าเชื่อถือก่อนขาย referral",
    source: "WorldQuant BRAIN official page / Consultant Program",
  },
  {
    role: "why",
    eyebrow: "WHY IT MATTERS",
    title: "รายได้เสริมแบบนี้ไม่ได้ขายเวลา\nแต่ขาย skill ที่ scale ได้",
    subtitle: "มันไม่ใช่ทางลัด แต่ upside ดีกว่างานเสริมที่ทำซ้ำทุกชั่วโมง เพราะผลงาน alpha กลายเป็น portfolio ได้",
    bullets: ["ฝึก data + finance + model thinking", "มี competition และ ranking ให้พิสูจน์ฝีมือ", "ถ้าผลงานดี มี path ไป consultant"],
    note: "Slide นี้ต้องพูดกับ pain ของคนอยากมีรายได้เสริม: ไม่อยากแลกเวลาตรงๆ และอยากมี skill ติดตัว",
    source: "WorldQuant BRAIN official page",
  },
  {
    role: "path",
    eyebrow: "GROWTH PATH",
    title: "จากสมัครฟรี ไปจนถึงโอกาส consultant",
    subtitle: "เส้นทางหลักคือเรียน ทดลอง ส่ง alpha สะสมคะแนน และอาจได้รับเชิญเมื่อถึงเกณฑ์",
    steps: ["Sign up", "Learn", "Submit Alphas", "Gold / 10,000 pts", "May get invited"],
    note: "ย้ำคำว่า may get invited เพราะไม่ใช่การการันตี",
    source: "BRAIN Research Consultant Program",
  },
  {
    role: "money",
    eyebrow: "WHERE MONEY CAN HAPPEN",
    title: "เงินอยู่ตรงไหน: 3 ทางที่พูดได้",
    subtitle: "ไม่ใช่เงินง่าย แต่เป็น upside ที่ official ระบุไว้ชัดเจนเมื่อผลงานและเงื่อนไขผ่าน",
    money: [
      ["Consultant", "Master อาจได้ US$2,000+ / quarter\nGrandmaster อาจได้ US$8,000+ / quarter"],
      ["Competition", "IQC 2026 Global Finals\nอันดับ 1: US$20,000"],
      ["Referral", "US$100 ต่อ successful referral\nเมื่อผ่านเงื่อนไขครบ"],
    ],
    note: "ตัวเลขต้องอยู่คู่กับ qualifier: อาจได้, เมื่อผ่านเงื่อนไข, ขึ้นกับคุณภาพ alpha",
    source: "Consultant Program / IQC 2026 / Referral Program",
  },
  {
    role: "referral",
    eyebrow: "REFERRAL MECHANICS",
    title: "Referral จะนับก็ต่อเมื่อทำครบเงื่อนไข",
    subtitle: "จุดสำคัญที่สุดคือใส่ User ID ตอนสมัคร เพราะแก้ย้อนหลังไม่ได้",
    steps: ["ใส่ User ID ตอนสมัคร", "สมัครและเริ่มใช้งาน", "ได้เป็น consultant / service provider", "ส่ง alpha 10 วันต่างกัน", "อยู่ครบอย่างน้อย 1 เดือน"],
    note: "Slide นี้ลดความเข้าใจผิดว่าแค่สมัครผ่านลิงก์แล้วคนชวนได้เงินทันที",
    source: "WorldQuant BRAIN Referral Program",
  },
  {
    role: "truth",
    eyebrow: "REALITY CHECK",
    title: "ความจริงก่อนเริ่ม: นี่ไม่ใช่เงินง่าย",
    subtitle: "ต้องเรียน ต้องลอง ต้องส่งงาน และผลลัพธ์ขึ้นกับคุณภาพ alpha แต่ถ้าคุณจริงจัง มันเป็นเกมที่มีเพดานสูง",
    dos: ["ใช้คำว่า มีโอกาส / potentially", "ย้ำว่าไม่การันตีรายได้", "ชวนคนที่พร้อมเรียนจริง"],
    donts: ["ได้เงินแน่", "รวยง่าย", "passive income"],
    note: "ใช้เป็น trust slide ก่อน CTA เพื่อให้ pitch ดูน่าเชื่อถือและไม่หลอกลวง",
    source: "Language aligned with official terms",
  },
  {
    role: "cta",
    eyebrow: "START NOW",
    title: "ถ้าอยากลองสาย quant\nเริ่มจากสมัคร BRAIN วันนี้",
    subtitle: `สมัคร WorldQuant BRAIN แล้วใส่ Referral ID: ${referralId} ตอนสร้างบัญชี`,
    bullets: ["เริ่มฟรี", "ฝึก skill ที่ใช้ต่อได้", "ถ้าผลงานดี มี upside จริง"],
    note: "แทนที่ [YOUR_ID] ด้วย user ID จริงก่อนใช้งานจริง",
    source: "WorldQuant BRAIN Referral Program",
  },
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function textLines(text, x, y, size, color = palette.text, weight = 700, maxChars = 28, lineGap = 1.16) {
  const lines = [];
  String(text).split("\n").forEach((part) => {
    let line = "";
    part.split(" ").forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
  });
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" font-family="Sukhumvit Set, Thonburi, Arial, sans-serif">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lineGap}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function pill(x, y, text, color = palette.line) {
  return `<g><rect x="${x}" y="${y}" width="${text.length * 14 + 46}" height="46" rx="23" fill="${color}" opacity="0.16" stroke="${color}" stroke-width="1.5"/><text x="${x + 24}" y="${y + 30}" font-size="18" fill="${color}" font-weight="800" font-family="Inter, Arial">${esc(text)}</text></g>`;
}

function grid() {
  const lines = [];
  for (let x = 0; x <= W; x += 96) lines.push(`<path d="M${x} 0V${H}" stroke="${palette.faint}" stroke-width="1" opacity="0.25"/>`);
  for (let y = 0; y <= H; y += 96) lines.push(`<path d="M0 ${y}H${W}" stroke="${palette.faint}" stroke-width="1" opacity="0.2"/>`);
  return `<g>${lines.join("")}</g>`;
}

function chart(x = 1180, y = 210, w = 520, h = 300) {
  const pts = [
    [0, 260],
    [70, 210],
    [135, 230],
    [210, 150],
    [290, 172],
    [365, 92],
    [455, 120],
    [520, 42],
  ];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x + p[0]} ${y + p[1]}`).join(" ");
  const area = `${d} L${x + w} ${y + h} L${x} ${y + h} Z`;
  return `<g>
    <rect x="${x - 46}" y="${y - 46}" width="${w + 92}" height="${h + 92}" rx="26" fill="${palette.panel}" stroke="${palette.faint}" stroke-width="2"/>
    <path d="${area}" fill="${palette.line}" opacity="0.12"/>
    <path d="${d}" fill="none" stroke="${palette.line}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${x} ${y + h}H${x + w}" stroke="${palette.muted}" opacity="0.28"/>
    ${pts.map((p) => `<circle cx="${x + p[0]}" cy="${y + p[1]}" r="7" fill="${palette.bg}" stroke="${palette.line}" stroke-width="4"/>`).join("")}
    <text x="${x - 6}" y="${y + h + 46}" font-size="22" fill="${palette.muted}" font-family="Inter, Arial">alpha signal / simulated performance</text>
  </g>`;
}

function terminal(x = 1120, y = 565) {
  return `<g>
    <rect x="${x}" y="${y}" width="610" height="270" rx="24" fill="#07100e" stroke="${palette.faint}" stroke-width="2"/>
    <circle cx="${x + 34}" cy="${y + 34}" r="8" fill="${palette.red}"/>
    <circle cx="${x + 62}" cy="${y + 34}" r="8" fill="${palette.gold}"/>
    <circle cx="${x + 90}" cy="${y + 34}" r="8" fill="${palette.line}"/>
    <text x="${x + 38}" y="${y + 92}" font-size="26" fill="${palette.line}" font-family="Menlo, monospace">$ submit_alpha()</text>
    <text x="${x + 38}" y="${y + 138}" font-size="24" fill="${palette.muted}" font-family="Menlo, monospace">score: improving</text>
    <text x="${x + 38}" y="${y + 184}" font-size="24" fill="${palette.line2}" font-family="Menlo, monospace">rank: climbing</text>
    <text x="${x + 38}" y="${y + 230}" font-size="24" fill="${palette.gold}" font-family="Menlo, monospace">upside: unlocked?</text>
  </g>`;
}

function base(slide) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${palette.bg}"/><stop offset="1" stop-color="${palette.bg2}"/></linearGradient>
      <radialGradient id="glow" cx="76%" cy="24%" r="58%"><stop stop-color="${palette.line}" stop-opacity="0.22"/><stop offset="1" stop-color="${palette.line}" stop-opacity="0"/></radialGradient>
      <filter id="soft"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.34"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    ${grid()}
    ${pill(120, 92, slide.eyebrow)}
  `;
}

function footer(slide, idx) {
  return `<text x="120" y="1012" font-size="21" fill="${palette.muted}" opacity="0.82" font-family="Sukhumvit Set, Thonburi, Arial">Source: ${esc(slide.source)}</text>
    <text x="1748" y="1012" font-size="22" fill="${palette.muted}" font-family="Inter, Arial">${String(idx + 1).padStart(2, "0")} / 08</text>
  </svg>`;
}

function bulletList(items, x, y, color = palette.text) {
  return `<g>${items
    .map((b, i) => `<g transform="translate(${x},${y + i * 72})"><circle cx="0" cy="0" r="9" fill="${palette.line}"/><text x="28" y="10" font-size="34" fill="${color}" font-weight="650" font-family="Sukhumvit Set, Thonburi, Arial">${esc(b)}</text></g>`)
    .join("")}</g>`;
}

function render(slide, idx) {
  let body = "";
  if (slide.role === "hook") {
    body += textLines(slide.title, 120, 250, 78, palette.text, 850, 22);
    body += textLines(slide.subtitle, 124, 500, 34, palette.muted, 500, 44);
    body += bulletList(slide.bullets, 144, 682);
    body += chart();
    body += terminal();
  } else if (slide.role === "stats") {
    body += textLines(slide.title, 120, 230, 62, palette.text, 850, 29);
    body += textLines(slide.subtitle, 124, 390, 33, palette.muted, 500, 50);
    body += `<g filter="url(#soft)">${slide.stats.map((s, i) => {
      const x = 120 + (i % 2) * 450;
      const y = 575 + Math.floor(i / 2) * 180;
      return `<rect x="${x}" y="${y}" width="390" height="138" rx="24" fill="${palette.panel}" stroke="${palette.faint}" stroke-width="2"/>
        <text x="${x + 34}" y="${y + 65}" font-size="54" fill="${i === 0 ? palette.line : i === 1 ? palette.gold : palette.line2}" font-weight="850" font-family="Inter, Arial">${s[0]}</text>
        <text x="${x + 34}" y="${y + 106}" font-size="28" fill="${palette.muted}" font-family="Inter, Arial">${s[1]}</text>`;
    }).join("")}</g>`;
    body += chart(1110, 390, 560, 330);
  } else if (slide.role === "why") {
    body += textLines(slide.title, 120, 230, 65, palette.text, 850, 26);
    body += textLines(slide.subtitle, 124, 440, 33, palette.muted, 500, 50);
    body += bulletList(slide.bullets, 150, 655);
    body += `<g transform="translate(1160,260)">
      <rect width="560" height="520" rx="28" fill="${palette.panel}" stroke="${palette.faint}" stroke-width="2"/>
      <text x="54" y="90" font-size="34" fill="${palette.muted}" font-family="Sukhumvit Set, Thonburi, Arial">เวลาแลกเงิน</text>
      <path d="M60 165H500" stroke="${palette.red}" stroke-width="4" opacity="0.75"/>
      <text x="54" y="246" font-size="34" fill="${palette.muted}" font-family="Sukhumvit Set, Thonburi, Arial">skill สร้าง upside</text>
      <path d="M60 425C160 375 230 300 310 250S430 175 500 88" stroke="${palette.line}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="500" cy="88" r="13" fill="${palette.gold}"/>
    </g>`;
  } else if (slide.role === "path") {
    body += textLines(slide.title, 120, 225, 66, palette.text, 850, 26);
    body += textLines(slide.subtitle, 124, 390, 34, palette.muted, 500, 52);
    const sx = 145;
    const sy = 650;
    body += `<g>${slide.steps.map((step, i) => {
      const x = sx + i * 335;
      return `<g>
        ${i < slide.steps.length - 1 ? `<path d="M${x + 155} ${sy}H${x + 292}" stroke="${palette.faint}" stroke-width="8" stroke-linecap="round"/>` : ""}
        <circle cx="${x}" cy="${sy}" r="78" fill="${i === 4 ? palette.gold : palette.panel}" stroke="${i === 4 ? palette.gold : palette.line}" stroke-width="5"/>
        <text x="${x}" y="${sy + 12}" text-anchor="middle" font-size="42" fill="${i === 4 ? palette.bg : palette.line}" font-weight="850" font-family="Inter, Arial">${i + 1}</text>
        ${textLines(step, x - 122, sy + 132, 30, palette.text, 750, 14)}
      </g>`;
    }).join("")}</g>`;
    body += `<text x="1305" y="908" font-size="28" fill="${palette.gold}" font-weight="800" font-family="Sukhumvit Set, Thonburi, Arial">ไม่การันตี: ใช้คำว่า “อาจได้รับเชิญ” เท่านั้น</text>`;
  } else if (slide.role === "money") {
    body += textLines(slide.title, 120, 215, 66, palette.text, 850, 28);
    body += textLines(slide.subtitle, 124, 378, 32, palette.muted, 500, 54);
    body += `<g>${slide.money.map((m, i) => {
      const x = 130 + i * 585;
      const color = [palette.line, palette.gold, palette.line2][i];
      return `<rect x="${x}" y="575" width="510" height="285" rx="26" fill="${palette.panel}" stroke="${color}" stroke-width="3" opacity="0.98"/>
        <text x="${x + 38}" y="635" font-size="32" fill="${color}" font-weight="850" font-family="Inter, Arial">${esc(m[0])}</text>
        ${textLines(m[1], x + 38, 704, 31, palette.text, 650, 28)}`;
    }).join("")}</g>`;
    body += `<text x="124" y="922" font-size="27" fill="${palette.muted}" font-family="Sukhumvit Set, Thonburi, Arial">ทุกตัวเลขเป็นโอกาสตามเงื่อนไข ไม่ใช่รายได้ที่การันตี</text>`;
  } else if (slide.role === "referral") {
    body += textLines(slide.title, 120, 215, 66, palette.text, 850, 28);
    body += textLines(slide.subtitle, 124, 375, 36, palette.gold, 800, 48);
    body += `<g>${slide.steps.map((step, i) => {
      const y = 540 + i * 78;
      return `<rect x="125" y="${y - 42}" width="1300" height="58" rx="18" fill="${i === 0 ? palette.gold : palette.panel}" opacity="${i === 0 ? 1 : 0.94}"/>
        <text x="155" y="${y - 2}" font-size="26" fill="${i === 0 ? palette.bg : palette.line}" font-weight="850" font-family="Inter, Arial">${i + 1}</text>
        <text x="218" y="${y - 3}" font-size="30" fill="${i === 0 ? palette.bg : palette.text}" font-weight="700" font-family="Sukhumvit Set, Thonburi, Arial">${esc(step)}</text>`;
    }).join("")}</g>`;
    body += `<g transform="translate(1490,510)"><rect width="280" height="330" rx="28" fill="#081310" stroke="${palette.gold}" stroke-width="4"/><text x="140" y="140" text-anchor="middle" font-size="76" fill="${palette.gold}" font-weight="900" font-family="Inter, Arial">$100</text><text x="140" y="195" text-anchor="middle" font-size="27" fill="${palette.text}" font-family="Sukhumvit Set, Thonburi, Arial">successful</text><text x="140" y="232" text-anchor="middle" font-size="27" fill="${palette.text}" font-family="Sukhumvit Set, Thonburi, Arial">referral</text></g>`;
  } else if (slide.role === "truth") {
    body += textLines(slide.title, 120, 215, 68, palette.text, 850, 25);
    body += textLines(slide.subtitle, 124, 388, 34, palette.muted, 500, 54);
    body += `<g transform="translate(130,590)"><rect width="760" height="280" rx="26" fill="${palette.panel}" stroke="${palette.line}" stroke-width="3"/><text x="38" y="62" font-size="34" fill="${palette.line}" font-weight="850" font-family="Sukhumvit Set, Thonburi, Arial">พูดแบบนี้</text>${slide.dos.map((d, i) => `<text x="42" y="${125 + i * 55}" font-size="31" fill="${palette.text}" font-family="Sukhumvit Set, Thonburi, Arial">✓ ${esc(d)}</text>`).join("")}</g>`;
    body += `<g transform="translate(1030,590)"><rect width="760" height="280" rx="26" fill="${palette.panel}" stroke="${palette.red}" stroke-width="3"/><text x="38" y="62" font-size="34" fill="${palette.red}" font-weight="850" font-family="Sukhumvit Set, Thonburi, Arial">ห้ามพูดแบบนี้</text>${slide.donts.map((d, i) => `<text x="42" y="${125 + i * 55}" font-size="31" fill="${palette.text}" font-family="Sukhumvit Set, Thonburi, Arial">× ${esc(d)}</text>`).join("")}</g>`;
  } else if (slide.role === "cta") {
    body += textLines(slide.title, 120, 225, 75, palette.text, 850, 24);
    body += `<rect x="120" y="500" width="1180" height="132" rx="28" fill="${palette.gold}" filter="url(#soft)"/>
      <text x="164" y="555" font-size="34" fill="${palette.bg}" font-weight="850" font-family="Sukhumvit Set, Thonburi, Arial">
        <tspan x="164" dy="0">สมัคร WorldQuant BRAIN แล้วใส่ Referral ID: ${esc(referralId)}</tspan>
        <tspan x="164" dy="46">ตอนสร้างบัญชี</tspan>
      </text>`;
    body += bulletList(slide.bullets, 150, 742);
    body += `<g transform="translate(1390,255)"><rect width="330" height="500" rx="34" fill="${palette.panel}" stroke="${palette.line}" stroke-width="4"/><text x="165" y="155" text-anchor="middle" font-size="68" fill="${palette.line}" font-weight="900" font-family="Inter, Arial">BRAIN</text><path d="M70 255C115 210 155 290 204 242S270 184 292 214" stroke="${palette.gold}" stroke-width="9" fill="none" stroke-linecap="round"/><text x="165" y="370" text-anchor="middle" font-size="30" fill="${palette.text}" font-family="Sukhumvit Set, Thonburi, Arial">สมัครฟรี</text><text x="165" y="420" text-anchor="middle" font-size="30" fill="${palette.muted}" font-family="Sukhumvit Set, Thonburi, Arial">ใส่ ID ตอนสมัคร</text></g>`;
  }
  return `${base(slide)}${body}${footer(slide, idx)}`;
}

async function main() {
  [IMG_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.subject = "WorldQuant BRAIN referral pitch";
  pptx.title = "WorldQuant BRAIN Referral";
  pptx.company = "Slide_Generator";
  pptx.lang = "th-TH";
  pptx.theme = {
    headFontFace: "Sukhumvit Set",
    bodyFontFace: "Sukhumvit Set",
    lang: "th-TH",
  };

  const notes = [
    "# WorldQuant BRAIN Referral Deck",
    "",
    "ภาษา: ไทย",
    "ขนาด: 16:9",
    `Referral ID placeholder: ${referralId}`,
    "",
    "## Sources",
    ...sources.map((s) => `- ${s}`),
    "",
    "## Slide Notes",
  ];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const svg = render(slide, i);
    const svgPath = path.join(IMG_DIR, `slide-${String(i + 1).padStart(2, "0")}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);

    const page = pptx.addSlide();
    page.background = { color: "07110F" };
    page.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });

    notes.push(``, `### ${i + 1}. ${slide.title.replace(/\n/g, " ")}`, `- Role: ${slide.role}`, `- Main message: ${slide.subtitle}`, `- Speaker note: ${slide.note}`, `- Source: ${slide.source}`);
  }

  fs.writeFileSync(path.join(NOTES_DIR, `${deckName}-outline.md`), notes.join("\n"));
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${deckName}.pptx`) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
