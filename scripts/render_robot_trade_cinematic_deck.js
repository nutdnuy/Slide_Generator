#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const W = 1920;
const H = 1080;
const PPT_W = 13.333;
const PPT_H = 7.5;
const FONT = "Thonburi, Sarabun, Arial, Helvetica, sans-serif";

const C = {
  bg: "#121212",
  bg2: "#171B1F",
  surface: "#1D1D1D",
  surface2: "#242424",
  panel: "#191F22",
  green: "#69F0AE",
  cyan: "#03DAC6",
  amber: "#FFB74D",
  red: "#CF6679",
  text: "#F0F0F0",
  muted: "#A6A6A6",
  dim: "#515A5D",
  line: "#333D40",
};

function loadModule(name) {
  const bases = [
    null,
    path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"),
  ];
  for (const base of bases) {
    try {
      return base ? require(path.join(base, name)) : require(name);
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") throw err;
    }
  }
  throw new Error(`Could not load ${name}`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[m]));
}

function asLines(value) {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

function wrap(text, maxChars) {
  const out = [];
  String(text ?? "").split("\n").forEach((para) => {
    let line = "";
    para.split(/\s+/).filter(Boolean).forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) out.push(line);
  });
  return out.length ? out : [""];
}

function textBlock(text, x, y, opts = {}) {
  const size = opts.size || 34;
  const fill = opts.fill || C.text;
  const weight = opts.weight || 400;
  const max = opts.max || 44;
  const lh = opts.lh || 1.18;
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
  const lines = wrap(text, max).slice(0, opts.maxLines || 12);
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function bulletBlock(items, x, y, opts = {}) {
  const size = opts.size || 30;
  const max = opts.max || 46;
  const gap = opts.gap || 54;
  const fill = opts.fill || C.text;
  let cursor = y;
  return asLines(items).slice(0, opts.limit || 6).map((item) => {
    const lines = wrap(item, max).slice(0, 3);
    const block = `<text x="${x}" y="${cursor}" font-family="${FONT}" font-size="${size}" fill="${fill}">
      ${lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * 1.16}">${i === 0 ? "• " : "  "}${esc(line)}</tspan>`).join("")}
    </text>`;
    cursor += Math.max(gap, lines.length * size * 1.18 + 16);
    return block;
  }).join("");
}

function baseBackground(seed = 0) {
  const paths = Array.from({ length: 9 }, (_, i) => {
    const x1 = 50 + i * 225;
    const y1 = 760 + Math.sin((i + seed) * 0.8) * 120;
    const y2 = 610 + Math.cos((i + seed) * 0.55) * 180;
    return `<path d="M${x1} ${y1}C${x1 + 70} ${y2} ${x1 + 150} ${y1 - 120} ${x1 + 230} ${y2 + 80}" fill="none" stroke="${i % 2 ? C.cyan : C.green}" stroke-width="${i % 3 === 0 ? 3 : 1.5}" opacity="${i % 3 === 0 ? 0.18 : 0.09}"/>`;
  }).join("");

  const grid = Array.from({ length: 17 }, (_, i) => `<line x1="${i * 120}" y1="0" x2="${i * 120}" y2="${H}" stroke="${C.line}" stroke-width="1" opacity="0.24"/>`).join("")
    + Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 120}" x2="${W}" y2="${i * 120}" stroke="${C.line}" stroke-width="1" opacity="0.20"/>`).join("");

  const candles = Array.from({ length: 34 }, (_, i) => {
    const x = 1080 + i * 24;
    const h = 28 + ((i * 17 + seed * 7) % 90);
    const y = 260 + ((i * 37 + seed * 11) % 420);
    const color = i % 3 === 0 ? C.red : C.green;
    return `<line x1="${x}" y1="${y - 22}" x2="${x}" y2="${y + h + 18}" stroke="${color}" stroke-width="2" opacity="0.28"/>
      <rect x="${x - 6}" y="${y}" width="12" height="${h}" fill="${color}" opacity="0.22"/>`;
  }).join("");

  return `<rect width="${W}" height="${H}" fill="${C.bg}"/>
    <radialGradient id="g${seed}" cx="73%" cy="22%" r="62%"><stop offset="0%" stop-color="#103930"/><stop offset="50%" stop-color="${C.bg2}"/><stop offset="100%" stop-color="${C.bg}"/></radialGradient>
    <rect width="${W}" height="${H}" fill="url(#g${seed})" opacity="0.92"/>
    ${grid}
    ${paths}
    ${candles}
    <rect x="0" y="0" width="${W}" height="${H}" fill="${C.bg}" opacity="0.18"/>
    <path d="M0 145H1920" stroke="${C.line}" stroke-width="2" opacity="0.62"/>
    <path d="M0 980H1920" stroke="${C.line}" stroke-width="2" opacity="0.62"/>`;
}

