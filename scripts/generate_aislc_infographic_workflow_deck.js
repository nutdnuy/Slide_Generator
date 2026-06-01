const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const PROJECT = "aislc-ch4-krungsri-infographic-workflow";
const IMG_DIR = path.join(ROOT, "assets", "images", PROJECT);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");
const W = 1920;
const H = 1080;
const PPT_W = 13.333;
const PPT_H = 7.5;

const C = {
  white: "#FFFFFF",
  bg: "#FBFCFD",
  navy: "#1A2E4A",
  blue: "#2C4F77",
  yellow: "#FDB913",
  gold: "#B88A0D",
  pale: "#FEF3D0",
  gray: "#333333",
  muted: "#6B7280",
  line: "#CCCCCC",
  light: "#F2F2F2",
  green: "#00843D",
  red: "#C8102E",
};

const FONT = "Thonburi, Sarabun, Arial, Helvetica, sans-serif";

const slides = [
  {
    title: "AI-SLC Workflow at a Glance",
    subtitle: "One operating path from AI idea to controlled retirement",
    kind: "overview",
    footer: "AISLC Procedure v1.0 | Chapter 4",
  },
  {
    title: "Gate 0: Intake Triage",
    subtitle: "Decide whether the use case enters AI-SLC before build, buy, or customise",
    kind: "intake",
    footer: "Sections 4.2.1 and 4.2.2",
  },
  {
    title: "Risk Router",
    subtitle: "Risk factors and hard triggers route the use case into Low, Medium, or High governance",
    kind: "risk",
    footer: "Section 4.1.1 | Appendix 2",
  },
  {
    title: "Control Gate Engine",
    subtitle: "Each lifecycle phase closes only when required evidence is complete",
    kind: "gates",
    footer: "Section 4.1.2 | Appendix 3",
  },
  {
    title: "Swimlane Handoff Model",
    subtitle: "Business, AI CoE, IT, Risk, Compliance, and approval forums move evidence together",
    kind: "swimlane",
    footer: "Sections 4.1 and 4.2",
  },
  {
    title: "Human Oversight Router",
    subtitle: "HITL, HOTL, or stop: the workflow must assign human accountability before go-live",
    kind: "oversight",
    footer: "Section 4.1.3",
  },
  {
    title: "Customer-Facing AI Disclosure Flow",
    subtitle: "Customer AI touchpoints need disclosure, opt-out, safe guidance, and retained evidence",
    kind: "disclosure",
    footer: "Section 4.1.4",
  },
  {
    title: "Production Loop and Controlled Closure",
    subtitle: "Go-live starts the monitoring loop; retirement closes the evidence trail",
    kind: "runclose",
    footer: "Sections 4.2.4 and 4.2.5",
  },
];

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

