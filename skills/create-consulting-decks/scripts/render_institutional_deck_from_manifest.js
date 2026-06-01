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
  navy: "#00264D",
  navy2: "#0B3567",
  teal: "#00A0B0",
  blue: "#0073B5",
  black: "#111111",
  muted: "#5D6875",
  line: "#B7C0CA",
  header: "#D9DEE3",
  band: "#EEF2F5",
  pale: "#EAF4F6",
  white: "#FFFFFF",
  pageBg: "#FFFFFF",
};

function applyTheme(manifest) {
  const theme = String(manifest.brand_theme || manifest.ci_theme || manifest.style || "").toLowerCase();
  if (!theme.includes("krungsri")) return;
  Object.assign(C, {
    navy: "#1A2E4A",
    navy2: "#2C4F77",
    teal: "#B88A0D",
    blue: "#2C4F77",
    black: "#333333",
    muted: "#4A4A4A",
    line: "#CCCCCC",
    header: "#F2F2F2",
    band: "#F9F9F9",
    pale: "#FEF3D0",
    white: "#FFFFFF",
    pageBg: "#FFFFFF",
  });
}

function usage() {
  console.error(
    "Usage: node render_institutional_deck_from_manifest.js <manifest.json> [--root <workspace>] [--output <deck.pptx>] [--images-dir <dir>]"
  );
}

