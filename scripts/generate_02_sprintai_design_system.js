const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "02-sprintai-design-system";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const GRAPH_DIR = path.join(IMG_DIR, "graphs");
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");

const W = 1920;
const H = 1080;

const C = {
  paper: "#FAFAF7",
  paper2: "#F6F1E8",
  ink: "#0F1419",
  navy: "#183C5C",
  navy2: "#0F2B44",
  orange: "#F47A20",
  orange2: "#FF9A3D",
  ember: "#B64B12",
  gray: "#6E7378",
  line: "#D9D2C6",
  faint: "#EEE7DC",
  card: "#FFFFFF",
  success: "#0E8F6A",
  teal: "#2B8C91",
  red: "#C94934",
  gold: "#C89A2F",
};

const graphData = {
  adoptionCurve: {
    periods: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
    manual: [100, 101, 100, 102, 101, 101],
    copilot: [100, 113, 127, 141, 152, 160],
    agentic: [100, 118, 145, 181, 220, 268],
    unit: "Productivity index",
  },
  impactBars: [
    { label: "Brief to concept", value: -42 },
    { label: "Research synthesis", value: -36 },
    { label: "Prototype cycle", value: -55 },
    { label: "QA feedback loop", value: -31 },
    { label: "Asset production", value: -48 },
  ],
  usageMix: [
    { label: "Paper white", value: 52, color: C.paper },
    { label: "Sprint orange", value: 18, color: C.orange },
    { label: "Sprint navy", value: 18, color: C.navy },
    { label: "Circuit black", value: 12, color: C.ink },
  ],
  quadrant: [
    { label: "Prompt Library", x: 34, y: 42, color: C.gray },
    { label: "Sprint Canvas", x: 56, y: 61, color: C.orange },
    { label: "Agent Console", x: 73, y: 75, color: C.navy },
    { label: "Audit Layer", x: 82, y: 33, color: C.teal },
    { label: "Brand Kit", x: 43, y: 72, color: C.gold },
  ],
};