function wrap(text, maxChars) {
  const out = [];
  String(text).split("\n").forEach((para) => {
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

function text(textValue, x, y, size, fill = C.gray, weight = 400, max = 34, opts = {}) {
  const lines = wrap(textValue, max);
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
  const lh = opts.lh || 1.12;
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function rect(x, y, w, h, fill, stroke = C.line, r = 10, sw = 2) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function chip(x, y, label, fill = C.pale, color = C.gold) {
  const w = Math.max(130, label.length * 11 + 42);
  return `${rect(x, y, w, 40, fill, "none", 20, 0)}${text(label, x + w / 2, y + 27, 18, color, 800, 20, { anchor: "middle" })}`;
}

function arrow(x1, y1, x2, y2, color = C.gold, width = 5) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ax = x2 - Math.cos(angle) * 18;
  const ay = y2 - Math.sin(angle) * 18;
  const p1x = ax + Math.cos(angle + Math.PI * 0.75) * 18;
  const p1y = ay + Math.sin(angle + Math.PI * 0.75) * 18;
  const p2x = ax + Math.cos(angle - Math.PI * 0.75) * 18;
  const p2y = ay + Math.sin(angle - Math.PI * 0.75) * 18;
  return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round"/>
    <path d="M${x2} ${y2}L${p1x} ${p1y}M${x2} ${y2}L${p2x} ${p2y}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round"/>`;
}

function node(x, y, w, h, title, body, opts = {}) {
  const fill = opts.fill || C.white;
  const stroke = opts.stroke || C.line;
  const titleColor = opts.titleColor || C.navy;
  const accent = opts.accent || C.yellow;
  return `<g>
    ${rect(x, y, w, h, fill, stroke, opts.r || 12, opts.sw || 2)}
    <rect x="${x}" y="${y}" width="10" height="${h}" rx="5" fill="${accent}"/>
    ${text(title, x + 28, y + 42, opts.titleSize || 26, titleColor, 800, Math.floor((w - 48) / 13))}
    ${body ? text(body, x + 28, y + 88, opts.bodySize || 18, C.gray, 400, Math.floor((w - 48) / 9.5), { lh: 1.2 }) : ""}
  </g>`;
}

function circleNode(cx, cy, r, n, label, opts = {}) {
  const fill = opts.fill || C.white;
  const stroke = opts.stroke || C.gold;
  const numColor = opts.numColor || C.gold;
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="5"/>
    ${text(n, cx, cy + 11, 34, numColor, 900, 4, { anchor: "middle" })}
    ${text(label, cx, cy + r + 44, 20, C.navy, 800, 16, { anchor: "middle", lh: 1.08 })}
  </g>`;
}

function header(slide, idx) {
  return `<rect width="${W}" height="${H}" fill="${C.bg}"/>
    <rect x="0" y="0" width="${W}" height="14" fill="${C.yellow}"/>
    <rect x="1684" y="0" width="105" height="105" fill="#EEF7F8"/>
    <rect x="1789" y="105" width="131" height="124" fill="#EEF7F8"/>
    ${text(slide.title, 78, 102, slide.title.length > 62 ? 46 : 54, C.navy, 900, 42)}
    ${text(slide.subtitle, 80, 188, 27, C.gold, 500, 82)}
    ${chip(80, 250, `0${idx + 1} / ${String(slides.length).padStart(2, "0")}`, C.pale, C.gold)}
  `;
}

function footer(slide) {
  return `<line x1="78" y1="990" x2="1690" y2="990" stroke="${C.line}" stroke-width="1"/>
    ${text(`Source: ${slide.footer}`, 78, 1030, 18, C.muted, 400, 80)}
    ${text("Krungsri AI-SLC Workflow", 1838, 1032, 24, C.navy, 900, 30, { anchor: "end" })}
    <rect x="1852" y="1002" width="28" height="16" fill="${C.yellow}"/>`;
}

function overview() {
  const labels = [
    ["Trigger", "AI idea / vendor / model"],
    ["Intake", "BRD + owner + use case"],
    ["Risk route", "Low / Medium / High"],
    ["Controls", "Checklist selected"],
    ["Build gates", "Evidence completed"],
    ["Go-live", "ARB + UAT + IRP"],
    ["Run loop", "Monitor + reassess"],
    ["Closure", "Archive + dispose"],
  ];
  const y = 540;
  return labels.map((d, i) => {
    const x = 112 + i * 218;
    return `${i < labels.length - 1 ? arrow(x + 82, y, x + 194, y, C.gold, 4) : ""}
      ${circleNode(x, y, 48, String(i + 1), d[0], { fill: i === 0 ? C.gold : C.white, numColor: i === 0 ? C.white : C.gold })}
      ${text(d[1], x, y + 104, 18, C.gray, 500, 18, { anchor: "middle" })}`;
  }).join("") + `${node(118, 725, 780, 135, "Workflow principle", "Every AI use case must remain traceable, risk-routed, and evidence-backed from intake to closure.", { accent: C.navy })}
    ${node(1020, 725, 780, 135, "Gate principle", "The next phase starts only after applicable controls and artifacts are completed and reviewable.", { accent: C.yellow })}`;
}

function intake() {
  return `${node(116, 398, 315, 135, "AI proposal", "Build, buy, customise, or operate AI in a business process.", { accent: C.yellow })}
    ${arrow(431, 466, 520, 466)}
    ${node(520, 375, 360, 180, "Triage questions", "Does it affect customers, decisions, sensitive data, or critical operations?", { accent: C.navy })}
    ${arrow(880, 466, 980, 390)}
    ${arrow(880, 466, 980, 545)}
    ${node(980, 315, 380, 150, "Yes / uncertain", "Register use case and start AISLC intake immediately.", { accent: C.red })}
    ${node(980, 510, 380, 150, "No / not AI-SLC", "Document rationale and follow normal technology / process controls.", { accent: C.green })}
    ${arrow(1360, 390, 1485, 390)}
    ${node(1485, 315, 300, 150, "Intake pack", "BRD, owner, KPI, impact, users, data, intended use.", { accent: C.yellow })}`;
}

function risk() {
  return `${node(105, 365, 330, 150, "Impact risk", "Business impact, customer impact, decision reliance, strategic function.", { accent: C.red })}
    ${node(105, 590, 330, 150, "Inherent AI risk", "Model source, data sensitivity, sharing, provenance, AI reliance.", { accent: C.blue })}
    ${arrow(435, 440, 610, 520)}
    ${arrow(435, 665, 610, 560)}
    ${node(610, 445, 330, 170, "Risk scoring", "Consolidate impact and inherent risk into an initial risk level.", { accent: C.yellow })}
    ${arrow(940, 530, 1080, 530)}
    ${node(1080, 445, 325, 170, "Hard triggers", "Third-party / OSS model, external sharing, personal or sensitive data.", { accent: C.red })}
    ${arrow(1405, 530, 1532, 530)}
    ${node(1532, 350, 260, 95, "Low", "Baseline controls", { accent: C.green, titleSize: 24, bodySize: 17 })}
    ${node(1532, 490, 260, 95, "Medium", "Enhanced controls", { accent: C.yellow, titleSize: 24, bodySize: 17 })}
    ${node(1532, 630, 260, 95, "High", "Strict controls", { accent: C.red, titleSize: 24, bodySize: 17 })}`;
}

function gates() {
  const items = [
    ["Initiation", "BRD, risk assessment, inventory"],
    ["Develop / source", "Data, vendor, model card, validation"],
    ["Implementation", "ARB, security, UAT, fallback, IRP"],
    ["Operation", "Monitoring, alerts, incidents, access logs"],
    ["Decommission", "Archive, dispose, notify, closure"],
  ];
  return items.map((d, i) => {
    const x = 110 + i * 355;
    return `${i < items.length - 1 ? arrow(x + 245, 562, x + 330, 562, C.gold, 4) : ""}
      ${node(x, 430, 255, 265, d[0], d[1], { accent: i === 4 ? C.red : C.yellow, titleSize: 25, bodySize: 18 })}`;
  }).join("") + `${text("Gate rule: required evidence complete?", 960, 770, 34, C.navy, 900, 42, { anchor: "middle" })}
    ${text("If no: remediate and stay in phase. If yes: approve phase progression.", 960, 820, 24, C.gray, 500, 70, { anchor: "middle" })}`;
}

function swimlane() {
  const lanes = [
    ["Business Owner", "Use case, KPI, impact, customer context"],
    ["AI CoE", "Risk route, controls, model governance"],
    ["IT / Security / ARB", "Architecture, deployment, security, UAT"],
    ["Risk / Compliance / Legal", "Regulation, PDPA, vendor, disclosure"],
  ];
  const stages = ["Intake", "Risk route", "Build", "Launch", "Operate"];
  let s = `<g>${stages.map((st, i) => {
    const x = 505 + i * 245;
    return `${text(st, x + 80, 352, 20, C.navy, 900, 16, { anchor: "middle" })}<line x1="${x}" y1="372" x2="${x}" y2="860" stroke="${C.line}" stroke-width="1"/>`;
  }).join("")}</g>`;
  lanes.forEach((lane, r) => {
    const y = 410 + r * 110;
    s += `${rect(105, y, 330, 78, C.white, C.line, 8, 2)}${text(lane[0], 130, y + 33, 24, C.navy, 900, 20)}${text(lane[1], 130, y + 62, 15, C.gray, 400, 36)}
      <path d="M505 ${y + 39}H1570" stroke="${r === 0 ? C.gold : r === 1 ? C.blue : r === 2 ? C.green : C.red}" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
      ${[0,1,2,3,4].map((i) => `<circle cx="${585 + i * 245}" cy="${y + 39}" r="17" fill="${C.white}" stroke="${C.navy}" stroke-width="3"/>`).join("")}`;
  });
  return s;
}

function oversight() {
  return `${node(125, 395, 350, 155, "Does AI act before human review?", "If output needs review before use, route to HITL.", { accent: C.navy })}
    ${arrow(475, 472, 620, 382)}
    ${arrow(475, 472, 620, 575)}
    ${node(620, 315, 355, 145, "HITL", "Reviewer accepts, rejects, or adjusts before downstream action.", { accent: C.green })}
    ${node(620, 520, 355, 145, "Autonomous action?", "If AI executes action automatically, assess HOTL eligibility.", { accent: C.yellow })}
    ${arrow(975, 592, 1120, 592)}
    ${node(1120, 510, 330, 165, "HOTL allowed only if Low Risk", "Supervisor must monitor and intervene, throttle, override, or halt.", { accent: C.red })}
    ${arrow(1450, 592, 1585, 592)}
    ${node(1585, 510, 230, 165, "Record", "Reviewer or supervisor accountability evidence.", { accent: C.navy })}`;
}

function disclosure() {
  const items = [
    ["AI touchpoint", "Customer interacts with AI-enabled service"],
    ["Disclosure", "Tell customer it is powered by AI before service"],
    ["Opt-out", "Allow disable, bypass, or escalation path"],
    ["Safe guidance", "Explain appropriate and safe use"],
    ["Evidence", "Retain wording, screen, flow, approval"],
  ];
  return items.map((d, i) => {
    const x = 115 + i * 350;
    return `${i < items.length - 1 ? arrow(x + 235, 545, x + 325, 545, C.gold, 4) : ""}
      ${node(x, 420, 245, 250, d[0], d[1], { accent: i === 1 ? C.red : C.yellow, titleSize: 24, bodySize: 17 })}`;
  }).join("");
}

function runclose() {
  const loop = [
    ["Monitor", 585, 465],
    ["Alert", 760, 360],
    ["Intervene", 960, 360],
    ["Reassess", 1135, 465],
    ["Improve", 960, 575],
  ];
  let s = `<ellipse cx="900" cy="470" rx="390" ry="210" fill="${C.white}" stroke="${C.line}" stroke-width="3"/>`;
  loop.forEach((d, i) => {
    s += `${circleNode(d[1], d[2], 42, String(i + 1), d[0], { fill: i === 0 ? C.gold : C.white, numColor: i === 0 ? C.white : C.gold })}`;
  });
  s += `${arrow(1210, 470, 1435, 470, C.red, 5)}
    ${node(1435, 365, 335, 210, "Closure trigger", "No longer required, superseded, degraded, or no longer compliant.", { accent: C.red })}
    ${node(130, 365, 300, 210, "Live system", "Production AI remains inside monitoring and evidence loop.", { accent: C.green })}
    ${arrow(430, 470, 520, 470, C.green, 5)}
    ${node(1435, 635, 335, 150, "Close evidence", "Retirement request, archive, disposal, stakeholder notice, closure record.", { accent: C.navy })}`;
  return s;
}

function body(kind) {
  if (kind === "overview") return overview();
  if (kind === "intake") return intake();
  if (kind === "risk") return risk();
  if (kind === "gates") return gates();
  if (kind === "swimlane") return swimlane();
  if (kind === "oversight") return oversight();
  if (kind === "disclosure") return disclosure();
  return runclose();
}

function svg(slide, idx) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${header(slide, idx)}
    ${body(slide.kind)}
    ${footer(slide)}
  </svg>`;
}

async function main() {
  ensureDir(IMG_DIR);
  ensureDir(OUT_DIR);
  ensureDir(NOTES_DIR);

  const imagePaths = [];
  for (let i = 0; i < slides.length; i++) {
    const no = String(i + 1).padStart(2, "0");
    const svgPath = path.join(IMG_DIR, `slide-${no}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${no}.png`);
    const data = svg(slides[i], i);
    fs.writeFileSync(svgPath, data, "utf8");
    await sharp(Buffer.from(data)).png().toFile(pngPath);
    imagePaths.push(pngPath);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Slide_Generator";
  pptx.subject = "AISLC Chapter 4 infographic workflow";
  pptx.title = PROJECT;
  pptx.lang = "en-US";

  slides.forEach((item, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({ path: imagePaths[i], x: 0, y: 0, w: PPT_W, h: PPT_H });
    slide.addNotes([`${item.title}\n${item.subtitle}\nSource: ${item.footer}`]);
  });

  const output = path.join(OUT_DIR, `${PROJECT}.pptx`);
  await pptx.writeFile({ fileName: output });

  const outline = [
    `# ${PROJECT}`,
    "",
    "All slides are full-page infographic workflow slides.",
    "",
    ...slides.map((s, i) => `## ${i + 1}. ${s.title}\n- ${s.subtitle}\n- Source: ${s.footer}\n`),
  ].join("\n");
  fs.writeFileSync(path.join(NOTES_DIR, `${PROJECT}-outline.md`), outline, "utf8");

  console.log(`[OK] Wrote ${output}`);
  console.log(`[OK] Wrote ${slides.length} infographic slide images to ${IMG_DIR}`);
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