function parseArgs(argv) {
  const args = { manifest: null, root: process.cwd(), output: null, imagesDir: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") args.root = path.resolve(argv[++i] || "");
    else if (arg === "--output") args.output = path.resolve(argv[++i] || "");
    else if (arg === "--images-dir") args.imagesDir = path.resolve(argv[++i] || "");
    else if (!args.manifest) args.manifest = path.resolve(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function loadModule(name) {
  const candidates = [
    null,
    path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"),
  ];
  for (const base of candidates) {
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

function resolveAssetPath(value, root, manifestDir) {
  if (!value) return null;
  const candidates = path.isAbsolute(value)
    ? [value]
    : [path.resolve(root, value), path.resolve(manifestDir, value)];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function figurePanel(slide) {
  const raw = slide.figure_panel || slide.figure || null;
  if (Array.isArray(raw)) return raw[0] || null;
  if (raw) return raw;
  if (slide.figure_path) return { path: slide.figure_path, title: slide.figure_title, caption: slide.figure_caption };
  return null;
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
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
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
  return out;
}

function textBlock(text, x, y, opts = {}) {
  const size = opts.size || 34;
  const fill = opts.fill || C.black;
  const weight = opts.weight || 400;
  const max = opts.max || 44;
  const lh = opts.lh || 1.15;
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
  const family = opts.family || FONT;
  const lines = wrap(text, max);
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function bulletBlock(items, x, y, opts = {}) {
  const size = opts.size || 34;
  const max = opts.max || 44;
  const gap = opts.gap || size * 1.35;
  const fill = opts.fill || C.black;
  let cursor = y;
  const chunks = [];
  asLines(items).forEach((item) => {
    const lines = wrap(item, max);
    chunks.push(`<text x="${x}" y="${cursor}" font-family="${FONT}" font-size="${size}" fill="${fill}">
      ${lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * 1.12}">${i === 0 ? "- " : "  "}${esc(line)}</tspan>`).join("")}
    </text>`);
    cursor += Math.max(gap, lines.length * size * 1.14 + 16);
  });
  return chunks.join("");
}

function mosaic(dark = false) {
  const fill1 = dark ? C.navy2 : "#EAF4F6";
  const fill2 = dark ? C.blue : "#DDF0F3";
  const opacity = dark ? 0.38 : 0.58;
  const blocks = [
    [1480, 0, 115, 112, fill1],
    [1710, 0, 115, 112, fill2],
    [1825, 0, 95, 112, fill2],
    [1710, 112, 115, 112, fill1],
    [1825, 112, 95, 112, fill1],
    [1825, 224, 95, 105, fill1],
  ];
  return blocks.map(([x, y, w, h, fill]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${opacity}"/>`).join("");
}

function roleKind(slide) {
  const key = `${slide.role || ""} ${slide.visual_type || ""} ${slide.governing_message || ""}`.toLowerCase();
  if (/risk|mitigation|diligence|validation/.test(key)) return "risk";
  if (/result|metric|performance|ic|rankic|trading|return/.test(key)) return "chart";
  if (/architecture|method|roadmap|framework|pipeline|process|combination/.test(key)) return "network";
  if (/mining|formula|factor/.test(key)) return "formula";
  if (/experiment|dataset|training|baseline|retraining/.test(key)) return "experiment";
  if (/problem|fragile|decay|static/.test(key)) return "alert";
  return "target";
}

function icon(kind, x, y, size = 120, opts = {}) {
  const stroke = opts.stroke || C.teal;
  const fill = opts.fill || "none";
  const opacity = opts.opacity === undefined ? 1 : opts.opacity;
  const sw = opts.strokeWidth || 8;
  const s = size / 120;
  const tx = (v) => x + v * s;
  const ty = (v) => y + v * s;
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"`;
  if (kind === "chart") {
    return `<g ${common}>
      <path d="M${tx(12)} ${ty(102)}H${tx(108)}"/>
      <path d="M${tx(20)} ${ty(88)}L${tx(44)} ${ty(63)}L${tx(66)} ${ty(74)}L${tx(100)} ${ty(28)}"/>
      <circle cx="${tx(44)}" cy="${ty(63)}" r="${7 * s}"/>
      <circle cx="${tx(66)}" cy="${ty(74)}" r="${7 * s}"/>
      <circle cx="${tx(100)}" cy="${ty(28)}" r="${7 * s}"/>
    </g>`;
  }
  if (kind === "network") {
    return `<g ${common}>
      <circle cx="${tx(26)}" cy="${ty(30)}" r="${14 * s}"/>
      <circle cx="${tx(91)}" cy="${ty(36)}" r="${14 * s}"/>
      <circle cx="${tx(60)}" cy="${ty(88)}" r="${17 * s}"/>
      <path d="M${tx(40)} ${ty(34)}L${tx(77)} ${ty(36)}M${tx(33)} ${ty(43)}L${tx(51)} ${ty(74)}M${tx(83)} ${ty(49)}L${tx(68)} ${ty(73)}"/>
    </g>`;
  }
  if (kind === "formula") {
    return `<g ${common}>
      <rect x="${tx(16)}" y="${ty(24)}" width="${88 * s}" height="${70 * s}" rx="${10 * s}"/>
      <path d="M${tx(32)} ${ty(48)}H${tx(88)}M${tx(32)} ${ty(70)}H${tx(72)}"/>
      <path d="M${tx(36)} ${ty(93)}C${tx(48)} ${ty(76)} ${tx(50)} ${ty(42)} ${tx(64)} ${ty(26)}"/>
      <path d="M${tx(70)} ${ty(44)}L${tx(86)} ${ty(60)}L${tx(70)} ${ty(76)}"/>
    </g>`;
  }
  if (kind === "risk") {
    return `<g ${common}>
      <path d="M${tx(60)} ${ty(14)}L${tx(98)} ${ty(30)}V${ty(58)}C${tx(98)} ${ty(84)} ${tx(78)} ${ty(101)} ${tx(60)} ${ty(108)}C${tx(42)} ${ty(101)} ${tx(22)} ${ty(84)} ${tx(22)} ${ty(58)}V${ty(30)}Z"/>
      <path d="M${tx(60)} ${ty(39)}V${ty(65)}M${tx(60)} ${ty(83)}V${ty(84)}"/>
    </g>`;
  }
  if (kind === "experiment") {
    return `<g ${common}>
      <rect x="${tx(18)}" y="${ty(25)}" width="${84 * s}" height="${76 * s}" rx="${10 * s}"/>
      <path d="M${tx(18)} ${ty(47)}H${tx(102)}M${tx(38)} ${ty(16)}V${ty(34)}M${tx(82)} ${ty(16)}V${ty(34)}"/>
      <path d="M${tx(38)} ${ty(68)}H${tx(82)}M${tx(38)} ${ty(84)}H${tx(65)}"/>
    </g>`;
  }
  if (kind === "alert") {
    return `<g ${common}>
      <path d="M${tx(60)} ${ty(16)}L${tx(108)} ${ty(100)}H${tx(12)}Z"/>
      <path d="M${tx(60)} ${ty(46)}V${ty(70)}M${tx(60)} ${ty(87)}V${ty(88)}"/>
    </g>`;
  }
  return `<g ${common}>
    <circle cx="${tx(60)}" cy="${ty(60)}" r="${43 * s}"/>
    <circle cx="${tx(60)}" cy="${ty(60)}" r="${24 * s}"/>
    <circle cx="${tx(60)}" cy="${ty(60)}" r="${7 * s}" fill="${stroke}" stroke="${stroke}"/>
  </g>`;
}

function floatingIcon(slide, x, y, size = 190) {
  return `<g opacity="0.16">${icon(roleKind(slide), x, y, size, { stroke: C.teal, strokeWidth: 6 })}</g>`;
}

function coverMotif() {
  return `<g opacity="0.32">
    ${icon("network", 170, 690, 185, { stroke: C.teal, strokeWidth: 6 })}
    ${icon("formula", 1545, 670, 165, { stroke: C.teal, strokeWidth: 6 })}
    <path d="M390 790C650 705 890 850 1130 755S1420 705 1535 755" fill="none" stroke="${C.teal}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="620" cy="735" r="10" fill="${C.teal}"/>
    <circle cx="1128" cy="755" r="10" fill="${C.teal}"/>
  </g>`;
}

function footer(slide, idx, total, manifest) {
  const mark = esc(manifest.deck_mark || manifest.deck_title || manifest.project_name || "Strategy brief");
  return `<line x1="72" y1="992" x2="1680" y2="992" stroke="${C.line}" stroke-width="1"/>
    <text x="72" y="1030" font-family="${FONT}" font-size="18" fill="${C.muted}">Source: ${esc(slide.source || "not provided")}</text>
    <text x="72" y="1058" font-family="${FONT}" font-size="18" fill="${C.muted}">${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</text>
    <text x="1835" y="1044" font-family="${FONT}" font-size="32" font-weight="800" fill="${C.navy}" text-anchor="end">${mark}</text>`;
}

function title(slide) {
  const t = String(slide.governing_message || "");
  const size = t.length > 120 ? 42 : t.length > 82 ? 48 : 58;
  const titleLines = wrap(t, t.length > 120 ? 46 : 42);
  const titleSvg = `<text x="72" y="120" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${C.navy}">
    ${titleLines.map((line, i) => `<tspan x="72" dy="${i === 0 ? 0 : size * 1.08}">${esc(line)}</tspan>`).join("")}
  </text>`;
  const y = 120 + titleLines.length * size * 1.08 + 36;
  const subtitle = slide.subtitle
    ? textBlock(slide.subtitle, 72, y, { size: 34, fill: C.teal, weight: 400, max: 84 })
    : "";
  return `${titleSvg}${subtitle}`;
}

function contentTop(slide) {
  const t = String(slide.governing_message || "");
  const size = t.length > 120 ? 42 : t.length > 82 ? 48 : 58;
  const titleLines = wrap(t, t.length > 120 ? 46 : 42);
  const base = 120 + titleLines.length * size * 1.08;
  return Math.max(300, Math.round(base + (slide.subtitle ? 125 : 75)));
}

function coverBackground() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${C.navy}"/>
    ${mosaic(true)}
    ${coverMotif()}
  </svg>`;
}

function coverOverlay(slide, manifest) {
  const mark = esc(manifest.deck_mark || "AlphaForge Brief");
  const titleLines = wrap(slide.governing_message, 42);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <text x="1835" y="84" font-family="${FONT}" font-size="42" font-weight="800" fill="${C.white}" text-anchor="end">${mark}</text>
    <text x="960" y="455" font-family="${FONT}" font-size="72" font-weight="800" fill="${C.white}" text-anchor="middle">
      ${titleLines.map((line, i) => `<tspan x="960" dy="${i === 0 ? 0 : 88}">${esc(line)}</tspan>`).join("")}
    </text>
    ${slide.subtitle ? textBlock(slide.subtitle, 960, 655, { size: 34, fill: C.teal, weight: 400, max: 78, anchor: "middle" }) : ""}
  </svg>`;
}

function metricCards(metrics, x, y) {
  const cards = Array.isArray(metrics) ? metrics.slice(0, 3) : asLines(metrics).slice(0, 3);
  return cards.map((metric, i) => {
    const m = typeof metric === "object" ? metric : { value: metric };
    const cx = x + i * 270;
    const miniKind = /return|account|window|test/i.test(`${m.label || ""} ${m.note || ""}`) ? "chart" : /paper|method/i.test(`${m.label || ""}`) ? "formula" : "target";
    return `<rect x="${cx}" y="${y}" width="250" height="160" fill="${C.band}" stroke="${C.line}" stroke-width="2"/>
      <g opacity="0.16">${icon(miniKind, cx + 178, y + 88, 46, { stroke: C.teal, strokeWidth: 7 })}</g>
      <text x="${cx + 18}" y="${y + 58}" font-family="${FONT}" font-size="36" font-weight="800" fill="${C.teal}">${esc(m.value || "")}</text>
      <text x="${cx + 18}" y="${y + 108}" font-family="${FONT}" font-size="18" font-weight="800" fill="${C.navy}">${esc(m.label || "")}</text>
      <text x="${cx + 18}" y="${y + 138}" font-family="${FONT}" font-size="15" fill="${C.muted}">${esc(m.note || "")}</text>`;
  }).join("");
}

function tableSvg(rows, x, y, w, maxH) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const colCount = Math.max(...rows.map((row) => row.length));
  const rowH = Math.min(70, maxH / rows.length);
  const firstW = colCount > 3 ? Math.min(300, w * 0.22) : w / colCount;
  const otherW = colCount > 1 ? (w - firstW) / (colCount - 1) : w;
  const fontSize = rows.length > 8 ? 18 : 23;
  const chunks = [];
  rows.forEach((row, r) => {
    let cx = x;
    const rowLabel = String(row[0] || "").trim().toLowerCase();
    const highlight = rowLabel === "ours" || row.some((cell) => /recommended|approve|target/i.test(String(cell || "")));
    for (let c = 0; c < colCount; c += 1) {
      const cw = c === 0 ? firstW : otherW;
      const header = r === 0;
      const stub = c === 0 && rows.length <= 7;
      const fill = header ? C.header : highlight ? C.pale : stub ? C.band : C.white;
      const bold = header || stub || highlight ? 800 : 400;
      chunks.push(`<rect x="${cx}" y="${y + r * rowH}" width="${cw}" height="${rowH}" fill="${fill}" stroke="${C.line}" stroke-width="1.4"/>`);
      chunks.push(textBlock(row[c] || "", cx + 10, y + r * rowH + 34, {
        size: fontSize,
        fill: highlight ? C.navy : C.black,
        weight: bold,
        max: Math.max(10, Math.floor(cw / (fontSize * 0.55))),
        lh: 1.05,
      }));
      cx += cw;
    }
  });
  return chunks.join("");
}

function roadmap(steps, x, y) {
  const s = asLines(steps).slice(0, 5);
  const gap = 330;
  return s.map((step, i) => {
    const cx = x + i * gap;
    return `${i < s.length - 1 ? `<line x1="${cx + 90}" y1="${y + 38}" x2="${cx + gap - 85}" y2="${y + 38}" stroke="${C.line}" stroke-width="7"/>` : ""}
      <circle cx="${cx + 45}" cy="${y + 38}" r="42" fill="${i === 0 ? C.teal : C.white}" stroke="${C.teal}" stroke-width="4"/>
      <text x="${cx + 45}" y="${y + 51}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="800" fill="${i === 0 ? C.white : C.teal}">${i + 1}</text>
      ${textBlock(step, cx - 40, y + 128, { size: 24, fill: C.navy, weight: 800, max: 16, anchor: undefined })}`;
  }).join("");
}

function figurePanelGeometry(slide) {
  const panel = figurePanel(slide);
  if (!panel) return null;
  const top = contentTop(slide);
  const placement = String(panel.placement || "right").toLowerCase();
  if (placement === "wide") return { x: 100, y: top + 5, w: 1720, h: 505 };
  if (placement === "bottom") return { x: 160, y: Math.max(585, top + 275), w: 1600, h: 330 };
  if (placement === "right_wide" || placement === "right-wide") return { x: 760, y: top + 10, w: 1040, h: 445 };
  return { x: 1010, y: top + 10, w: 790, h: 445 };
}

function figurePanelOverlay(slide) {
  const panel = figurePanel(slide);
  const g = figurePanelGeometry(slide);
  if (!panel || !g) return "";
  const caption = panel.caption ? textBlock(panel.caption, g.x, g.y + g.h + 34, { size: 18, fill: C.muted, max: Math.floor(g.w / 10.2), lh: 1.05 }) : "";
  const titleText = panel.title || "Source figure";
  return `<text x="${g.x}" y="${g.y - 18}" font-family="${FONT}" font-size="23" font-weight="800" fill="${C.teal}">${esc(titleText)}</text>
    <rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="none" stroke="${C.line}" stroke-width="2.2"/>
    ${caption}`;
}

function figureLayout(slide) {
  const g = figurePanelGeometry(slide);
  const top = contentTop(slide);
  if (!g) return "";
  const panel = figurePanel(slide);
  const placement = String(panel.placement || "right").toLowerCase();
  if (placement === "wide") {
    return `${figurePanelOverlay(slide)}
      ${bulletBlock(slide.supporting_points, 120, g.y + g.h + 85, { size: 24, max: 76, gap: 45 })}`;
  }
  if (Array.isArray(slide.metrics)) {
    return `${textBlock("Key points", 80, top + 8, { size: 26, fill: C.teal, weight: 800, max: 24 })}
      ${bulletBlock(slide.supporting_points, 80, top + 72, { size: 25, max: 44, gap: 52 })}
      ${metricCards(slide.metrics, 80, 775)}
      ${figurePanelOverlay(slide)}`;
  }
  return `${textBlock("Key points", 80, top + 8, { size: 26, fill: C.teal, weight: 800, max: 24 })}
    ${bulletBlock(slide.supporting_points, 80, top + 72, { size: 28, max: 45, gap: 58 })}
    ${figurePanelOverlay(slide)}`;
}

function analyticBackground(slide) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${C.pageBg}"/>
    ${mosaic(false)}
    ${floatingIcon(slide, 1610, 130, 170)}
    <path d="M1315 850C1455 760 1550 805 1685 700S1835 650 1890 678" fill="none" stroke="${C.pale}" stroke-width="18" stroke-linecap="round" opacity="0.78"/>
    <path d="M1330 888C1490 815 1578 865 1698 770S1848 728 1902 742" fill="none" stroke="${C.pale}" stroke-width="8" stroke-linecap="round" opacity="0.62"/>
  </svg>`;
}

function analyticOverlay(slide, manifest, idx, total) {
  const type = String(slide.visual_type || "").toLowerCase();
  const top = contentTop(slide);
  let body = "";
  if (figurePanel(slide) || type.includes("figure") || type.includes("photo")) {
    body = figureLayout(slide);
  } else if (Array.isArray(slide.table) || type === "table" || Array.isArray(slide.risks)) {
    const rows = Array.isArray(slide.table)
      ? slide.table
      : [["Risk", "Mitigation"], ...(slide.risks || []).map((r) => [r.risk || "", r.mitigation || ""])];
    body = `${tableSvg(rows, 80, top, 1710, 930 - top)}`;
  } else if (Array.isArray(slide.steps) || type.includes("roadmap") || type.includes("path")) {
    body = `${bulletBlock(slide.supporting_points, 80, top + 45, { size: 29, max: 50, gap: 58 })}
      ${roadmap(slide.steps || slide.supporting_points, 90, Math.max(655, top + 335))}`;
  } else if (Array.isArray(slide.metrics) || type.includes("metric") || type.includes("financial")) {
    body = `${textBlock("Key points", 80, top, { size: 26, fill: C.teal, weight: 800, max: 24 })}
      ${bulletBlock(slide.supporting_points, 80, top + 65, { size: 29, max: 52, gap: 58 })}
      ${metricCards(slide.metrics || [], 1030, top + 20)}
      ${textBlock("What it means", 1030, top + 260, { size: 26, fill: C.teal, weight: 800, max: 32 })}
      ${bulletBlock(slide.evidence, 1030, top + 320, { size: 25, max: 46, gap: 50 })}`;
  } else {
    body = `${textBlock("Key points", 80, top, { size: 26, fill: C.teal, weight: 800, max: 24 })}
      ${bulletBlock(slide.supporting_points, 80, top + 65, { size: 29, max: 53, gap: 58 })}
      <rect x="1040" y="${top - 15}" width="760" height="${Math.max(330, 890 - top)}" fill="${C.band}" stroke="${C.line}" stroke-width="2"/>
      ${textBlock("Evidence / implications", 1080, top + 45, { size: 26, fill: C.teal, weight: 800, max: 36 })}
      ${bulletBlock(slide.evidence, 1080, top + 105, { size: 25, max: 45, gap: 52 })}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${title(slide)}
    ${body}
    ${footer(slide, idx, total, manifest)}
  </svg>`;
}

function isCoverLike(slide) {
  const role = String(slide.role || "").toLowerCase();
  const type = String(slide.visual_type || "").toLowerCase();
  return role.includes("cover") || role.includes("section") || type.includes("divider");
}

function renderBackground(slide, manifest, idx, total) {
  void manifest;
  void idx;
  void total;
  if (isCoverLike(slide)) return coverBackground(slide, manifest);
  return analyticBackground(slide);
}

function renderOverlay(slide, manifest, idx, total) {
  if (isCoverLike(slide)) return coverOverlay(slide, manifest);
  return analyticOverlay(slide, manifest, idx, total);
}

function writeOutline(manifest, root) {
  const out = path.resolve(root, "notes", `${manifest.project_name}-outline.md`);
  ensureDir(path.dirname(out));
  const slides = manifest.slides.slice().sort((a, b) => a.slide_no - b.slide_no);
  const md = [
    `# ${manifest.project_name} Institutional Deck Outline`,
    "",
    `Audience: ${manifest.audience}`,
    `Objective: ${manifest.objective}`,
    "",
    ...slides.flatMap((s) => [
      `## ${s.slide_no}. ${s.governing_message}`,
      `- Role: ${s.role}`,
      `- Subtitle: ${s.subtitle || ""}`,
      `- Source: ${s.source}`,
      `- Speaker note: ${s.speaker_note}`,
      "",
    ]),
  ].join("\n");
  fs.writeFileSync(out, md, "utf8");
  return out;
}

async function figureComposite(sharp, slide, root, manifestDir) {
  const panel = figurePanel(slide);
  const g = figurePanelGeometry(slide);
  if (!panel || !g) return null;
  const figurePath = resolveAssetPath(panel.path || panel.image_path || panel.figure_path, root, manifestDir);
  if (!figurePath) {
    throw new Error(`Figure image not found for slide ${slide.slide_no}: ${panel.path || panel.image_path || panel.figure_path || "missing path"}`);
  }
  const fit = String(panel.fit || "contain").toLowerCase() === "cover" ? "cover" : "contain";
  const input = await sharp(figurePath)
    .resize(Math.round(g.w), Math.round(g.h), {
      fit,
      position: "center",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
  return { input, left: Math.round(g.x), top: Math.round(g.y) };
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (err) {
    usage();
    console.error(`[ERROR] ${err.message}`);
    process.exit(2);
  }
  if (!args.manifest) {
    usage();
    process.exit(2);
  }

  const sharp = loadModule("sharp");
  const pptxgen = loadModule("pptxgenjs");
  const manifest = JSON.parse(fs.readFileSync(args.manifest, "utf8"));
  applyTheme(manifest);
  const manifestDir = path.dirname(args.manifest);
  const slides = manifest.slides.slice().sort((a, b) => a.slide_no - b.slide_no);
  const imagesDir = args.imagesDir || path.resolve(args.root, "assets", "images", manifest.project_name);
  const output = args.output || path.resolve(args.root, "outputs", `${manifest.project_name}.pptx`);
  ensureDir(imagesDir);
  ensureDir(path.dirname(output));

  const imagePaths = [];
  const backgroundPaths = [];
  for (let i = 0; i < slides.length; i += 1) {
    const slideNo = String(i + 1).padStart(2, "0");
    const backgroundSvgPath = path.join(imagesDir, `background-${slideNo}.svg`);
    const backgroundPngPath = path.join(imagesDir, `background-${slideNo}.png`);
    const overlaySvgPath = path.join(imagesDir, `overlay-${slideNo}.svg`);
    const pngPath = path.join(imagesDir, `slide-${slideNo}.png`);
    const providedBackground = resolveAssetPath(
      slides[i].background_path || slides[i].background_image_path,
      args.root,
      manifestDir
    );
    const overlaySvg = renderOverlay(slides[i], manifest, i, slides.length);

    if (providedBackground) {
      await sharp(providedBackground).resize(W, H, { fit: "cover", position: "center" }).png().toFile(backgroundPngPath);
      if (fs.existsSync(backgroundSvgPath)) fs.rmSync(backgroundSvgPath);
    } else {
      const backgroundSvg = renderBackground(slides[i], manifest, i, slides.length);
      fs.writeFileSync(backgroundSvgPath, backgroundSvg, "utf8");
      await sharp(Buffer.from(backgroundSvg)).png().toFile(backgroundPngPath);
    }

    const figureLayer = await figureComposite(sharp, slides[i], args.root, manifestDir);
    const composites = [
      ...(figureLayer ? [figureLayer] : []),
      { input: Buffer.from(overlaySvg), left: 0, top: 0 },
    ];

    fs.writeFileSync(overlaySvgPath, overlaySvg, "utf8");
    await sharp(backgroundPngPath)
      .composite(composites)
      .png()
      .toFile(pngPath);
    imagePaths.push(pngPath);
    backgroundPaths.push(backgroundPngPath);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Slide_Generator";
  pptx.title = manifest.project_name;
  pptx.subject = manifest.objective;
  pptx.lang = String(manifest.language || "en").toLowerCase().startsWith("th") ? "th-TH" : "en-US";

  slides.forEach((slideData, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({ path: imagePaths[i], x: 0, y: 0, w: PPT_W, h: PPT_H });
    if (typeof slide.addNotes === "function" && slideData.speaker_note) {
      slide.addNotes([String(slideData.speaker_note)]);
    }
  });

  await pptx.writeFile({ fileName: output });
  const outline = writeOutline(manifest, args.root);
  console.log(`[OK] Wrote ${output}`);
  console.log(`[OK] Wrote ${backgroundPaths.length} background images and ${imagePaths.length} composed slide images to ${imagesDir}`);
  console.log(`[OK] Wrote ${outline}`);
}

main().catch((err) => {
  console.error(`[ERROR] ${err.stack || err.message}`);
  process.exit(1);
});