const slides = [
  {
    tag: "EDITORIAL REVEAL",
    title: "02 SPRINTAI\nDESIGN SYSTEM",
    kicker: "Velocity, structure, and editorial intelligence for AI-native decks.",
    type: "cover",
    note: "Open with the design system promise: SprintAI should feel fast, structured, and credible. This deck is a usable visual system, not only a moodboard.",
  },
  {
    tag: "NORTH STAR",
    title: "Velocity needs\nstructure.",
    kicker: "SprintAI is built to make complex AI work feel direct, legible, and executable.",
    type: "northstar",
    note: "Explain the core tension: speed without structure becomes noise; structure without speed becomes bureaucracy. SprintAI lives in the top-right zone.",
  },
  {
    tag: "BRAND ATOMS",
    title: "A four-color system\nwith clear jobs.",
    kicker: "Use orange for forward motion, navy for system depth, black for authority, and paper white for editorial space.",
    type: "palette",
    note: "Use this slide as the brand token reference. The usage mix is an operating guideline, not a rigid rule.",
  },
  {
    tag: "TYPOGRAPHY",
    title: "Compressed headlines.\nEditorial proof.",
    kicker: "A simple type stack creates the SprintAI voice: urgent, readable, and trusted.",
    type: "typography",
    note: "Headline should carry energy. Body copy should stay calm. Numbers and labels need monospaced precision.",
  },
  {
    tag: "GRID ARCHITECTURE",
    title: "Asymmetric grids\ncreate momentum.",
    kicker: "Every slide uses a dominant evidence zone, a clear quote or headline zone, and enough white space to breathe.",
    type: "grid",
    note: "This is the practical layout rule: one large message, one evidence block, one path for the eye.",
  },
  {
    tag: "COMPONENTS",
    title: "Sharp components,\nzero decoration.",
    kicker: "Cards, pills, metric tiles, quote blocks, and action bars should feel like product UI inside an editorial page.",
    type: "components",
    note: "Components are intentionally simple so the system can be rebuilt in PowerPoint, Figma, Canva, or code.",
  },
  {
    tag: "DATA VISUALIZATION",
    title: "Graphs should look\nfast and explainable.",
    kicker: "The chart system favors strong baseline logic, orange emphasis, restrained labels, and direct annotations.",
    type: "chartAnatomy",
    note: "This slide defines chart grammar: gray baselines, navy comparison, orange focus, and annotations only where they change the decision.",
  },
  {
    tag: "GRAPH PACK 01",
    title: "Adoption curve:\nfrom prompts to ops.",
    kicker: "Illustrative productivity index showing how agentic workflows compound faster than isolated prompt use.",
    type: "adoptionGraph",
    source: "Illustrative SprintAI model; replace with client data for external reporting.",
    note: "Use this chart when explaining why SprintAI is an operating system, not a prompt workshop.",
  },
  {
    tag: "GRAPH PACK 02",
    title: "Impact bars:\nwhere speed shows up.",
    kicker: "Cycle-time reduction is easiest to communicate when each workflow has one measurable before-after metric.",
    type: "impactGraph",
    source: "Illustrative workflow benchmark; negative values represent cycle-time reduction.",
    note: "This is a practical chart template for client proposals. Replace values with measured before-after data after a sprint.",
  },
  {
    tag: "GRAPH PACK 03",
    title: "Pattern map:\nvelocity vs governance.",
    kicker: "Use a 2x2 only when it helps the audience choose what to build first.",
    type: "quadrant",
    source: "SprintAI component prioritization model.",
    note: "The upper-right zone is for high-velocity, high-governance assets. The map helps teams prioritize reusable systems.",
  },
  {
    tag: "APPLICATION",
    title: "Three templates\ncover most decks.",
    kicker: "Start from the job of the slide: reveal, explain, or prove. Then apply the same visual rules.",
    type: "templates",
    note: "This turns the system into something reusable. Most SprintAI slides should map to one of these three template types.",
  },
  {
    tag: "SYSTEM LOCKED",
    title: "Forward motion.\nEditorial clarity.",
    kicker: "If a slide does not make the next action clearer, remove the visual noise and sharpen the evidence.",
    type: "rules",
    note: "Close with production rules that the team can use during review. The deck should be actionable immediately.",
  },
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function wrap(value, max = 32) {
  const lines = [];
  String(value)
    .split("\n")
    .forEach((part) => {
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

function text(value, x, y, size, opts = {}) {
  const {
    fill = C.ink,
    weight = 600,
    max = 32,
    lh = 1.15,
    family = "Arial, Helvetica, sans-serif",
    anchor = "start",
    style = "",
  } = opts;
  const lines = wrap(value, max);
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${family}" text-anchor="${anchor}" ${style}>${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function headline(value, x, y, size = 106, fill = C.ink, max = 18) {
  return text(value, x, y, size, {
    fill,
    weight: 900,
    max,
    lh: 0.92,
    family: "Arial Narrow, Impact, Arial Black, Arial, sans-serif",
  });
}

function serif(value, x, y, size = 44, fill = C.ink, max = 32, weight = 500) {
  return text(value, x, y, size, {
    fill,
    weight,
    max,
    lh: 1.14,
    family: "Georgia, Times New Roman, serif",
  });
}

function mono(value, x, y, size = 24, fill = C.gray, weight = 700, anchor = "start") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Menlo, Consolas, monospace" text-anchor="${anchor}">${esc(value)}</text>`;
}

function rect(x, y, w, h, fill, stroke = "none", sw = 0, rx = 0, extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke = C.line, sw = 2, extra = "") {
  return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${stroke}" stroke-width="${sw}" fill="none" ${extra}/>`;
}

function base(slide, idx, dark = false) {
  const bg = dark ? C.ink : C.paper;
  const fg = dark ? C.paper : C.ink;
  const grid = dark ? "rgba(250,250,247,0.07)" : C.faint;
  const footer = dark ? "#AEB5BA" : C.gray;
  const page = String(idx + 1).padStart(2, "0");
  const gridLines = [];
  for (let x = 110; x <= 1810; x += 110) gridLines.push(line(x, 0, x, H, grid, 1));
  for (let y = 110; y <= 990; y += 110) gridLines.push(line(0, y, W, y, grid, 1));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="paperWash" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${dark ? "#111C25" : C.paper2}"/></linearGradient>
    <linearGradient id="orangeBeam" x1="0" x2="1"><stop stop-color="${C.orange}" stop-opacity="0"/><stop offset="0.52" stop-color="${C.orange}" stop-opacity="0.82"/><stop offset="1" stop-color="${C.orange2}" stop-opacity="0"/></linearGradient>
    <filter id="softShadow"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0F1419" flood-opacity="0.16"/></filter>
  </defs>
  ${rect(0, 0, W, H, "url(#paperWash)")}
  <g opacity="0.74">${gridLines.join("")}</g>
  <path d="M1430 -80L1625 -80L1010 1160L815 1160Z" fill="url(#orangeBeam)" opacity="${dark ? 0.86 : 0.62}"/>
  <path d="M1510 -60L1568 -60L955 1140L895 1140Z" fill="${C.orange}" opacity="${dark ? 0.9 : 0.72}"/>
  ${mono("SPRINTAI / 02 DESIGN SYSTEM", 72, 76, 20, dark ? C.orange2 : C.orange)}
  ${mono(page, 1760, 76, 24, footer)}
  ${line(72, 1020, 1848, 1020, dark ? "rgba(250,250,247,0.18)" : C.line, 2)}
  ${mono(slide.tag, 72, 1050, 17, footer)}
  ${mono("Visual system v0.2  |  16:9  |  Use graph data from notes JSON", 1210, 1050, 15, footer)}
  <g id="content">`;
}

function end() {
  return `</g></svg>`;
}

function pill(x, y, label, fill = C.ink, fg = C.paper, stroke = "none") {
  const w = Math.max(118, label.length * 12 + 46);
  return `<g>${rect(x, y, w, 42, fill, stroke, stroke === "none" ? 0 : 2, 0)}${mono(label, x + w / 2, y + 28, 16, fg, 800, "middle")}</g>`;
}

function card(x, y, w, h, title, body, accent = C.orange) {
  return `<g filter="url(#softShadow)">
    ${rect(x, y, w, h, C.card, C.line, 2, 0)}
    ${rect(x, y, 9, h, accent)}
    ${text(title, x + 34, y + 54, 30, { fill: C.ink, weight: 800, max: 18, lh: 1.05 })}
    ${text(body, x + 34, y + 102, 21, { fill: C.gray, weight: 500, max: 29, lh: 1.22 })}
  </g>`;
}

function arrow(x1, y1, x2, y2, color = C.orange, sw = 10) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ah = 32;
  const p1 = `${x2 - ah * Math.cos(angle - Math.PI / 6)} ${y2 - ah * Math.sin(angle - Math.PI / 6)}`;
  const p2 = `${x2 - ah * Math.cos(angle + Math.PI / 6)} ${y2 - ah * Math.sin(angle + Math.PI / 6)}`;
  return `<g><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="square"/><path d="M${x2} ${y2}L${p1}L${p2}Z" fill="${color}"/></g>`;
}

function renderUsageMix(x, y, w, h) {
  let cursor = x;
  const total = graphData.usageMix.reduce((sum, d) => sum + d.value, 0);
  const bars = graphData.usageMix
    .map((d) => {
      const bw = (w * d.value) / total;
      const out = rect(cursor, y, bw, h, d.color, C.ink, 1);
      cursor += bw;
      return out;
    })
    .join("");
  const labels = graphData.usageMix
    .map((d, i) => {
      const yy = y + h + 56 + i * 38;
      return `<g>${rect(x + i * 290, yy - 24, 24, 24, d.color, C.ink, 1)}${mono(`${d.label} ${d.value}%`, x + i * 290 + 38, yy - 5, 17, C.gray, 700)}</g>`;
    })
    .join("");
  return `<g>${bars}${labels}</g>`;
}

function lineChartSvg(x, y, w, h, opts = {}) {
  const periods = graphData.adoptionCurve.periods;
  const series = [
    { key: "manual", label: "Manual ops", color: "#8E9499", width: 4 },
    { key: "copilot", label: "Co-pilot workflow", color: C.navy, width: 5 },
    { key: "agentic", label: "Agentic system", color: C.orange, width: 8 },
  ];
  const all = series.flatMap((s) => graphData.adoptionCurve[s.key]);
  const min = opts.min ?? 80;
  const max = opts.max ?? Math.max(...all) + 20;
  const sx = (i) => x + (i * w) / (periods.length - 1);
  const sy = (v) => y + h - ((v - min) / (max - min)) * h;
  const yTicks = [100, 140, 180, 220, 260];
  const grid = yTicks.map((t) => `${line(x, sy(t), x + w, sy(t), C.line, 1)}${mono(String(t), x - 52, sy(t) + 6, 16, C.gray, 600)}`).join("");
  const xAxis = periods.map((p, i) => mono(p, sx(i), y + h + 38, 17, C.gray, 700, "middle")).join("");
  const paths = series
    .map((s) => {
      const data = graphData.adoptionCurve[s.key];
      const d = data.map((v, i) => `${i ? "L" : "M"}${sx(i)} ${sy(v)}`).join(" ");
      const dots = data.map((v, i) => `<circle cx="${sx(i)}" cy="${sy(v)}" r="${s.key === "agentic" ? 7 : 5}" fill="${C.paper}" stroke="${s.color}" stroke-width="4"/>`).join("");
      return `<path d="${d}" stroke="${s.color}" stroke-width="${s.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
    })
    .join("");
  const legend = series
    .map((s, i) => `<g transform="translate(${x + w - 410},${y + 28 + i * 42})">${line(0, 0, 46, 0, s.color, s.width)}${mono(s.label, 62, 7, 17, s.color, 800)}</g>`)
    .join("");
  return `<g>
    ${rect(x - 72, y - 58, w + 132, h + 128, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
    ${grid}
    ${line(x, y + h, x + w, y + h, C.ink, 2)}
    ${paths}
    ${xAxis}
    ${legend}
    ${mono(graphData.adoptionCurve.unit, x, y - 20, 17, C.gray, 700)}
    ${text("Agentic workflows compound because reusable context, tools, and QA loops persist across sprints.", x + 520, y + 140, 24, { fill: C.ink, weight: 700, max: 30, lh: 1.18 })}
    ${arrow(x + 900, y + 234, x + 1112, y + 104, C.orange, 6)}
  </g>`;
}

function barChartSvg(x, y, w, h) {
  const data = graphData.impactBars;
  const min = -60;
  const max = 0;
  const rowH = h / data.length;
  const axisX = x + w;
  const rows = data
    .map((d, i) => {
      const yy = y + i * rowH + 12;
      const bw = (Math.abs(d.value) / Math.abs(min)) * w;
      const fill = i === 2 ? C.orange : i === 4 ? C.navy : "#9CA3A8";
      return `<g>
        ${mono(d.label, x - 8, yy + 27, 18, C.ink, 700, "end")}
        ${rect(axisX - bw, yy, bw, 40, fill)}
        ${mono(`${d.value}%`, axisX - bw - 18, yy + 28, 19, fill, 900, "end")}
      </g>`;
    })
    .join("");
  const ticks = [-60, -45, -30, -15, 0]
    .map((t) => {
      const xx = x + ((t - min) / (max - min)) * w;
      return `${line(xx, y - 14, xx, y + h + 8, C.line, 1)}${mono(`${t}%`, xx, y + h + 42, 15, C.gray, 700, "middle")}`;
    })
    .join("");
  return `<g>
    ${rect(x - 260, y - 64, w + 340, h + 126, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
    ${ticks}
    ${line(axisX, y - 18, axisX, y + h + 8, C.ink, 2)}
    ${rows}
    ${mono("Cycle-time change after SprintAI workflow", x - 254, y - 28, 18, C.gray, 700)}
  </g>`;
}

function quadrantSvg(x, y, w, h) {
  const sx = (v) => x + (v / 100) * w;
  const sy = (v) => y + h - (v / 100) * h;
  const points = graphData.quadrant
    .map((d) => `<g transform="translate(${sx(d.x)},${sy(d.y)})">
      <circle r="19" fill="${d.color}" opacity="0.92"/>
      <circle r="28" fill="${d.color}" opacity="0.16"/>
      ${text(d.label, 36, 7, 20, { fill: C.ink, weight: 800, max: 14, lh: 1.05 })}
    </g>`)
    .join("");
  return `<g>
    ${rect(x - 64, y - 60, w + 128, h + 128, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
    ${rect(x, y, w, h, "#FBF9F4", C.ink, 2)}
    ${line(x + w / 2, y, x + w / 2, y + h, C.line, 2, 'stroke-dasharray="8 10"')}
    ${line(x, y + h / 2, x + w, y + h / 2, C.line, 2, 'stroke-dasharray="8 10"')}
    ${rect(x + w / 2, y, w / 2, h / 2, "#FFF1E6", "none", 0, 0, 'opacity="0.75"')}
    ${points}
    ${mono("LOW", x, y + h + 48, 16, C.gray, 800)}
    ${mono("VELOCITY", x + w / 2, y + h + 48, 16, C.ink, 900, "middle")}
    ${mono("HIGH", x + w, y + h + 48, 16, C.gray, 800, "end")}
    <text x="${x - 42}" y="${y + h / 2}" transform="rotate(-90 ${x - 42} ${y + h / 2})" fill="${C.ink}" font-size="17" font-weight="900" font-family="Menlo, Consolas, monospace" text-anchor="middle">GOVERNANCE</text>
    ${mono("Build here first", x + w - 26, y + 34, 18, C.orange, 900, "end")}
  </g>`;
}

function chartAnatomy(x, y, w, h) {
  const data = [28, 34, 39, 47, 62, 86, 112];
  const sx = (i) => x + (i * w) / (data.length - 1);
  const sy = (v) => y + h - ((v - 20) / 100) * h;
  const d = data.map((v, i) => `${i ? "L" : "M"}${sx(i)} ${sy(v)}`).join(" ");
  return `<g>
    ${rect(x - 64, y - 54, w + 128, h + 130, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
    ${[20, 45, 70, 95, 120].map((v) => line(x, sy(v), x + w, sy(v), C.line, 1)).join("")}
    ${line(x, y + h, x + w, y + h, C.ink, 2)}
    <path d="${d}" stroke="${C.orange}" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M${x} ${sy(35)}L${x + w} ${sy(35)}" stroke="${C.navy}" stroke-width="3" stroke-dasharray="10 12" opacity="0.7"/>
    ${data.map((v, i) => `<circle cx="${sx(i)}" cy="${sy(v)}" r="7" fill="${C.paper}" stroke="${C.orange}" stroke-width="4"/>`).join("")}
    ${mono("Focus series", sx(5) + 26, sy(data[5]) - 26, 18, C.orange, 900)}
    ${line(sx(5) + 18, sy(data[5]) - 16, sx(5) + 4, sy(data[5]) - 2, C.orange, 3)}
    ${mono("Baseline", x + w - 6, sy(35) - 10, 16, C.navy, 900, "end")}
    ${mono("Direct annotation", x + 64, y + 42, 16, C.gray, 800)}
    ${text("Explain the inflection, not every point.", x + 64, y + 76, 22, { fill: C.ink, weight: 700, max: 23, lh: 1.14 })}
  </g>`;
}

function swatch(x, y, name, hex, fill, body, textColor = C.ink) {
  const fg = fill === C.ink || fill === C.navy ? C.paper : C.ink;
  return `<g filter="url(#softShadow)">
    ${rect(x, y, 312, 286, fill, C.line, 2, 0)}
    ${text(name, x + 26, y + 54, 32, { fill: fg, weight: 900, max: 14, lh: 0.95, family: "Arial Narrow, Impact, Arial Black, Arial, sans-serif" })}
    ${mono(hex, x + 26, y + 124, 20, fg, 900)}
    ${text(body, x + 26, y + 178, 19, { fill: textColor === C.ink ? fg : textColor, weight: 600, max: 24, lh: 1.2 })}
  </g>`;
}

function miniTemplate(x, y, title, type) {
  const body = rect(x, y, 420, 236, C.card, C.line, 2, 0, 'filter="url(#softShadow)"');
  const orange = type === 0 ? `<path d="M295 ${y - 8}L354 ${y - 8}L232 ${y + 244}L173 ${y + 244}Z" fill="${C.orange}" opacity="0.82"/>` : "";
  const chart = type === 1 ? chartAnatomy(x + 66, y + 86, 286, 82) : "";
  const grid = type === 2 ? `${rect(x + 52, y + 74, 128, 112, C.paper2, C.ink, 2)}${rect(x + 210, y + 74, 148, 54, C.navy)}${rect(x + 210, y + 146, 148, 40, C.orange)}` : "";
  return `<g>
    ${body}
    ${orange}
    ${type === 0 ? headline("REVEAL", x + 34, y + 102, 50, C.ink, 8) : ""}
    ${type === 1 ? chart : ""}
    ${type === 2 ? grid : ""}
    ${mono(title, x + 20, y + 268, 18, C.ink, 900)}
  </g>`;
}

function renderSlide(slide, idx) {
  if (slide.type === "cover") {
    return `${base(slide, idx, false)}
      ${rect(72, 142, 720, 14, C.ink)}
      ${headline(slide.title, 72, 295, 136, C.ink, 15)}
      ${serif("AI is not a marathon.", 82, 610, 42, C.ink, 26, 700)}
      ${serif("It is a sprint with a system.", 82, 666, 42, C.ink, 30, 700)}
      ${rect(80, 760, 405, 110, C.card, C.ink, 2)}
      ${text("Bold  -  Energetic\nEditorial  -  Structured", 112, 812, 29, { fill: C.ink, weight: 800, max: 24, lh: 1.16 })}
      ${rect(520, 760, 110, 110, C.orange)}
      ${rect(652, 760, 110, 110, C.navy)}
      ${rect(784, 760, 110, 110, C.ink)}
      <path d="M1230 -40L1462 -40L862 1120L630 1120Z" fill="${C.orange}" opacity="0.92"/>
      <path d="M1332 -40L1396 -40L796 1120L732 1120Z" fill="#FFB065" opacity="0.72"/>
      ${text(slide.kicker, 1150, 755, 30, { fill: C.ink, weight: 700, max: 30, lh: 1.18 })}
    ${end()}`;
  }

  if (slide.type === "northstar") {
    return `${base(slide, idx)}
      ${headline(slide.title, 78, 235, 116, C.ink, 16)}
      ${text(slide.kicker, 88, 492, 30, { fill: C.gray, weight: 600, max: 34, lh: 1.22 })}
      ${rect(910, 184, 770, 570, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${line(1010, 640, 1580, 640, C.ink, 3)}
      ${line(1010, 640, 1010, 260, C.ink, 3)}
      ${mono("STRUCTURE", 1295, 692, 18, C.ink, 900, "middle")}
      <text x="958" y="450" transform="rotate(-90 958 450)" fill="${C.ink}" font-size="18" font-weight="900" font-family="Menlo, Consolas, monospace" text-anchor="middle">VELOCITY</text>
      ${rect(1298, 304, 220, 146, "#FFF0E4", C.orange, 2)}
      ${headline("SPRINTAI\nZONE", 1325, 356, 46, C.orange, 10)}
      ${arrow(1040, 610, 1505, 318, C.orange, 14)}
      ${card(92, 690, 365, 210, "1. Forward motion", "Every visual should move the audience toward the next action.", C.orange)}
      ${card(500, 690, 365, 210, "2. Editorial clarity", "Dense ideas need magazine-grade hierarchy, not decorative noise.", C.ink)}
      ${card(908, 790, 365, 160, "3. Trust layer", "Show evidence, assumptions, and data provenance where it matters.", C.navy)}
      ${card(1316, 790, 365, 160, "4. Reusable system", "Templates and graph rules make quality repeatable.", C.teal)}
    ${end()}`;
  }

  if (slide.type === "palette") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 220, 104, C.ink, 18)}
      ${text(slide.kicker, 84, 432, 28, { fill: C.gray, weight: 600, max: 46, lh: 1.2 })}
      ${swatch(90, 560, "SPRINT\nORANGE", "#F47A20", C.orange, "Primary kinetic color. Use for direction, focus, and decisions.")}
      ${swatch(448, 560, "SPRINT\nNAVY", "#183C5C", C.navy, "System color. Use for structure, interface panels, and comparison lines.")}
      ${swatch(806, 560, "CIRCUIT\nBLACK", "#0F1419", C.ink, "Authority color. Use for headlines, dark slides, and technical depth.")}
      ${swatch(1164, 560, "PAPER\nWHITE", "#FAFAF7", C.paper, "Editorial base. Preserve space so evidence feels premium.")}
      ${rect(1452, 220, 324, 238, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("USAGE MIX", 1484, 266, 18, C.orange, 900)}
      ${renderUsageMix(1484, 310, 245, 34)}
    ${end()}`;
  }

  if (slide.type === "typography") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 228, 108, C.ink, 18)}
      ${serif("Artificial intelligence is not a tool we simply adopt; it is a trajectory we actively steer.", 748, 260, 40, C.ink, 42, 600)}
      ${rect(748, 388, 890, 2, C.ink)}
      ${text(slide.kicker, 748, 452, 28, { fill: C.gray, weight: 600, max: 52, lh: 1.2 })}
      ${rect(108, 612, 390, 230, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("H1 / CONDENSED", 136, 658, 17, C.orange, 900)}
      ${headline("THE SPEED\nOF INTELLIGENCE", 136, 728, 54, C.ink, 18)}
      ${rect(548, 612, 390, 230, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("BODY / EDITORIAL", 576, 658, 17, C.orange, 900)}
      ${serif("Strategic insight should feel precise, not generic.", 576, 720, 36, C.ink, 24, 600)}
      ${rect(988, 612, 390, 230, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("DATA / MONO", 1016, 658, 17, C.orange, 900)}
      ${mono("Impact   -48%", 1016, 730, 34, C.ink, 900)}
      ${mono("Latency  02.4s", 1016, 786, 34, C.navy, 900)}
      ${rect(1428, 612, 330, 230, C.ink, C.ink, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("VOICE RULE", 1456, 658, 17, C.orange2, 900)}
      ${text("Say less. Show the mechanism.", 1456, 734, 34, { fill: C.paper, weight: 900, max: 18, lh: 1.05, family: "Arial Narrow, Impact, Arial Black, Arial, sans-serif" })}
    ${end()}`;
  }

  if (slide.type === "grid") {
    const cols = Array.from({ length: 12 }, (_, i) => rect(770 + i * 70, 260, 48, 390, i % 2 ? "#F8F5EF" : "#EFE8DC", C.line, 1)).join("");
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 222, 108, C.ink, 18)}
      ${text(slide.kicker, 84, 438, 28, { fill: C.gray, weight: 600, max: 42, lh: 1.2 })}
      ${rect(735, 208, 940, 560, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${cols}
      ${rect(810, 315, 296, 220, C.paper, C.ink, 3)}
      ${headline("HEADLINE", 835, 394, 50, C.ink, 10)}
      ${rect(1135, 315, 418, 92, C.navy)}
      ${text("Evidence block", 1160, 372, 28, { fill: C.paper, weight: 800, max: 18 })}
      ${rect(1135, 435, 418, 126, C.orange, "none", 0, 0, 'opacity="0.92"')}
      ${text("Decision signal", 1160, 512, 32, { fill: C.paper, weight: 900, max: 18 })}
      ${arrow(870, 620, 1506, 620, C.orange, 8)}
      ${card(112, 690, 420, 196, "Strict hierarchy", "Make one message visually dominant before adding supporting detail.", C.ink)}
      ${card(572, 690, 420, 196, "Evidence zone", "Graphs, UI, or proof should occupy a stable visual area.", C.orange)}
      ${card(1032, 690, 420, 196, "Breathing room", "Empty space is part of the system, especially in executive slides.", C.navy)}
    ${end()}`;
  }

  if (slide.type === "components") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 220, 104, C.ink, 18)}
      ${text(slide.kicker, 84, 430, 28, { fill: C.gray, weight: 600, max: 46, lh: 1.2 })}
      ${rect(110, 586, 312, 78, C.orange)}${mono("DEPLOY SYSTEM", 266, 636, 20, C.paper, 900, "middle")}
      ${rect(110, 692, 312, 78, C.ember)}${mono("DEPLOY SYSTEM", 266, 742, 20, C.paper, 900, "middle")}
      ${rect(110, 798, 312, 78, C.navy)}${mono("VIEW DOCUMENTATION", 266, 848, 18, C.paper, 900, "middle")}
      ${rect(510, 586, 348, 290, C.card, C.line, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("METRIC TILE", 544, 636, 17, C.orange, 900)}
      ${headline("84.2%", 544, 738, 78, C.ink, 8)}
      ${text("Template reuse rate across recurring SprintAI decks.", 548, 806, 22, { fill: C.gray, weight: 600, max: 24, lh: 1.2 })}
      ${rect(940, 586, 520, 290, C.paper, C.ink, 2, 0, 'filter="url(#softShadow)"')}
      ${rect(940, 586, 9, 290, C.orange)}
      ${serif("Strategic Insight:\nAcceleration requires standardization.", 988, 668, 38, C.ink, 25, 600)}
      ${rect(1518, 586, 276, 290, C.ink, C.ink, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("CODE PANEL", 1546, 636, 17, C.orange2, 900)}
      ${mono("> run sprint", 1546, 704, 24, C.orange2, 800)}
      ${mono("> verify graph", 1546, 754, 24, C.paper, 800)}
      ${mono("> ship deck", 1546, 804, 24, C.paper, 800)}
    ${end()}`;
  }

  if (slide.type === "chartAnatomy") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 190, 84, C.ink, 16)}
      ${text(slide.kicker, 84, 452, 27, { fill: C.gray, weight: 600, max: 30, lh: 1.2 })}
      ${chartAnatomy(730, 258, 850, 520)}
      ${card(116, 690, 330, 198, "1. Gray baselines", "Comparison and grid lines stay quiet so the message remains clear.", C.gray)}
      ${card(484, 790, 330, 158, "2. Orange focus", "Only the decision series gets Sprint Orange.", C.orange)}
      ${card(852, 820, 330, 128, "3. Direct labels", "Avoid legends when labels can live near the data.", C.navy)}
    ${end()}`;
  }

  if (slide.type === "adoptionGraph") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 185, 78, C.ink, 26)}
      ${text(slide.kicker, 84, 310, 25, { fill: C.gray, weight: 600, max: 72, lh: 1.18 })}
      ${lineChartSvg(300, 424, 1240, 360, { max: 290 })}
      ${text("Use as a proposal graph: replace Q labels with sprint weeks and update the index from measured throughput.", 108, 875, 24, { fill: C.ink, weight: 800, max: 76, lh: 1.18 })}
      ${mono(slide.source, 108, 934, 15, C.gray, 700)}
    ${end()}`;
  }

  if (slide.type === "impactGraph") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 185, 78, C.ink, 26)}
      ${text(slide.kicker, 84, 310, 25, { fill: C.gray, weight: 600, max: 72, lh: 1.18 })}
      ${barChartSvg(650, 390, 820, 350)}
      ${rect(110, 590, 402, 174, C.ink, C.ink, 2, 0, 'filter="url(#softShadow)"')}
      ${mono("READ THIS WAY", 140, 638, 17, C.orange2, 900)}
      ${text("Every bar needs a workflow owner, a measurement window, and a before-after baseline.", 140, 696, 27, { fill: C.paper, weight: 800, max: 28, lh: 1.12 })}
      ${mono(slide.source, 650, 826, 15, C.gray, 700)}
    ${end()}`;
  }

  if (slide.type === "quadrant") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 185, 78, C.ink, 14)}
      ${text(slide.kicker, 84, 420, 25, { fill: C.gray, weight: 600, max: 40, lh: 1.18 })}
      ${quadrantSvg(690, 252, 810, 520)}
      ${card(116, 660, 386, 180, "Decision use", "Prioritize reusable assets that increase speed without weakening governance.", C.orange)}
      ${mono(slide.source, 690, 844, 15, C.gray, 700)}
    ${end()}`;
  }

  if (slide.type === "templates") {
    return `${base(slide, idx)}
      ${headline(slide.title, 72, 210, 100, C.ink, 18)}
      ${text(slide.kicker, 84, 408, 27, { fill: C.gray, weight: 600, max: 46, lh: 1.2 })}
      ${miniTemplate(170, 602, "01 / Reveal", 0)}
      ${miniTemplate(750, 602, "02 / Prove with data", 1)}
      ${miniTemplate(1330, 602, "03 / Explain system", 2)}
      ${pill(172, 512, "HOOK", C.orange, C.paper)}
      ${pill(752, 512, "EVIDENCE", C.navy, C.paper)}
      ${pill(1332, 512, "FRAMEWORK", C.ink, C.paper)}
    ${end()}`;
  }

  if (slide.type === "rules") {
    return `${base(slide, idx, true)}
      ${headline(slide.title, 126, 280, 126, C.paper, 18)}
      ${text(slide.kicker, 136, 560, 32, { fill: "#CBD2D8", weight: 600, max: 50, lh: 1.18 })}
      ${rect(1130, 220, 520, 560, "rgba(250,250,247,0.06)", "rgba(250,250,247,0.18)", 2)}
      ${mono("PRODUCTION CHECK", 1170, 282, 19, C.orange2, 900)}
      ${["One governing message", "Orange marks the decision", "Graph uses direct labels", "Source or assumption visible", "No decorative component without job"].map((d, i) => `<g transform="translate(1170,${350 + i * 72})"><circle cx="0" cy="0" r="14" fill="${C.orange}"/><path d="M-7 0L-1 7L9 -8" stroke="${C.paper}" stroke-width="4" fill="none" stroke-linecap="round"/><text x="34" y="8" fill="${C.paper}" font-size="27" font-weight="800" font-family="Arial, Helvetica, sans-serif">${esc(d)}</text></g>`).join("")}
    ${end()}`;
  }

  throw new Error(`Unknown slide type: ${slide.type}`);
}

