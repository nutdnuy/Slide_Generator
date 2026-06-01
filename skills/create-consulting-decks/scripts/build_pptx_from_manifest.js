#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const FONT = "Arial";

let C = {
  bg: "F7F8FA",
  surface: "FFFFFF",
  text: "1F2933",
  muted: "697586",
  line: "D7DEE8",
  accent: "1264A3",
  accent2: "00A88F",
  warning: "B7791F",
  risk: "C2410C",
};

function themeFor(manifest) {
  const style = String(manifest.style || "").toLowerCase();
  if (style.includes("institutional") || style.includes("seminar") || style.includes("financial")) {
    return {
      bg: "FFFFFF",
      surface: "F4F6F8",
      text: "00264D",
      body: "111111",
      muted: "5D6875",
      line: "B7C0CA",
      accent: "00A0B0",
      accent2: "0073B5",
      warning: "B7791F",
      risk: "C2410C",
      navy: "00264D",
      navy2: "0B3567",
      pale: "EAF4F6",
      tableHead: "D9DEE3",
      tableBand: "EEF2F5",
    };
  }
  return C;
}

function usage() {
  console.error(
    "Usage: node build_pptx_from_manifest.js <manifest.json> [--root <workspace>] [--output <deck.pptx>] [--no-outline]"
  );
}