function header(slide, manifest, idx, total) {
  const title = String(slide.governing_message || "");
  const size = title.length > 104 ? 42 : title.length > 74 ? 48 : 58;
  const lines = wrap(title, title.length > 104 ? 50 : 44).slice(0, 3);
  const titleSvg = `<text x="86" y="104" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${C.text}">
    ${lines.map((line, i) => `<tspan x="86" dy="${i === 0 ? 0 : size * 1.05}">${esc(line)}</tspan>`).join("")}
  </text>`;
  const subtitleY = 104 + lines.length * size * 1.04 + 30;
  const subtitle = slide.subtitle ? textBlock(slide.subtitle, 88, subtitleY, { size: 28, fill: C.cyan, max: 86, maxLines: 2 }) : "";
  const mark = esc(manifest.deck_mark || "ROBOT TRADE LESSON");
  return `${titleSvg}
    ${subtitle}
    <text x="1832" y="72" font-family="${FONT}" font-size="26" font-weight="800" fill="${C.green}" text-anchor="end">${mark}</text>
    <text x="1832" y="104" font-family="${FONT}" font-size="18" fill="${C.muted}" text-anchor="end">${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</text>`;
}

function contentTop(slide) {
  const title = String(slide.governing_message || "");
  const size = title.length > 104 ? 42 : title.length > 74 ? 48 : 58;
  const lines = wrap(title, title.length > 104 ? 50 : 44).slice(0, 3);
  return Math.max(290, 104 + lines.length * size * 1.04 + (slide.subtitle ? 112 : 58));
}

function footer(slide) {
  return `<text x="86" y="1030" font-family="${FONT}" font-size="17" fill="${C.muted}">Source: ${esc(slide.source || "Educational synthesis; not investment advice")}</text>
    <text x="1832" y="1030" font-family="${FONT}" font-size="17" fill="${C.dim}" text-anchor="end">Educational only • Not investment advice</text>`;
}