function graphOnlySvg(kind) {
  const fakeSlide = { tag: "GRAPH ASSET" };
  if (kind === "adoption") return `${base(fakeSlide, 0)}${lineChartSvg(304, 230, 1240, 600, { max: 290 })}${end()}`;
  if (kind === "impact") return `${base(fakeSlide, 1)}${barChartSvg(625, 300, 820, 430)}${end()}`;
  if (kind === "quadrant") return `${base(fakeSlide, 2)}${quadrantSvg(490, 220, 940, 620)}${end()}`;
  throw new Error(`Unknown graph kind: ${kind}`);
}

async function createContactSheet(pngPaths) {
  const thumbW = 420;
  const thumbH = 236;
  const labelH = 34;
  const cols = 3;
  const rows = Math.ceil(pngPaths.length / cols);
  const composites = [];
  for (let i = 0; i < pngPaths.length; i++) {
    const input = await sharp(pngPaths[i]).resize(thumbW, thumbH, { fit: "cover" }).png().toBuffer();
    const x = (i % cols) * thumbW;
    const y = Math.floor(i / cols) * (thumbH + labelH);
    composites.push({ input, left: x, top: y });
    const label = `<svg width="${thumbW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="${thumbW}" height="${labelH}" fill="#FAFAF7"/><text x="12" y="23" font-size="18" font-family="Arial" fill="#0F1419">${String(i + 1).padStart(2, "0")} ${esc(slides[i].tag)}</text></svg>`;
    composites.push({ input: Buffer.from(label), left: x, top: y + thumbH });
  }
  const sheetPath = path.join(IMG_DIR, "contact-sheet.png");
  await sharp({
    create: {
      width: cols * thumbW,
      height: rows * (thumbH + labelH),
      channels: 4,
      background: C.paper,
    },
  })
    .composite(composites)
    .png()
    .toFile(sheetPath);
  return sheetPath;
}

