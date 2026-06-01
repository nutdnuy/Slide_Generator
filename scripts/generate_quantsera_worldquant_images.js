const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const IMG_DIR = path.join(ROOT, "assets", "images", "quantsera-worldquant");
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");
const W = 1920;
const H = 1080;
const referralId = "[YOUR_ID]";
const outName = "worldquant-brain-referral-quantsera-cinematic";

const C = {
  bg: "#121212",
  surface1: "#1D1D1D",
  surface2: "#212121",
  surface3: "#242424",
  surface8: "#2E2E2E",
  primary: "#69F0AE",
  primary2: "#00C853",
  secondary: "#03DAC6",
  warning: "#FFB74D",
  info: "#81D4FA",
  error: "#CF6679",
  profit: "#00E676",
  loss: "#FF5252",
  text: "#F0F0F0",
  med: "#A6A6A6",
  low: "#707070",
  line: "rgba(255,255,255,0.08)",
};

const slides = [
  {
    label: "WORLDQUANT BRAIN REFERRAL",
    title: "งานเสริมที่ไม่ใช่กดแอป\nแต่ใช้สมองทำเงิน",
    body: "ถ้าคุณเขียนโค้ดหรือคิดเป็นระบบได้ นี่คือประตูเข้าวงการ quant ที่เริ่มจากศูนย์ได้",
    bullets: ["เรียน quant finance ฟรี", "สร้าง alpha จากข้อมูลจริง", "มีโอกาสต่อยอดเป็นรายได้"],
    visual: "terminal",
    source: "WorldQuant BRAIN official page",
  },
  {
    label: "WHAT IS BRAIN",
    title: "WorldQuant BRAIN คือสนามทดลอง\nalpha ระดับโลก",
    body: "แพลตฟอร์มให้ผู้ใช้สร้างและทดสอบโมเดลทำนายตลาดการเงิน แล้วสะสมผลงานเพื่อโอกาสต่อยอด",
    stats: [["250K+", "users"], ["9K+", "consultants"], ["125K+", "data fields"], ["17", "regions"]],
    visual: "stats",
    source: "WorldQuant BRAIN official page / Consultant Program",
  },
  {
    label: "WHY IT MATTERS",
    title: "รายได้เสริมแบบนี้ไม่ได้ขายเวลา\nแต่ขาย skill ที่ scale ได้",
    body: "ไม่ใช่ทางลัด แต่ upside ดีกว่างานเสริมที่ทำซ้ำทุกชั่วโมง เพราะ alpha กลายเป็น portfolio ได้",
    bullets: ["data + finance + model thinking", "competition และ ranking", "path ไป consultant"],
    visual: "scale",
    source: "WorldQuant BRAIN official page",
  },
  {
    label: "GROWTH PATH",
    title: "จากสมัครฟรี ไปจนถึงโอกาส consultant",
    body: "เส้นทางหลักคือเรียน ทดลอง ส่ง alpha สะสมคะแนน และอาจได้รับเชิญเมื่อถึงเกณฑ์",
    steps: ["Sign up", "Learn", "Submit", "Gold / 10k pts", "May get invited"],
    visual: "path",
    source: "BRAIN Research Consultant Program",
  },
  {
    label: "WHERE MONEY CAN HAPPEN",
    title: "เงินอยู่ตรงไหน:\n3 ทางที่พูดได้",
    body: "ไม่ใช่เงินง่าย แต่เป็น upside ที่ official ระบุไว้ชัดเจนเมื่อผลงานและเงื่อนไขผ่าน",
    cards: [
      ["Consultant", "Master อาจได้ US$2,000+ / quarter\nGrandmaster อาจได้ US$8,000+ / quarter"],
      ["Competition", "IQC 2026 Global Finals\nอันดับ 1: US$20,000"],
      ["Referral", "US$100 ต่อ successful referral\nเมื่อผ่านเงื่อนไขครบ"],
    ],
    visual: "money",
    source: "Consultant Program / IQC 2026 / Referral Program",
  },
  {
    label: "REFERRAL MECHANICS",
    title: "Referral จะนับก็ต่อเมื่อ\nทำครบเงื่อนไข",
    body: "จุดสำคัญที่สุดคือใส่ User ID ตอนสมัคร เพราะแก้ย้อนหลังไม่ได้",
    steps: ["ใส่ User ID ตอนสมัคร", "สมัครและเริ่มใช้งาน", "ได้เป็น consultant / service provider", "ส่ง alpha 10 วันต่างกัน", "อยู่ครบอย่างน้อย 1 เดือน"],
    visual: "checklist",
    source: "WorldQuant BRAIN Referral Program",
  },
  {
    label: "REALITY CHECK",
    title: "ความจริงก่อนเริ่ม:\nนี่ไม่ใช่เงินง่าย",
    body: "ต้องเรียน ต้องลอง ต้องส่งงาน และผลลัพธ์ขึ้นกับคุณภาพ alpha แต่ถ้าคุณจริงจัง เกมนี้มีเพดานสูง",
    dos: ["มีโอกาส / potentially", "ไม่การันตีรายได้", "ชวนคนที่พร้อมเรียนจริง"],
    donts: ["ได้เงินแน่", "รวยง่าย", "passive income"],
    visual: "truth",
    source: "Language aligned with official terms",
  },
  {
    label: "START NOW",
    title: "ถ้าอยากลองสาย quant\nเริ่มจากสมัคร BRAIN วันนี้",
    body: `สมัคร WorldQuant BRAIN แล้วใส่ Referral ID: ${referralId} ตอนสร้างบัญชี`,
    bullets: ["เริ่มฟรี", "ฝึก skill ที่ใช้ต่อได้", "ถ้าผลงานดี มี upside จริง"],
    visual: "cta",
    source: "WorldQuant BRAIN Referral Program",
  },
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function wrap(text, max = 34) {
  const out = [];
  String(text).split("\n").forEach((p) => {
    let line = "";
    p.split(" ").forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > max && line) {
        out.push(line);
        line = word;
      } else line = next;
    });
    if (line) out.push(line);
  });
  return out;
}