function panel(x, y, w, h, opts = {}) {
  const stroke = opts.stroke || C.line;
  const fill = opts.fill || C.panel;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5" opacity="${opts.opacity || 0.96}"/>
    <rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="${opts.accent || C.green}" opacity="0.92"/>`;
}

function metricCards(metrics, x, y) {
  const data = Array.isArray(metrics) ? metrics : asLines(metrics).map((value) => ({ value }));
  return data.slice(0, 3).map((raw, i) => {
    const m = typeof raw === "object" ? raw : { value: raw };
    const cx = x + i * 245;
    return `${panel(cx, y, 220, 150, { accent: i === 1 ? C.cyan : i === 2 ? C.amber : C.green, fill: C.surface })}
      <text x="${cx + 24}" y="${y + 58}" font-family="${FONT}" font-size="34" font-weight="800" fill="${i === 2 ? C.amber : C.green}">${esc(m.value || "")}</text>
      <text x="${cx + 24}" y="${y + 103}" font-family="${FONT}" font-size="18" font-weight="800" fill="${C.text}">${esc(m.label || "")}</text>
      <text x="${cx + 24}" y="${y + 131}" font-family="${FONT}" font-size="15" fill="${C.muted}">${esc(m.note || "")}</text>`;
  }).join("");
}

function tableSvg(rows, x, y, w, maxH) {
  const data = Array.isArray(rows) ? rows : [];
  if (!data.length) return "";
  const colCount = Math.max(...data.map((r) => r.length));
  const rowH = Math.min(72, maxH / data.length);
  const firstW = colCount > 3 ? Math.min(290, w * 0.23) : w / colCount;
  const otherW = colCount > 1 ? (w - firstW) / (colCount - 1) : w;
  const fontSize = data.length > 8 ? 18 : 22;
  const chunks = [];
  data.forEach((row, r) => {
    let cx = x;
    for (let c = 0; c < colCount; c += 1) {
      const cw = c === 0 ? firstW : otherW;
      const head = r === 0;
      const stub = c === 0 && !head;
      const fill = head ? "#21302E" : stub ? "#1D2625" : C.surface;
      const color = head ? C.green : stub ? C.cyan : C.text;
      chunks.push(`<rect x="${cx}" y="${y + r * rowH}" width="${cw}" height="${rowH}" fill="${fill}" stroke="${C.line}" stroke-width="1.2"/>`);
      chunks.push(textBlock(row[c] || "", cx + 14, y + r * rowH + 34, {
        size: fontSize,
        fill: color,
        weight: head || stub ? 800 : 400,
        max: Math.max(9, Math.floor(cw / (fontSize * 0.55))),
        maxLines: 2,
        lh: 1.04,
      }));
      cx += cw;
    }
  });
  return chunks.join("");
}

function riskTable(risks, x, y, w, h) {
  const data = Array.isArray(risks) ? risks : asLines(risks).map((risk) => ({ risk, mitigation: "" }));
  const rows = [["Risk", "Mitigation"], ...data.map((r) => [r.risk || "", r.mitigation || ""])];
  return tableSvg(rows, x, y, w, h);
}

function roadmap(steps, x, y) {
  const data = asLines(steps).slice(0, 5);
  const gap = 330;
  return data.map((step, i) => {
    const cx = x + i * gap;
    return `${i < data.length - 1 ? `<line x1="${cx + 72}" y1="${y + 42}" x2="${cx + gap - 42}" y2="${y + 42}" stroke="${C.line}" stroke-width="5"/>` : ""}
      <circle cx="${cx + 42}" cy="${y + 42}" r="40" fill="${i === 0 ? C.green : C.surface}" stroke="${i === 0 ? C.green : C.cyan}" stroke-width="3"/>
      <text x="${cx + 42}" y="${y + 55}" font-family="${FONT}" font-size="25" font-weight="800" fill="${i === 0 ? C.bg : C.cyan}" text-anchor="middle">${i + 1}</text>
      ${textBlock(step, cx - 22, y + 122, { size: 24, fill: C.text, weight: 800, max: 16, maxLines: 2 })}`;
  }).join("");
}

function circuitMotif(x, y, w, h, color = C.green) {
  return `<g opacity="0.22" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M${x} ${y + h * 0.55}H${x + w * 0.25}V${y + h * 0.25}H${x + w * 0.55}V${y + h * 0.72}H${x + w}"/>
    <circle cx="${x + w * 0.25}" cy="${y + h * 0.55}" r="8" fill="${color}"/>
    <circle cx="${x + w * 0.55}" cy="${y + h * 0.25}" r="8" fill="${color}"/>
    <circle cx="${x + w * 0.82}" cy="${y + h * 0.72}" r="8" fill="${color}"/>
  </g>`;
}

function cover(slide, manifest) {
  const title = wrap(slide.governing_message, 32);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${baseBackground(1)}
    <rect x="0" y="0" width="${W}" height="${H}" fill="#000" opacity="0.12"/>
    ${circuitMotif(210, 690, 1500, 230, C.green)}
    <text x="1832" y="84" font-family="${FONT}" font-size="34" font-weight="800" fill="${C.green}" text-anchor="end">${esc(manifest.deck_mark || "ROBOT TRADE LESSON")}</text>
    <text x="960" y="440" font-family="${FONT}" font-size="82" font-weight="900" fill="${C.text}" text-anchor="middle">
      ${title.map((line, i) => `<tspan x="960" dy="${i === 0 ? 0 : 96}">${esc(line)}</tspan>`).join("")}
    </text>
    ${slide.subtitle ? textBlock(slide.subtitle, 960, 640, { size: 32, fill: C.cyan, anchor: "middle", max: 78, maxLines: 2 }) : ""}
    <text x="960" y="820" font-family="${FONT}" font-size="24" fill="${C.muted}" text-anchor="middle">Rule-based strategy • Risk control • Backtest discipline • Production checklist</text>
  </svg>`;
}