function parseArgs(argv) {
  const args = {
    manifest: null,
    root: process.cwd(),
    output: null,
    writeOutline: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      args.root = path.resolve(argv[++i] || "");
    } else if (arg === "--output") {
      args.output = path.resolve(argv[++i] || "");
    } else if (arg === "--no-outline") {
      args.writeOutline = false;
    } else if (!args.manifest) {
      args.manifest = path.resolve(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
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

  throw new Error(
    `Could not load ${name}. Install it locally or use the bundled Codex workspace runtime.`
  );
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

function lines(value) {
  return asArray(value).map((item) => String(item).trim()).filter(Boolean);
}

function bulletText(value) {
  return lines(value).map((item) => `- ${item}`).join("\n");
}

function resolveOutput(args, manifest) {
  if (args.output) return args.output;
  return path.resolve(args.root, "outputs", `${manifest.project_name}.pptx`);
}

function resolveImagePath(slide, manifest, root) {
  const slideNo = String(slide.slide_no).padStart(2, "0");
  const candidates = [];

  if (slide.image_path) {
    if (path.isAbsolute(slide.image_path)) candidates.push(slide.image_path);
    candidates.push(path.resolve(root, slide.image_path));
  }

  candidates.push(path.resolve(root, "assets", "images", manifest.project_name, `slide-${slideNo}.png`));
  candidates.push(path.resolve(root, "assets", "images", manifest.project_name, `slide-${slideNo}.jpg`));

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function deckMark(manifest) {
  return manifest.deck_mark || manifest.deck_title || manifest.project_name || "Strategy brief";
}

function addMosaic(slide, dark = false) {
  const fill1 = dark ? C.navy2 || "123B6D" : C.pale || "EAF4F6";
  const fill2 = dark ? "143B6D" : "DDF0F3";
  const opacity = dark ? 35 : 58;
  [
    [10.25, 0.0, 0.8, 0.78, fill1],
    [11.85, 0.0, 0.8, 0.78, fill2],
    [12.65, 0.0, 0.68, 0.78, fill2],
    [11.85, 0.78, 0.8, 0.78, fill1],
    [12.65, 0.78, 0.68, 0.78, fill1],
    [12.65, 1.56, 0.68, 0.72, fill1],
  ].forEach(([x, y, w, h, color]) => {
    slide.addShape("rect", { x, y, w, h, fill: { color, transparency: opacity }, line: { color, transparency: 100 } });
  });
}

function addDeckMark(slide, manifest, dark = false) {
  slide.addText(deckMark(manifest), {
    x: 10.3,
    y: dark ? 0.33 : 6.97,
    w: 2.35,
    h: 0.28,
    fontFace: FONT,
    fontSize: dark ? 21 : 14,
    bold: true,
    color: dark ? "FFFFFF" : C.text,
    align: "right",
    margin: 0,
    fit: "shrink",
  });
}

function addFooter(slide, item, idx, total) {
  const source = item.source ? `Source: ${item.source}` : "Source: not provided";
  slide.addShape("line", { x: 0.5, y: 6.85, w: 11.1, h: 0, line: { color: C.line, width: 0.55 } });
  slide.addText(source, {
    x: 0.5,
    y: 6.98,
    w: 9.2,
    h: 0.18,
    fontFace: FONT,
    fontSize: 7.6,
    color: C.muted,
    margin: 0,
    breakLine: false,
  });
  slide.addText(`${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: 0.5,
    y: 7.18,
    w: 0.65,
    h: 0.18,
    fontFace: FONT,
    fontSize: 8,
    color: C.muted,
    align: "right",
    margin: 0,
  });
}

function addTitle(slide, item) {
  addMosaic(slide, false);
  const titleLength = String(item.governing_message || "").length;
  const longTitle = titleLength > 82;
  const titleSize = titleLength > 115 ? 21.5 : longTitle ? 24 : 29;
  slide.addText(item.governing_message, {
    x: 0.5,
    y: 0.48,
    w: 10.0,
    h: item.subtitle ? 0.9 : 1.05,
    fontFace: FONT,
    fontSize: titleSize,
    bold: true,
    color: C.text,
    margin: 0,
    fit: "shrink",
    breakLine: false,
  });
  if (item.subtitle) {
    slide.addText(item.subtitle, {
      x: 0.5,
      y: longTitle ? 1.5 : 1.28,
      w: 11.8,
      h: 0.4,
      fontFace: FONT,
      fontSize: longTitle ? 16.2 : 18.5,
      color: C.accent,
      margin: 0,
      fit: "shrink",
      breakLine: false,
    });
  }
}

function addNotes(slide, item) {
  if (typeof slide.addNotes === "function" && item.speaker_note) {
    slide.addNotes([String(item.speaker_note)]);
  }
}

function addEvidencePanel(slide, item) {
  slide.addShape("rect", {
    x: 7.1,
    y: 2.02,
    w: 5.55,
    h: 4.35,
    fill: { color: C.surface, transparency: 0 },
    line: { color: C.line, width: 0.75 },
    radius: 0.08,
  });
  slide.addText("Evidence / implications", {
    x: 7.38,
    y: 2.25,
    w: 4.75,
    h: 0.28,
    fontFace: FONT,
    fontSize: 11.2,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  slide.addText(bulletText(item.evidence), {
    x: 7.38,
    y: 2.73,
    w: 4.9,
    h: 3.05,
    fontFace: FONT,
    fontSize: 14.5,
    color: C.body || C.text,
    valign: "top",
    fit: "shrink",
    breakLine: false,
    margin: 0,
  });
}

function addSupportPanel(slide, item) {
  slide.addText("Key points", {
    x: 0.55,
    y: 2.02,
    w: 5.9,
    h: 0.28,
    fontFace: FONT,
    fontSize: 11.2,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  slide.addText(bulletText(item.supporting_points), {
    x: 0.55,
    y: 2.48,
    w: 6.0,
    h: 3.75,
    fontFace: FONT,
    fontSize: 16.3,
    color: C.body || C.text,
    valign: "top",
    fit: "shrink",
    breakLine: false,
    margin: 0,
  });
}

function addMetricCards(slide, item) {
  const metrics = Array.isArray(item.metrics) ? item.metrics : [];
  if (!metrics.length) return addEvidencePanel(slide, item);

  const cardW = 1.76;
  metrics.slice(0, 3).forEach((metric, i) => {
    const x = 7.1 + i * 1.86;
    slide.addShape("rect", {
      x,
      y: 2.05,
      w: cardW,
      h: 1.08,
      fill: { color: C.surface },
      line: { color: C.line, width: 0.75 },
    });
    slide.addText(String(metric.value || ""), {
      x: x + 0.12,
      y: 2.22,
      w: cardW - 0.24,
      h: 0.34,
      fontFace: FONT,
      fontSize: 18,
      bold: true,
      color: C.accent,
      margin: 0,
      fit: "shrink",
    });
    slide.addText(String(metric.label || ""), {
      x: x + 0.12,
      y: 2.68,
      w: cardW - 0.24,
      h: 0.22,
      fontFace: FONT,
      fontSize: 8.2,
      bold: true,
      color: C.text,
      margin: 0,
      fit: "shrink",
    });
    if (metric.note) {
      slide.addText(String(metric.note), {
        x: x + 0.12,
        y: 2.93,
        w: cardW - 0.24,
        h: 0.18,
        fontFace: FONT,
        fontSize: 6.4,
        color: C.muted,
        margin: 0,
        fit: "shrink",
      });
    }
  });

  slide.addText("What it means", {
    x: 7.1,
    y: 3.58,
    w: 4.8,
    h: 0.24,
    fontFace: FONT,
    fontSize: 11.2,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  slide.addText(bulletText(item.evidence), {
    x: 7.1,
    y: 4.0,
    w: 5.35,
    h: 1.9,
    fontFace: FONT,
    fontSize: 13.4,
    color: C.body || C.text,
    fit: "shrink",
    margin: 0,
  });
}

function addTable(slide, item) {
  const rows = Array.isArray(item.table) ? item.table : [];
  if (!rows.length) return addEvidencePanel(slide, item);

  const x = 0.55;
  const y = item.subtitle ? 2.08 : 1.88;
  const w = 11.8;
  const h = Math.min(4.75, Math.max(1.5, rows.length * 0.48));
  const rowH = h / rows.length;
  const colCount = Math.max(...rows.map((row) => row.length));
  const firstColW = colCount > 3 ? Math.min(2.05, w * 0.25) : w / colCount;
  const otherW = colCount > 1 ? (w - firstColW) / (colCount - 1) : w;

  rows.forEach((row, r) => {
    let cursorX = x;
    const rowLabel = String(row[0] || "").trim().toLowerCase();
    const isHighlightRow = rowLabel === "ours" || row.some((cell) => /recommended|approve|target/i.test(String(cell || "")));
    for (let c = 0; c < colCount; c += 1) {
      const cellW = c === 0 ? firstColW : otherW;
      const isHeader = r === 0;
      const isStub = c === 0 && rows.length <= 7;
      const fill = isHeader ? C.tableHead || "D9DEE3" : isHighlightRow ? C.pale || "EAF4F6" : isStub ? C.tableBand || "EEF2F5" : C.bg;
      slide.addShape("rect", {
        x: cursorX,
        y: y + r * rowH,
        w: cellW,
        h: rowH,
        fill: { color: fill },
        line: { color: C.line, width: 0.55 },
      });
      slide.addText(String(row[c] || ""), {
        x: cursorX + 0.06,
        y: y + r * rowH + 0.06,
        w: cellW - 0.12,
        h: rowH - 0.1,
        fontFace: FONT,
        fontSize: rows.length > 8 ? 8.5 : 10.4,
        bold: isHeader || isStub || isHighlightRow,
        color: isHighlightRow && !isHeader ? C.text : C.body || C.text,
        valign: "mid",
        fit: "shrink",
        margin: 0,
      });
      cursorX += cellW;
    }
  });
}

function addChart(slide, item) {
  const chart = item.chart || {};
  const labels = lines(chart.labels);
  const values = Array.isArray(chart.values) ? chart.values.map(Number) : [];
  const pairs = labels.map((label, i) => ({ label, value: values[i] })).filter((entry) => Number.isFinite(entry.value));
  if (!pairs.length) return addEvidencePanel(slide, item);

  const x = 7.25;
  const y = 2.05;
  const w = 5.35;
  const h = 3.95;
  const max = Math.max(...pairs.map((entry) => Math.abs(entry.value)), 1);
  const unit = chart.unit ? ` ${chart.unit}` : "";
  const rowH = Math.min(0.52, h / Math.max(pairs.length, 1));

  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: C.surface },
    line: { color: C.line, width: 1 },
  });
  slide.addText(chart.title || "Editable chart", {
    x: x + 0.25,
    y: y + 0.22,
    w: w - 0.5,
    h: 0.25,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: C.accent,
    margin: 0,
    fit: "shrink",
  });

  pairs.slice(0, 7).forEach((entry, i) => {
    const rowY = y + 0.78 + i * rowH;
    const barW = Math.max(0.08, (Math.abs(entry.value) / max) * 2.8);
    slide.addText(entry.label, {
      x: x + 0.25,
      y: rowY + 0.08,
      w: 1.3,
      h: 0.16,
      fontFace: FONT,
      fontSize: 7.5,
      color: C.text,
      margin: 0,
      fit: "shrink",
    });
    slide.addShape("rect", {
      x: x + 1.7,
      y: rowY + 0.08,
      w: barW,
      h: 0.16,
      fill: { color: entry.value < 0 ? C.risk : C.accent },
      line: { color: entry.value < 0 ? C.risk : C.accent },
    });
    slide.addText(`${entry.value}${unit}`, {
      x: x + 1.8 + barW,
      y: rowY + 0.06,
      w: 0.9,
      h: 0.18,
      fontFace: FONT,
      fontSize: 7.3,
      color: C.muted,
      margin: 0,
      fit: "shrink",
    });
  });
}

function addRoadmap(slide, item) {
  const steps = lines(item.steps || item.supporting_points).slice(0, 5);
  const y = 3.05;
  const gap = 2.25;
  steps.forEach((step, i) => {
    const x = 0.75 + i * gap;
    if (i < steps.length - 1) {
      slide.addShape("line", { x: x + 1.2, y: y + 0.35, w: gap - 0.95, h: 0, line: { color: C.line, width: 2 } });
    }
    slide.addShape("ellipse", {
      x,
      y,
      w: 0.7,
      h: 0.7,
      fill: { color: i === 0 ? C.accent : C.surface },
      line: { color: C.accent, width: 1.2 },
    });
    slide.addText(String(i + 1), {
      x,
      y: y + 0.18,
      w: 0.7,
      h: 0.18,
      fontFace: FONT,
      fontSize: 10,
      bold: true,
      color: i === 0 ? "FFFFFF" : C.accent,
      align: "center",
      margin: 0,
    });
    slide.addText(step, {
      x: x - 0.2,
      y: y + 0.98,
      w: 1.9,
      h: 0.8,
      fontFace: FONT,
      fontSize: 11,
      bold: true,
      color: C.text,
      align: "center",
      valign: "top",
      fit: "shrink",
      margin: 0,
    });
  });
  addEvidencePanel(slide, item);
}

function addOptions(slide, item) {
  const options = Array.isArray(item.options) ? item.options.slice(0, 4) : [];
  if (!options.length) return addEvidencePanel(slide, item);

  const w = 11.85 / options.length - 0.12;
  options.forEach((option, i) => {
    const x = 0.75 + i * (w + 0.12);
    const accent = option.verdict ? C.accent : C.line;
    slide.addShape("rect", {
      x,
      y: 2.0,
      w,
      h: 4.35,
      fill: { color: C.surface },
      line: { color: accent, width: 1.1 },
    });
    slide.addText(option.name || `Option ${i + 1}`, {
      x: x + 0.15,
      y: 2.2,
      w: w - 0.3,
      h: 0.34,
      fontFace: FONT,
      fontSize: 12,
      bold: true,
      color: C.accent,
      margin: 0,
      fit: "shrink",
    });
    const body = [
      ...lines(option.pros).map((p) => `+ ${p}`),
      ...lines(option.cons).map((p) => `- ${p}`),
      option.verdict ? `Verdict: ${option.verdict}` : "",
    ].filter(Boolean).join("\n");
    slide.addText(body, {
      x: x + 0.15,
      y: 2.75,
      w: w - 0.3,
      h: 3.25,
      fontFace: FONT,
      fontSize: 9.5,
      color: C.text,
      valign: "top",
      fit: "shrink",
      margin: 0,
    });
  });
}

function addRisks(slide, item) {
  const risks = Array.isArray(item.risks) ? item.risks : [];
  if (!risks.length) return addEvidencePanel(slide, item);

  const rows = [["Risk", "Mitigation"]].concat(
    risks.slice(0, 6).map((entry) => [entry.risk || "", entry.mitigation || ""])
  );
  item.table = rows;
  addTable(slide, item);
}

function renderDividerSlide(pptx, item, manifest, idx, total) {
  const slide = pptx.addSlide();
  slide.background = { color: C.navy || C.text };
  slide.addShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: { color: C.navy || C.text }, line: { color: C.navy || C.text } });
  addMosaic(slide, true);
  addDeckMark(slide, manifest, true);
  slide.addText(item.governing_message, {
    x: 1.35,
    y: 2.38,
    w: 10.6,
    h: 1.8,
    fontFace: FONT,
    fontSize: item.governing_message && item.governing_message.length > 70 ? 34 : 42,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "mid",
    fit: "shrink",
    margin: 0,
    breakLine: false,
  });
  if (item.subtitle) {
    slide.addText(item.subtitle, {
      x: 2.05,
      y: 4.35,
      w: 9.2,
      h: 0.34,
      fontFace: FONT,
      fontSize: 16,
      color: C.accent,
      align: "center",
      margin: 0,
      fit: "shrink",
    });
  }
  addNotes(slide, item);
  if (!String(item.role || "").toLowerCase().includes("cover")) {
    slide.addText(`${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
      x: 0.5,
      y: 6.95,
      w: 0.7,
      h: 0.18,
      fontFace: FONT,
      fontSize: 8,
      color: "FFFFFF",
      margin: 0,
    });
  }
}

function renderEditableSlide(pptx, item, idx, total, manifest) {
  const role = String(item.role || "").toLowerCase();
  const type = String(item.visual_type || "").toLowerCase();
  if (role.includes("cover") || role.includes("section") || type.includes("divider")) {
    renderDividerSlide(pptx, item, manifest, idx, total);
    return;
  }

  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  slide.addShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: { color: C.bg }, line: { color: C.bg } });
  addTitle(slide, item);

  if (Array.isArray(item.table) || type === "table") {
    addTable(slide, item);
  } else if (item.chart || type === "chart") {
    addSupportPanel(slide, item);
    addChart(slide, item);
  } else if (Array.isArray(item.options) || type.includes("option")) {
    addOptions(slide, item);
  } else if (Array.isArray(item.risks) || type.includes("risk")) {
    addRisks(slide, item);
  } else if (Array.isArray(item.steps) || type.includes("roadmap") || type.includes("path")) {
    addSupportPanel(slide, item);
    addRoadmap(slide, item);
  } else if (Array.isArray(item.metrics) || type.includes("metric") || type.includes("financial")) {
    addSupportPanel(slide, item);
    addMetricCards(slide, item);
  } else {
    addSupportPanel(slide, item);
    addEvidencePanel(slide, item);
  }

  addFooter(slide, item, idx, total);
  addDeckMark(slide, manifest, false);
  addNotes(slide, item);
}

function renderImageSlide(pptx, item, manifest, args, idx, total) {
  const imagePath = resolveImagePath(item, manifest, args.root);
  if (!imagePath) {
    throw new Error(`Image not found for slide ${item.slide_no}`);
  }

  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  slide.addImage({ path: imagePath, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
  addFooter(slide, item, idx, total);
  addDeckMark(slide, manifest, false);
  addNotes(slide, item);
}

function writeOutline(manifest, args) {
  const notesDir = path.resolve(args.root, "notes");
  ensureDir(notesDir);
  const out = path.join(notesDir, `${manifest.project_name}-outline.md`);
  const slides = manifest.slides.slice().sort((a, b) => a.slide_no - b.slide_no);
  const body = [
    `# ${manifest.project_name} Consulting Deck Outline`,
    "",
    `Audience: ${manifest.audience}`,
    `Objective: ${manifest.objective}`,
    `Language: ${manifest.language}`,
    `Style: ${manifest.style}`,
    `Rendering mode: ${manifest.rendering_mode}`,
    "",
    "## Slides",
    "",
    ...slides.flatMap((slide) => [
      `### ${slide.slide_no}. ${slide.governing_message}`,
      `- Role: ${slide.role}`,
      `- Visual: ${slide.visual_type} (${slide.render_mode})`,
      `- Support: ${lines(slide.supporting_points).join("; ")}`,
      `- Evidence: ${lines(slide.evidence).join("; ")}`,
      `- Source: ${slide.source}`,
      `- Speaker note: ${slide.speaker_note}`,
      "",
    ]),
  ].join("\n");
  fs.writeFileSync(out, body, "utf8");
  return out;
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

  const manifest = readJson(args.manifest);
  C = themeFor(manifest);
  const pptxgen = loadModule("pptxgenjs");
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Slide_Generator";
  pptx.subject = manifest.objective || "Consulting-grade deck";
  pptx.title = manifest.project_name || "consulting-deck";
  pptx.lang = String(manifest.language || "en").toLowerCase().startsWith("th") ? "th-TH" : "en-US";
  pptx.theme = {
    headFontFace: FONT,
    bodyFontFace: FONT,
    lang: pptx.lang,
  };

  const slides = manifest.slides.slice().sort((a, b) => a.slide_no - b.slide_no);
  slides.forEach((item, idx) => {
    if (item.render_mode === "image") renderImageSlide(pptx, item, manifest, args, idx, slides.length);
    else renderEditableSlide(pptx, item, idx, slides.length, manifest);
  });

  const output = resolveOutput(args, manifest);
  ensureDir(path.dirname(output));
  await pptx.writeFile({ fileName: output });

  let outline = null;
  if (args.writeOutline) outline = writeOutline(manifest, args);

  console.log(`[OK] Wrote ${output}`);
  if (outline) console.log(`[OK] Wrote ${outline}`);
}

main().catch((err) => {
  console.error(`[ERROR] ${err.stack || err.message}`);
  process.exit(1);
});