function text(text, x, y, size, fill = C.text, weight = 600, max = 30, lh = 1.16, family = "Sukhumvit Set, Thonburi, Inter, Arial, sans-serif") {
  const lines = wrap(text, max);
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${family}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function mono(s, x, y, size, fill = C.primary, weight = 600) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Menlo, JetBrains Mono, IBM Plex Mono, Consolas, monospace">${esc(s)}</text>`;
}

function bg(slide, i) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="stage" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="${C.bg}"/><stop offset="0.58" stop-color="#151B19"/><stop offset="1" stop-color="${C.bg}"/>
    </linearGradient>
    <radialGradient id="beam" cx="74%" cy="28%" r="62%"><stop stop-color="${C.primary}" stop-opacity="0.18"/><stop offset="0.48" stop-color="${C.secondary}" stop-opacity="0.08"/><stop offset="1" stop-color="${C.bg}" stop-opacity="0"/></radialGradient>
    <linearGradient id="floor" x1="0" x2="1"><stop stop-color="${C.primary}" stop-opacity="0"/><stop offset="0.5" stop-color="${C.primary}" stop-opacity="0.25"/><stop offset="1" stop-color="${C.secondary}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#stage)"/>
  <rect width="${W}" height="${H}" fill="url(#beam)"/>
  <g opacity="0.58">${Array.from({ length: 21 }, (_, n) => `<path d="M${120 + n * 84} 0V${H}" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>`).join("")}</g>
  <g opacity="0.7">${Array.from({ length: 9 }, (_, n) => `<path d="M0 ${222 + n * 84}H${W}" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>`).join("")}</g>
  <path d="M0 920C420 790 760 980 1120 860S1580 720 1920 820V1080H0Z" fill="url(#floor)" opacity="0.7"/>
  <rect y="0" width="${W}" height="72" fill="#121212" opacity="0.72"/>
  <rect y="1008" width="${W}" height="72" fill="#121212" opacity="0.72"/>
  <text x="120" y="122" font-size="18" fill="${C.primary}" font-weight="700" letter-spacing="2" font-family="Inter, Arial">${esc(slide.label)}</text>
  <text x="1560" y="122" font-size="24" fill="${C.med}" font-family="Menlo, monospace">${String(i + 1).padStart(2, "0")} / 08</text>
  <text x="120" y="1018" font-size="20" fill="${C.low}" font-family="Sukhumvit Set, Thonburi, Arial">Source: ${esc(slide.source)}</text>`;
}

function footer() {
  return `</svg>`;
}

function bullets(items, x, y) {
  return `<g>${items
    .map((b, i) => `<g transform="translate(${x},${y + i * 70})"><rect x="0" y="-22" width="38" height="38" rx="8" fill="${C.surface2}" stroke="rgba(255,255,255,0.08)"/><path d="M10 -2L18 8L30 -12" stroke="${C.primary}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="58" y="8" font-size="31" fill="${C.text}" font-weight="600" font-family="Sukhumvit Set, Thonburi, Arial">${esc(b)}</text></g>`)
    .join("")}</g>`;
}

function chart(x, y, w, h) {
  const pts = [[0, 250], [78, 212], [150, 226], [245, 144], [320, 168], [410, 82], [500, 112], [590, 36]];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x + p[0]} ${y + p[1]}`).join(" ");
  return `<g>
    <rect x="${x - 42}" y="${y - 42}" width="${w + 84}" height="${h + 90}" rx="16" fill="${C.surface1}" stroke="rgba(255,255,255,0.08)"/>
    ${Array.from({ length: 4 }, (_, i) => `<path d="M${x} ${y + i * 80}H${x + w}" stroke="rgba(255,255,255,0.08)"/>`).join("")}
    <path d="${d}" stroke="${C.primary}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${x} ${y + h - 38}H${x + w}" stroke="${C.secondary}" stroke-width="3" stroke-dasharray="9 13" opacity="0.72"/>
    ${pts.map((p) => `<circle cx="${x + p[0]}" cy="${y + p[1]}" r="7" fill="${C.bg}" stroke="${C.primary}" stroke-width="4"/>`).join("")}
  </g>`;
}

