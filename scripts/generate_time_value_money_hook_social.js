const fs = require("fs");
const path = require("path");

const NODE_MODULES = "/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const sharp = require(path.join(NODE_MODULES, "sharp"));
const pptxgen = require(path.join(NODE_MODULES, "pptxgenjs"));

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "time-value-money-hook-social";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");

const W = 1920;
const H = 1080;

const C = {
  bg: "#F5F0E6",
  bg2: "#ECE2D1",
  ink: "#121820",
  muted: "#6E756F",
  line: "#D6CCBB",
  card: "#FFFCF5",
  card2: "#F2ECDF",
  green: "#0D7C66",
  greenDark: "#06493E",
  gold: "#C88A21",
  gold2: "#E8B85B",
  red: "#C74C43",
  white: "#FFFFFF",
};

const scriptLines = [
  "0:00-0:03 ถ้าให้เลือก รับ 1 ล้านวันนี้ หรือรับ 1 ล้านในอีก 10 ปี คุณจะเลือกอะไร?",
  "0:03-0:08 หลายคนบอกว่าเท่ากัน เพราะตัวเลขคือ 1 ล้านเหมือนกัน แต่จริง ๆ มันไม่เท่ากัน",
  "0:08-0:17 เพราะเงินวันนี้เอาไปใช้ เอาไปลงทุน หรือเอาไปลดความเสี่ยงได้ทันที",
  "0:17-0:25 ถ้าสมมติเงิน 1 ล้านโตปีละ 6% ผ่านไป 10 ปี มันจะกลายเป็นประมาณ 1.79 ล้าน",
  "0:25-0:33 แต่ 1 ล้านในอีก 10 ปี ยังต้องเจอเงินเฟ้อ และความเสี่ยงว่าคุณจะไม่ได้ตามสัญญา",
  "0:33-0:42 นี่คือ Time Value of Money: เงินจำนวนเท่ากัน แต่เวลาไม่เท่ากัน มูลค่าก็ไม่เท่ากัน",
  "0:42-0:45 จำไว้ เวลาไม่ใช่แค่ผ่านไป มันคิดราคากับเงินของคุณเสมอ",
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

function text(lines, x, y, size, opts = {}) {
  const {
    fill = C.ink,
    weight = 600,
    family = '"Noto Sans Thai", "Th Sarabun New", "Helvetica Neue", Arial, sans-serif',
    lh = 1.18,
    anchor = "start",
    opacity = 1,
    letter = 0,
  } = opts;
  const list = Array.isArray(lines) ? lines : [lines];
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family='${family}' text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${letter}">
${list.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`).join("\n")}
</text>`;
}

function rect(x, y, w, h, fill, stroke = "none", sw = 0, rx = 0, extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="${rx}" ${extra}/>`;
}

function line(x1, y1, x2, y2, color, width = 4, opacity = 1, dash = "") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function moneyStack(x, y, scale = 1, muted = false) {
  const main = muted ? C.card2 : C.white;
  const stroke = muted ? "#BDB3A3" : C.greenDark;
  const accent = muted ? "#AAA090" : C.green;
  const op = muted ? 0.55 : 1;
  return `<g transform="translate(${x} ${y}) scale(${scale})" opacity="${op}">
    ${rect(28, 30, 310, 155, main, stroke, 8, 18)}
    ${rect(4, 6, 310, 155, main, stroke, 8, 18)}
    <circle cx="159" cy="83" r="43" fill="none" stroke="${accent}" stroke-width="10"/>
    ${text("฿", 159, 101, 58, { fill: accent, weight: 900, anchor: "middle", family: "Arial, sans-serif" })}
    <path d="M35 38 C66 52 68 108 35 123" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>
    <path d="M282 38 C251 52 249 108 282 123" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>
  </g>`;
}

function svg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
    <linearGradient id="today" x1="0" x2="1">
      <stop offset="0" stop-color="${C.green}"/>
      <stop offset="1" stop-color="${C.gold}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#172018" flood-opacity="0.16"/>
    </filter>
  </defs>
  ${rect(0, 0, W, H, "url(#bg)")}
  <circle cx="1650" cy="130" r="230" fill="${C.gold2}" opacity="0.12"/>
  <circle cx="230" cy="915" r="260" fill="${C.green}" opacity="0.08"/>

  ${text("TIME VALUE OF MONEY", 96, 106, 26, { fill: C.greenDark, weight: 900, family: "Arial, sans-serif", letter: 2 })}
  ${text("HOOK SLIDE", 1824, 106, 24, { fill: C.muted, weight: 800, anchor: "end", family: "Arial, sans-serif", letter: 1 })}

  ${rect(86, 162, 1748, 760, C.card, "#FFFFFF", 1, 42, 'filter="url(#shadow)"')}
  ${rect(128, 204, 710, 676, "#FDF8EF", C.line, 3, 34)}
  ${rect(1082, 204, 710, 676, "#EFE8DA", C.line, 3, 34)}
  ${rect(144, 220, 678, 644, "none", "url(#today)", 6, 28)}

  ${text("ทางเลือก A", 186, 282, 30, { fill: C.greenDark, weight: 900 })}
  ${text("รับวันนี้", 186, 374, 74, { fill: C.greenDark, weight: 900 })}
  ${text("1,000,000 บาท", 186, 468, 52, { fill: C.ink, weight: 900, family: "Arial, sans-serif" })}
  ${text(["ใช้ได้ทันที", "ลงทุนได้ทันที", "ลดความเสี่ยงได้ทันที"], 186, 708, 32, { fill: C.muted, weight: 700, lh: 1.45 })}
  ${moneyStack(438, 526, 0.95, false)}

  ${text("ทางเลือก B", 1138, 282, 30, { fill: "#857A68", weight: 900 })}
  ${text("รับอีก 10 ปี", 1138, 374, 74, { fill: "#665F51", weight: 900 })}
  ${text("1,000,000 บาท", 1138, 468, 52, { fill: "#6F6757", weight: 900, family: "Arial, sans-serif" })}
  ${text(["รอเวลา", "เจอเงินเฟ้อ", "รับความไม่แน่นอน"], 1138, 708, 32, { fill: "#7B7468", weight: 700, lh: 1.45 })}
  ${moneyStack(1390, 526, 0.95, true)}

  ${line(812, 542, 1110, 542, C.line, 8, 1)}
  <circle cx="960" cy="542" r="98" fill="${C.ink}"/>
  <circle cx="960" cy="542" r="78" fill="none" stroke="${C.gold2}" stroke-width="5"/>
  ${text("VS", 960, 569, 72, { fill: C.white, weight: 900, anchor: "middle", family: "Arial Black, Arial, sans-serif" })}

  ${text(["ถ้าให้เลือก", "รับ 1 ล้านวันนี้", "หรือ 1 ล้านในอีก 10 ปี"], 960, 174, 76, { fill: C.ink, weight: 900, anchor: "middle", lh: 1.07 })}
  ${text("คุณจะเลือกอะไร?", 960, 424, 66, { fill: C.red, weight: 900, anchor: "middle" })}

  ${line(202, 948, 1718, 948, C.line, 3, 1)}
  ${text("จำนวนเงินเท่ากัน แต่เวลาไม่เท่ากัน มูลค่าก็ไม่เท่ากัน", 960, 1012, 42, { fill: C.greenDark, weight: 900, anchor: "middle" })}
  </svg>`;
}

async function main() {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(NOTES_DIR, { recursive: true });

  const svgPath = path.join(IMG_DIR, "slide-01.svg");
  const pngPath = path.join(IMG_DIR, "slide-01.png");
  const pptxPath = path.join(OUT_DIR, `${OUT_NAME}.pptx`);
  const notesPath = path.join(NOTES_DIR, `${OUT_NAME}-outline.md`);
  const planPath = path.join(NOTES_DIR, `${OUT_NAME}-plan.json`);

  fs.writeFileSync(svgPath, svg());
  await sharp(Buffer.from(svg()))
    .resize(W, H)
    .png()
    .toFile(pngPath);

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.subject = "Time Value of Money hook slide";
  pptx.title = "Time Value of Money Hook";
  pptx.company = "Slide_Generator";
  pptx.lang = "th-TH";
  pptx.theme = {
    headFontFace: "Noto Sans Thai",
    bodyFontFace: "Noto Sans Thai",
    lang: "th-TH",
  };
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333333, height: 7.5 });
  pptx.layout = "CUSTOM_WIDE";

  const slide = pptx.addSlide();
  slide.background = { color: "F5F0E6" };
  slide.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });
  if (typeof slide.addNotes === "function") {
    slide.addNotes(scriptLines.join("\n"));
  }
  await pptx.writeFile({ fileName: pptxPath });

  const notes = [
    "# Time Value of Money Hook Social",
    "",
    "## Brief",
    "- Topic: มูลค่าเงินตามเวลา / Time Value of Money",
    "- Audience: คนทั่วไปบน social ที่สนใจการเงินส่วนบุคคลและการลงทุนเบื้องต้น",
    "- Objective: ทำให้คนหยุดดูและเข้าใจว่าเงินจำนวนเท่ากัน แต่เวลาต่างกัน มูลค่าจริงต่างกัน",
    "- Slide count: 1 hook slide",
    "- Language: Thai",
    "- Aspect ratio: 16:9",
    "- Style: finance explainer, premium but direct, decision-frame visual",
    "",
    "## Slide Outline",
    "### Slide 1: Hook",
    "- Role: hook / decision dilemma",
    "- Main message: จำนวนเงินเท่ากัน แต่เวลาไม่เท่ากัน มูลค่าก็ไม่เท่ากัน",
    "- On-slide text: ถ้าให้เลือก รับ 1 ล้านวันนี้ หรือ 1 ล้านในอีก 10 ปี คุณจะเลือกอะไร?",
    "- Visual concept: split decision between money today and money in 10 years, with today highlighted and future muted",
    "",
    "## Short Video Script",
    ...scriptLines.map((line) => `- ${line}`),
    "",
    "## Caption",
    "เงิน 1 ล้านวันนี้ กับ 1 ล้านในอีก 10 ปี ไม่ได้มีค่าเท่ากัน เพราะเวลาเองก็มีราคา นี่คือแก่นของ Time Value of Money",
    "",
    "## Files",
    `- Slide PNG: ${pngPath}`,
    `- Slide SVG: ${svgPath}`,
    `- PowerPoint: ${pptxPath}`,
  ];
  fs.writeFileSync(notesPath, notes.join("\n"));

  fs.writeFileSync(planPath, JSON.stringify({
    project: OUT_NAME,
    slide_count: 1,
    aspect_ratio: "16:9",
    language: "th-TH",
    objective: "Short social hook for explaining Time Value of Money.",
    files: {
      png: pngPath,
      svg: svgPath,
      pptx: pptxPath,
      notes: notesPath,
    },
    script: scriptLines,
  }, null, 2));

  console.log(JSON.stringify({ pngPath, svgPath, pptxPath, notesPath, planPath }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