function sectionLike(slide, manifest, idx, total) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${baseBackground(idx + 3)}
    ${header(slide, manifest, idx, total)}
    ${circuitMotif(250, 610, 1420, 250, C.cyan)}
    ${slide.subtitle ? textBlock(slide.subtitle, 960, 555, { size: 34, fill: C.cyan, anchor: "middle", max: 78 }) : ""}
    ${footer(slide)}
  </svg>`;
}

function analytic(slide, manifest, idx, total) {
  const top = contentTop(slide);
  const type = String(slide.visual_type || "").toLowerCase();
  let body = "";
  if (Array.isArray(slide.table) || type === "table") {
    body = `${tableSvg(slide.table, 92, top, 1736, 930 - top)}`;
  } else if (Array.isArray(slide.risks) || type.includes("risk")) {
    body = `${riskTable(slide.risks, 92, top, 1736, 930 - top)}`;
  } else if (Array.isArray(slide.steps) || type.includes("roadmap") || type.includes("path")) {
    body = `${panel(92, top, 770, 340, { accent: C.cyan })}
      ${bulletBlock(slide.supporting_points, 130, top + 70, { size: 29, max: 45, gap: 58, limit: 5 })}
      ${roadmap(slide.steps || slide.supporting_points, 170, Math.max(700, top + 420))}`;
  } else if (Array.isArray(slide.metrics) || type.includes("metric")) {
    body = `${panel(92, top, 790, 500, { accent: C.green })}
      <text x="132" y="${top + 54}" font-family="${FONT}" font-size="24" font-weight="800" fill="${C.green}">KEY POINTS</text>
      ${bulletBlock(slide.supporting_points, 132, top + 115, { size: 28, max: 46, gap: 58, limit: 5 })}
      ${metricCards(slide.metrics, 1038, top)}
      ${panel(1038, top + 205, 790, 295, { accent: C.amber, fill: C.surface2 })}
      <text x="1078" y="${top + 260}" font-family="${FONT}" font-size="24" font-weight="800" fill="${C.amber}">WHAT IT MEANS</text>
      ${bulletBlock(slide.evidence, 1078, top + 318, { size: 26, max: 42, gap: 54, limit: 4 })}`;
  } else {
    body = `${panel(92, top, 790, 500, { accent: C.green })}
      <text x="132" y="${top + 54}" font-family="${FONT}" font-size="24" font-weight="800" fill="${C.green}">KEY POINTS</text>
      ${bulletBlock(slide.supporting_points, 132, top + 115, { size: 28, max: 46, gap: 58, limit: 5 })}
      ${panel(1038, top, 790, 500, { accent: C.cyan, fill: C.surface2 })}
      <text x="1078" y="${top + 54}" font-family="${FONT}" font-size="24" font-weight="800" fill="${C.cyan}">EVIDENCE / IMPLICATIONS</text>
      ${bulletBlock(slide.evidence, 1078, top + 115, { size: 26, max: 42, gap: 56, limit: 5 })}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${baseBackground(idx + 5)}
    ${header(slide, manifest, idx, total)}
    ${body}
    ${footer(slide)}
  </svg>`;
}

function isCover(slide) {
  return String(slide.role || "").toLowerCase().includes("cover");
}

function isDivider(slide) {
  const key = `${slide.role || ""} ${slide.visual_type || ""}`.toLowerCase();
  return key.includes("section") || key.includes("divider") || String(slide.slide_no) === "50";
}

function renderSvg(slide, manifest, idx, total) {
  if (isCover(slide)) return cover(slide, manifest);
  if (isDivider(slide)) return sectionLike(slide, manifest, idx, total);
  return analytic(slide, manifest, idx, total);
}

function parseArgs(argv) {
  const args = {
    manifest: path.resolve("notes/robot-trade-10-strategies-lesson-deck.json"),
    root: process.cwd(),
    output: null,
    imagesDir: null,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") args.root = path.resolve(argv[++i] || "");
    else if (arg === "--output") args.output = path.resolve(argv[++i] || "");
    else if (arg === "--images-dir") args.imagesDir = path.resolve(argv[++i] || "");
    else args.manifest = path.resolve(arg);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const sharp = loadModule("sharp");
  const pptxgen = loadModule("pptxgenjs");
  const manifest = JSON.parse(fs.readFileSync(args.manifest, "utf8"));
  const slides = manifest.slides.slice().sort((a, b) => a.slide_no - b.slide_no);
  const imagesDir = args.imagesDir || path.resolve(args.root, "assets", "images", `${manifest.project_name}-cinematic`);
  const output = args.output || path.resolve(args.root, "outputs", `${manifest.project_name}-cinematic.pptx`);
  ensureDir(imagesDir);
  ensureDir(path.dirname(output));

  const imagePaths = [];
  for (let i = 0; i < slides.length; i += 1) {
    const no = String(i + 1).padStart(2, "0");
    const svg = renderSvg(slides[i], manifest, i, slides.length);
    const svgPath = path.join(imagesDir, `slide-${no}.svg`);
    const pngPath = path.join(imagesDir, `slide-${no}.png`);
    fs.writeFileSync(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    imagePaths.push(pngPath);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Slide_Generator";
  pptx.title = `${manifest.deck_title || manifest.project_name} - Cinematic`;
  pptx.subject = manifest.objective;
  pptx.lang = "th-TH";
  slides.forEach((slideData, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: "121212" };
    slide.addImage({ path: imagePaths[i], x: 0, y: 0, w: PPT_W, h: PPT_H });
    if (typeof slide.addNotes === "function" && slideData.speaker_note) {
      slide.addNotes([String(slideData.speaker_note)]);
    }
  });
  await pptx.writeFile({ fileName: output });
  console.log(`[OK] Wrote ${output}`);
  console.log(`[OK] Wrote ${imagePaths.length} cinematic slide images to ${imagesDir}`);
}

main().catch((err) => {
  console.error(`[ERROR] ${err.stack || err.message}`);
  process.exit(1);
});