function render(slide, i) {
  let s = bg(slide, i);
  s += text(slide.title, 120, 245, 70, C.text, 700, 25);
  if (slide.visual !== "cta") {
    s += text(slide.body, 124, 440, 32, C.med, 400, 48);
  }

  if (slide.visual === "terminal") {
    s += bullets(slide.bullets, 132, 685);
    s += chart(1130, 255, 590, 320);
    s += `<g transform="translate(1125,650)"><rect width="620" height="230" rx="16" fill="${C.surface1}" stroke="rgba(255,255,255,0.10)"/><rect width="620" height="46" rx="16" fill="${C.surface3}"/><circle cx="30" cy="23" r="7" fill="${C.error}"/><circle cx="54" cy="23" r="7" fill="${C.warning}"/><circle cx="78" cy="23" r="7" fill="${C.primary}"/>${mono("$ submit_alpha --mode research", 34, 92, 25)}${mono("sharpe: improving", 34, 138, 24, C.med, 400)}${mono("rank: climbing", 34, 184, 24, C.secondary, 500)}</g>`;
  }

  if (slide.visual === "stats") {
    s += `<g>${slide.stats.map((st, idx) => {
      const x = 990 + (idx % 2) * 390;
      const y = 300 + Math.floor(idx / 2) * 205;
      const c = idx % 2 ? C.secondary : C.primary;
      return `<rect x="${x}" y="${y}" width="335" height="154" rx="16" fill="${idx < 2 ? C.surface2 : C.surface1}" stroke="rgba(255,255,255,0.08)"/><text x="${x + 30}" y="${y + 72}" font-size="54" fill="${c}" font-weight="700" font-family="Menlo, monospace">${st[0]}</text><text x="${x + 32}" y="${y + 116}" font-size="25" fill="${C.med}" font-family="Inter, Arial">${st[1]}</text>`;
    }).join("")}</g><path d="M1010 792C1170 710 1270 835 1410 742S1620 662 1740 690" stroke="${C.primary}" stroke-width="7" fill="none" opacity="0.8"/>`;
  }

  if (slide.visual === "scale") {
    s += bullets(slide.bullets, 132, 675);
    s += `<g transform="translate(1110,280)"><rect width="650" height="520" rx="16" fill="${C.surface1}" stroke="rgba(255,255,255,0.08)"/><text x="42" y="80" font-size="30" fill="${C.med}" font-family="Sukhumvit Set, Thonburi">เวลาแลกเงิน</text><path d="M48 145H580" stroke="${C.error}" stroke-width="4" opacity="0.85"/><text x="42" y="238" font-size="30" fill="${C.text}" font-family="Sukhumvit Set, Thonburi">skill สร้าง upside</text><path d="M58 430C170 390 240 320 330 250S485 150 580 92" stroke="${C.primary}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="580" cy="92" r="13" fill="${C.warning}"/></g>`;
  }

  if (slide.visual === "path") {
    s += `<g>${slide.steps.map((step, idx) => {
      const x = 170 + idx * 350;
      const y = 720;
      return `<g>${idx < slide.steps.length - 1 ? `<path d="M${x + 88} ${y}H${x + 270}" stroke="rgba(255,255,255,0.12)" stroke-width="5"/>` : ""}<circle cx="${x}" cy="${y}" r="70" fill="${idx === 4 ? C.primary : C.surface1}" stroke="${idx === 4 ? C.primary : "rgba(255,255,255,0.14)"}" stroke-width="3"/><text x="${x}" y="${y + 12}" text-anchor="middle" font-size="38" fill="${idx === 4 ? "#000" : C.primary}" font-weight="700" font-family="Menlo, monospace">${idx + 1}</text>${text(step, x - 120, y + 130, 28, C.text, 600, 14)}</g>`;
    }).join("")}</g><text x="1160" y="925" font-size="26" fill="${C.warning}" font-family="Sukhumvit Set, Thonburi">ใช้คำว่า “อาจได้รับเชิญ” เท่านั้น</text>`;
  }

  if (slide.visual === "money") {
    s += `<g>${slide.cards.map((card, idx) => {
      const x = 118 + idx * 590;
      const c = [C.primary, C.warning, C.secondary][idx];
      return `<rect x="${x}" y="575" width="520" height="285" rx="16" fill="${C.surface1}" stroke="${c}" stroke-width="2"/><text x="${x + 34}" y="635" font-size="32" fill="${c}" font-weight="700" font-family="Inter, Arial">${card[0]}</text>${text(card[1], x + 34, 705, 30, C.text, 600, 28)}`;
    }).join("")}</g><text x="124" y="925" font-size="25" fill="${C.med}" font-family="Sukhumvit Set, Thonburi">ทุกตัวเลขเป็นโอกาสตามเงื่อนไข ไม่ใช่รายได้ที่การันตี</text>`;
  }

  if (slide.visual === "checklist") {
    s += `<g>${slide.steps.map((step, idx) => {
      const y = 555 + idx * 74;
      const hot = idx === 0;
      return `<rect x="120" y="${y - 45}" width="1290" height="56" rx="8" fill="${hot ? C.primary : C.surface1}" stroke="rgba(255,255,255,0.08)"/><text x="152" y="${y - 7}" font-size="25" fill="${hot ? "#000" : C.primary}" font-weight="700" font-family="Menlo, monospace">${idx + 1}</text><text x="220" y="${y - 7}" font-size="29" fill="${hot ? "#000" : C.text}" font-weight="600" font-family="Sukhumvit Set, Thonburi">${esc(step)}</text>`;
    }).join("")}</g><g transform="translate(1490,540)"><rect width="275" height="290" rx="16" fill="${C.surface1}" stroke="${C.warning}" stroke-width="2"/><text x="137" y="132" text-anchor="middle" font-size="70" fill="${C.warning}" font-weight="700" font-family="Menlo, monospace">$100</text><text x="137" y="186" text-anchor="middle" font-size="25" fill="${C.text}" font-family="Inter, Arial">successful</text><text x="137" y="224" text-anchor="middle" font-size="25" fill="${C.med}" font-family="Inter, Arial">referral</text></g>`;
  }

  if (slide.visual === "truth") {
    s += `<g transform="translate(120,600)"><rect width="790" height="270" rx="16" fill="${C.surface1}" stroke="${C.primary}" stroke-width="2"/><text x="38" y="60" font-size="32" fill="${C.primary}" font-weight="700" font-family="Sukhumvit Set, Thonburi">พูดแบบนี้</text>${slide.dos.map((d, idx) => `<text x="42" y="${124 + idx * 54}" font-size="29" fill="${C.text}" font-family="Sukhumvit Set, Thonburi">✓ ${esc(d)}</text>`).join("")}</g><g transform="translate(1010,600)"><rect width="790" height="270" rx="16" fill="${C.surface1}" stroke="${C.error}" stroke-width="2"/><text x="38" y="60" font-size="32" fill="${C.error}" font-weight="700" font-family="Sukhumvit Set, Thonburi">ห้ามพูดแบบนี้</text>${slide.donts.map((d, idx) => `<text x="42" y="${124 + idx * 54}" font-size="29" fill="${C.text}" font-family="Sukhumvit Set, Thonburi">× ${esc(d)}</text>`).join("")}</g>`;
  }

  if (slide.visual === "cta") {
    s += `<rect x="120" y="510" width="1205" height="138" rx="16" fill="${C.primary}"/><text x="166" y="566" font-size="34" fill="#000" font-weight="700" font-family="Sukhumvit Set, Thonburi"><tspan x="166" dy="0">สมัคร WorldQuant BRAIN แล้วใส่ Referral ID: ${esc(referralId)}</tspan><tspan x="166" dy="46">ตอนสร้างบัญชี</tspan></text>${bullets(slide.bullets, 138, 760)}<g transform="translate(1430,282)"><rect width="300" height="470" rx="16" fill="${C.surface1}" stroke="${C.primary}" stroke-width="3"/><text x="150" y="150" text-anchor="middle" font-size="60" fill="${C.primary}" font-weight="800" font-family="Inter, Arial">BRAIN</text><path d="M60 255C110 210 148 292 204 238S262 190 280 218" stroke="${C.warning}" stroke-width="8" fill="none" stroke-linecap="round"/><text x="150" y="365" text-anchor="middle" font-size="28" fill="${C.text}" font-family="Sukhumvit Set, Thonburi">สมัครฟรี</text><text x="150" y="410" text-anchor="middle" font-size="26" fill="${C.med}" font-family="Sukhumvit Set, Thonburi">ใส่ ID ตอนสมัคร</text></g>`;
  }

  return s + footer();
}

async function main() {
  [IMG_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.subject = "WorldQuant BRAIN referral deck in QuantSeras cinematic design";
  pptx.title = "WorldQuant BRAIN Referral - QuantSeras";
  pptx.lang = "th-TH";

  const notes = [
    "# WorldQuant BRAIN Referral — QuantSeras Cinematic Slide Images",
    "",
    "Design System: QuantSeras Material Dark + Green",
    "- Background: #121212, avoid pure black",
    "- Primary: #69F0AE, Secondary: #03DAC6",
    "- Surface elevation via #1D1D1D / #212121 / #242424",
    "- Tone: cinematic, data-forward, clean, not cluttered",
    "",
    `Referral ID placeholder: ${referralId}`,
    "",
  ];

  for (let i = 0; i < slides.length; i++) {
    const svg = render(slides[i], i);
    const n = String(i + 1).padStart(2, "0");
    const svgPath = path.join(IMG_DIR, `slide-${n}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${n}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);

    const page = pptx.addSlide();
    page.background = { color: "121212" };
    page.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });
    notes.push(`## ${n}. ${slides[i].title.replace(/\n/g, " ")}`, `- Visual: ${slides[i].visual}`, `- Source: ${slides[i].source}`, "");
  }

  fs.writeFileSync(path.join(NOTES_DIR, `${outName}-notes.md`), notes.join("\n"));
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${outName}.pptx`) });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