async function writeGraphAssets() {
  const assets = [
    ["graph-adoption-curve", "adoption"],
    ["graph-impact-bars", "impact"],
    ["graph-pattern-map", "quadrant"],
  ];
  for (const [name, kind] of assets) {
    const svg = graphOnlySvg(kind);
    const svgPath = path.join(GRAPH_DIR, `${name}.svg`);
    const pngPath = path.join(GRAPH_DIR, `${name}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
  }
}

async function main() {
  [IMG_DIR, GRAPH_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "SprintAI";
  pptx.subject = "SprintAI visual design system";
  pptx.title = "02 - SprintAI Design System";
  pptx.lang = "en-US";
  pptx.theme = {
    headFontFace: "Arial Narrow",
    bodyFontFace: "Arial",
    lang: "en-US",
  };
  pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333333, height: 7.5 });
  pptx.layout = "CUSTOM_WIDE";

  const pngPaths = [];
  const notes = [
    "# 02 - SprintAI Design System",
    "",
    "Format: 16:9 PowerPoint with full-slide rendered PNGs plus source SVG files.",
    "Purpose: usable visual design system for SprintAI presentation decks, including graph templates.",
    "Graph note: values are illustrative design-system data; replace with measured client or product data before external reporting.",
    "",
    "## Slide outline",
    "",
  ];

  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const svg = renderSlide(slides[i], i);
    const svgPath = path.join(IMG_DIR, `slide-${n}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${n}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    pngPaths.push(pngPath);

    const s = pptx.addSlide();
    s.background = { color: slides[i].type === "rules" ? "0F1419" : "FAFAF7" };
    s.addImage({ path: pngPath, x: 0, y: 0, w: 13.333333, h: 7.5 });
    if (typeof s.addNotes === "function") s.addNotes([slides[i].note]);

    notes.push(`### ${n}. ${slides[i].title.replace(/\n/g, " ")}`);
    notes.push(`- Role: ${slides[i].tag}`);
    notes.push(`- Message: ${slides[i].kicker}`);
    if (slides[i].source) notes.push(`- Source: ${slides[i].source}`);
    notes.push(`- Speaker note: ${slides[i].note}`);
    notes.push("");
  }

  await writeGraphAssets();
  const contactSheet = await createContactSheet(pngPaths);

  const dataPath = path.join(NOTES_DIR, `${OUT_NAME}-graph-data.json`);
  fs.writeFileSync(dataPath, JSON.stringify(graphData, null, 2));

  notes.push("## Assets");
  notes.push(`- Contact sheet: ${contactSheet}`);
  notes.push(`- Graph data: ${dataPath}`);
  notes.push(`- Standalone graph PNG/SVG assets: ${GRAPH_DIR}`);
  fs.writeFileSync(path.join(NOTES_DIR, `${OUT_NAME}-outline.md`), notes.join("\n"));

  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${OUT_NAME}.pptx`) });
  console.log(`Saved PPTX: ${path.join(OUT_DIR, `${OUT_NAME}.pptx`)}`);
  console.log(`Slides: ${slides.length}`);
  console.log(`Images: ${IMG_DIR}`);
  console.log(`Contact sheet: ${contactSheet}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
