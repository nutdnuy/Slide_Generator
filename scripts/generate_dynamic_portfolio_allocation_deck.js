const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pptxgen = require("pptxgenjs");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "outputs");
const imageDir = path.join(root, "assets/images/dynamic-portfolio-allocation");
const notesDir = path.join(root, "notes");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(notesDir, { recursive: true });

const W = 1920;
const H = 1080;
const C = {
  bg: "#121212",
  s1: "#1D1D1D",
  s2: "#242424",
  green: "#69F0AE",
  cyan: "#03DAC6",
  amber: "#FFB74D",
  red: "#CF6679",
  text: "#F0F0F0",
  muted: "#A6A6A6",
  grid: "#343434",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(lines, x, y, opts = {}) {
  const size = opts.size || 34;
  const color = opts.color || C.text;
  const weight = opts.weight || 400;
  const family = opts.family || "Arial";
  const lh = opts.lh || Math.round(size * 1.28);
  return lines
    .map((line, i) => {
      const t = typeof line === "string" ? line : line.text;
      const c = line.color || color;
      const w = line.weight || weight;
      return `<text x="${x}" y="${y + i * lh}" font-family="${family}" font-size="${size}" font-weight="${w}" fill="${c}">${esc(t)}</text>`;
    })
    .join("\n");
}

function bullets(items, x, y, widthChars = 52, opts = {}) {
  const size = opts.size || 32;
  const lh = opts.lh || 42;
  let svg = "";
  let cy = y;
  for (const item of items) {
    const lines = wrap(item, widthChars);
    svg += `<circle cx="${x}" cy="${cy - 10}" r="5" fill="${opts.dot || C.green}"/>`;
    svg += textBlock(lines, x + 24, cy, { size, color: opts.color || C.text, lh });
    cy += lh * lines.length + 18;
  }
  return svg;
}

function panel(x, y, w, h, title, body, accent = C.green) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.s1}" stroke="${C.grid}" stroke-width="1.5"/>
  <rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="${accent}"/>
  <text x="${x + 30}" y="${y + 52}" font-family="Arial" font-size="28" font-weight="700" fill="${accent}">${esc(title)}</text>
  ${textBlock(wrap(body, Math.floor(w / 18)), x + 30, y + 102, { size: 28, color: C.text, lh: 37 })}
  `;
}

function formula(x, y, main, sub = "") {
  return `
  <rect x="${x}" y="${y}" width="760" height="150" rx="18" fill="#171717" stroke="${C.cyan}" stroke-width="1.4"/>
  <text x="${x + 34}" y="${y + 78}" font-family="Arial" font-size="43" font-weight="700" fill="${C.text}">${esc(main)}</text>
  <text x="${x + 36}" y="${y + 121}" font-family="Arial" font-size="23" fill="${C.muted}">${esc(sub)}</text>`;
}

function gridBg() {
  let svg = `<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
  for (let x = 0; x <= W; x += 80) svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.grid}" stroke-width="0.6" opacity="0.28"/>`;
  for (let y = 0; y <= H; y += 80) svg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.grid}" stroke-width="0.6" opacity="0.28"/>`;
  svg += `<path d="M0 880 C420 760 630 930 980 780 S1530 650 1920 735" fill="none" stroke="${C.green}" stroke-width="3" opacity="0.18"/>`;
  svg += `<path d="M0 260 C350 330 620 180 1010 290 S1540 420 1920 250" fill="none" stroke="${C.cyan}" stroke-width="2" opacity="0.12"/>`;
  return svg;
}

function header(n, kicker, title, subtitle) {
  return `
  <text x="92" y="78" font-family="Arial" font-size="22" letter-spacing="3" fill="${C.green}">${esc(kicker.toUpperCase())}</text>
  <text x="92" y="145" font-family="Arial Narrow, Arial" font-size="64" font-weight="800" fill="${C.text}">${esc(title)}</text>
  ${subtitle ? textBlock(wrap(subtitle, 78), 96, 200, { size: 28, color: C.muted, lh: 36 }) : ""}
  <text x="1758" y="78" font-family="Arial" font-size="23" fill="${C.muted}">SLIDE ${String(n).padStart(2, "0")}</text>
  <line x1="92" y1="238" x2="1828" y2="238" stroke="${C.grid}" stroke-width="1.5"/>
  `;
}

function efficientFrontier(x, y, w, h, labels = true) {
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const px = x + 80 + t * (w - 130);
    const py = y + h - 70 - Math.sqrt(t) * (h - 130);
    pts.push([px, py]);
  }
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.s1}" stroke="${C.grid}"/>
  <line x1="${x + 60}" y1="${y + h - 60}" x2="${x + w - 45}" y2="${y + h - 60}" stroke="${C.muted}" opacity="0.55"/>
  <line x1="${x + 60}" y1="${y + h - 60}" x2="${x + 60}" y2="${y + 44}" stroke="${C.muted}" opacity="0.55"/>
  <path d="${d}" fill="none" stroke="${C.green}" stroke-width="5"/>
  <path d="M ${x + 115} ${y + h - 95} L ${x + w - 95} ${y + 80}" fill="none" stroke="${C.red}" stroke-width="2" opacity="0.35" stroke-dasharray="12 12"/>
  ${pts.filter((_, i) => i % 2 === 0).map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${i < 2 ? C.cyan : i > 4 ? C.amber : C.green}"/>`).join("")}
  ${labels ? `<text x="${x + w - 190}" y="${y + h - 22}" font-family="Arial" font-size="22" fill="${C.muted}">Volatility</text><text x="${x + 16}" y="${y + 42}" font-family="Arial" font-size="22" fill="${C.muted}">Return</text>` : ""}
  `;
}

function heatmap(x, y, w, h) {
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.s1}" stroke="${C.grid}"/>`;
  const rows = 8, cols = 10, gx = x + 72, gy = y + 64, cw = 55, ch = 47;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = (r + c) / (rows + cols - 2);
      const color = v < 0.33 ? C.cyan : v < 0.66 ? C.green : C.amber;
      svg += `<rect x="${gx + c * cw}" y="${gy + r * ch}" width="${cw - 5}" height="${ch - 5}" fill="${color}" opacity="${0.18 + v * 0.65}"/>`;
    }
  }
  svg += `<text x="${x + 72}" y="${y + 40}" font-family="Arial" font-size="24" fill="${C.muted}">Optimal portfolio by time and wealth state</text>`;
  return svg;
}

function barChart(x, y, w, h, data, opts = {}) {
  const max = Math.max(...data.flatMap(d => [d.v, d.v2 || 0]));
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.s1}" stroke="${C.grid}"/>`;
  svg += `<line x1="${x + 70}" y1="${y + h - 70}" x2="${x + w - 42}" y2="${y + h - 70}" stroke="${C.muted}" opacity="0.45"/>`;
  const bw = (w - 150) / data.length;
  data.forEach((d, i) => {
    const bh = (d.v / max) * (h - 150);
    const x0 = x + 88 + i * bw;
    svg += `<rect x="${x0}" y="${y + h - 70 - bh}" width="${bw * 0.34}" height="${bh}" fill="${opts.c1 || C.green}"/>`;
    if (d.v2 != null) {
      const bh2 = (d.v2 / max) * (h - 150);
      svg += `<rect x="${x0 + bw * 0.38}" y="${y + h - 70 - bh2}" width="${bw * 0.34}" height="${bh2}" fill="${opts.c2 || C.amber}"/>`;
    }
    svg += `<text x="${x0}" y="${y + h - 32}" font-family="Arial" font-size="20" fill="${C.muted}">${esc(d.label)}</text>`;
  });
  return svg;
}

function lineChart(x, y, w, h, series, opts = {}) {
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.s1}" stroke="${C.grid}"/>`;
  const px = x + 70, py = y + 45, cw = w - 120, ch = h - 115;
  svg += `<line x1="${px}" y1="${py + ch}" x2="${px + cw}" y2="${py + ch}" stroke="${C.muted}" opacity="0.45"/>`;
  svg += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + ch}" stroke="${C.muted}" opacity="0.45"/>`;
  series.forEach((s, si) => {
    const maxY = opts.maxY || 100;
    const d = s.points.map((p, i) => {
      const xx = px + (i / (s.points.length - 1)) * cw;
      const yy = py + ch - (p / maxY) * ch;
      return `${i ? "L" : "M"} ${xx} ${yy}`;
    }).join(" ");
    svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="4"/>`;
    s.points.forEach((p, i) => {
      const xx = px + (i / (s.points.length - 1)) * cw;
      const yy = py + ch - (p / maxY) * ch;
      svg += `<circle cx="${xx}" cy="${yy}" r="5" fill="${s.color}"/>`;
    });
    svg += `<text x="${px + 20 + si * 250}" y="${y + h - 26}" font-family="Arial" font-size="23" fill="${s.color}">${esc(s.name)}</text>`;
  });
  return svg;
}

const slides = [
  { k: "Lesson Deck", t: "Dynamic Portfolio Allocation", s: "in Goals-Based Wealth Management", type: "cover" },
  { k: "Why This Matters", t: "The objective changes the portfolio", s: "Goals-based wealth management optimizes the chance of funding a real goal, not a one-period risk-return score.", bullets: ["Classical allocation asks: What is the best risk-return tradeoff today?", "GBWM asks: What strategy maximizes the probability of reaching a goal by horizon T?", "The decision depends on current wealth, time remaining, cash flows, and the goal."], visual: "goal" },
  { k: "Paper Map", t: "From static allocation to dynamic policy", s: "Das, Ostrov, Radhakrishnan, and Srivastav propose a discrete-time dynamic programming engine for GBWM.", bullets: ["Input: a menu of model portfolios, often on the efficient frontier.", "Engine: backward recursion over a wealth grid.", "Output: an optimal allocation rule for every time and wealth state.", "Result: a policy that can outperform target date funds for stated goals."], visual: "flow" },
  { k: "Core Idea", t: "Optimize a success probability", s: "The goal is expressed as terminal wealth G at horizon T.", custom: "objective" },
  { k: "Contrast", t: "Utility is not the only language", s: "The paper avoids asking an investor to specify a hard-to-calibrate utility function.", bullets: ["Utility approach: maximize expected utility of final wealth and consumption.", "GBWM approach: maximize the probability of meeting a stated target.", "This makes the objective easier to explain to clients and advisors."], visual: "compare" },
  { k: "Mental Accounting", t: "Different goals can deserve different risks", s: "Behavioral portfolio theory supports treating goals as separate mental accounts.", bullets: ["Safety goals may require lower downside risk.", "Aspirational goals may tolerate higher upside-seeking risk.", "GBWM turns those goal definitions into portfolio policies."], visual: "accounts" },
  { k: "Portfolio Menu", t: "Start with feasible model portfolios", s: "The optimizer can use efficient or even inefficient portfolios supplied externally.", custom: "frontier" },
  { k: "State Variable", t: "Wealth and time define the decision state", s: "At each step, the investor has current wealth W(t), a remaining horizon, and a goal G.", custom: "state" },
  { k: "Wealth Grid", t: "Discretize possible wealth levels", s: "The algorithm creates wealth nodes from plausible low to high values, then solves on that grid.", bullets: ["Each node represents a possible portfolio value at time t.", "Grid density controls accuracy and runtime.", "The paper’s base case uses at least three wealth nodes per yearly standard deviation."], visual: "grid" },
  { k: "Transition Model", t: "Estimate movement between wealth nodes", s: "For each candidate portfolio, transition probabilities connect today’s wealth to next period’s wealth.", custom: "transition" },
  { k: "Bellman Recursion", t: "Solve backward from the goal", s: "At maturity, success is 1 if wealth reaches G and 0 otherwise. Earlier decisions maximize expected future success.", custom: "bellman" },
  { k: "Policy Map", t: "The output is a dynamic allocation rule", s: "The strategy chooses the best portfolio for each combination of time and wealth.", custom: "heatmap" },
  { k: "Risk Behavior", t: "Risk rises when the goal is slipping", s: "The optimal policy is intuitive but state-dependent.", bullets: ["If wealth falls behind target, the algorithm may take more risk to restore success probability.", "If wealth is comfortably ahead, it can dial risk down.", "This is different from a glide path that only depends on age or time."], visual: "risk" },
  { k: "Efficient Frontier Controls", t: "Restricting choices shapes terminal wealth", s: "The available segment of the frontier changes left-tail and right-tail outcomes.", bullets: ["Raising minimum available risk can increase the right tail more than the left tail.", "Raising maximum available risk can increase the left tail more than the right tail.", "Controls become a practical advisor tool for goal-specific risk design."], custom: "frontierControl" },
  { k: "Runtime", t: "The algorithm is fast enough for advice workflows", s: "The paper reports polynomial-time performance and base-case runtimes under five seconds.", custom: "runtime" },
  { k: "Cash Flows", t: "Infusions can materially lift success odds", s: "The framework handles scheduled contributions without runtime degradation.", custom: "infusions" },
  { k: "Withdrawals", t: "Retirement goals introduce bankruptcy risk", s: "With withdrawals, the algorithm can estimate and minimize the chance of running out of money.", bullets: ["Negative cash flows can push wealth to zero before the horizon.", "The dynamic policy can account for solvency as the goal.", "This is directly relevant to retirement income planning."], visual: "withdrawal" },
  { k: "Target Date Fund Baseline", t: "A glide path is time-dependent, not wealth-dependent", s: "TDFs adjust allocation by age, but generally do not react to current wealth or individual goals.", custom: "tdf" },
  { k: "Retirement Case", t: "Goal: remain solvent through age 80", s: "Example from the paper: age 50, $100k retirement wealth, withdrawals after age 65, and pre-retirement infusions.", custom: "retirement" },
  { k: "Key Result", t: "GBWM outperforms the TDF baseline", s: "With $15k annual inflation-adjusted pre-retirement infusions, the GBWM policy reaches 58.6% solvency versus 26.6% for the target date fund.", custom: "result" },
  { k: "Why It Wins", t: "Customization creates the edge", s: "The outperformance comes from three mechanisms working together.", bullets: ["It can stay on an efficient frontier built from the same underlying funds.", "It reacts to both time and current wealth.", "It optimizes directly for the investor’s specified goal and cash-flow path."], visual: "edge" },
  { k: "Extensions", t: "The framework is modular", s: "The paper notes that the same engine can support several practical variants.", bullets: ["Non-annual updates such as quarterly rebalancing.", "Multiple terminal wealth goals with investor-specified weights.", "Portfolio sets that are supplied externally, whether efficient or not.", "Alternative Markovian return models beyond normal assumptions."], visual: "modules" },
  { k: "Implementation Recipe", t: "Build the engine in seven steps", s: "A practical workflow for a wealth platform or advisory team.", custom: "recipe" },
  { k: "Teaching Takeaways", t: "Dynamic allocation is a policy, not a portfolio", s: "The lesson is to map each future state to an action that best protects the goal.", bullets: ["Define the investor’s goal in wealth and time.", "Provide a controlled menu of portfolio choices.", "Use backward induction to compute success probabilities.", "Rebalance based on state: time, wealth, goal, and cash flows."], visual: "takeaways" },
  { k: "Discussion", t: "Questions for applying GBWM", s: "Use these prompts to turn the model into an advisory conversation.", bullets: ["Which goals should be separated into their own mental accounts?", "What minimum success probability is acceptable?", "How should the portfolio menu be constrained for downside comfort?", "When does increasing risk help the goal, and when does it merely add tail risk?"], visual: "questions" },
];

function customVisual(slide) {
  switch (slide.custom) {
    case "objective":
      return formula(580, 360, "max  Pr[ W(T) >= G ]", "Choose A(0), A(1), ..., A(T-1) to maximize goal attainment") +
        panel(260, 570, 430, 210, "W(T)", "Terminal wealth at the goal horizon", C.cyan) +
        panel(745, 570, 430, 210, "G", "Investor-defined goal wealth", C.green) +
        panel(1230, 570, 430, 210, "A(t)", "Portfolio allocation chosen at each time", C.amber);
    case "frontier":
      return efficientFrontier(180, 330, 760, 500) + panel(1040, 355, 620, 165, "Separation of duties", "Asset team builds model portfolios; optimization team chooses the dynamic policy.", C.cyan) + panel(1040, 565, 620, 165, "Plug-and-play", "The algorithm can optimize over portfolios chosen outside the engine.", C.green);
    case "state":
      return panel(215, 350, 430, 270, "Time", "How many decision periods remain before the goal horizon?", C.cyan) + panel(745, 350, 430, 270, "Wealth", "Where is the investor relative to the path needed for success?", C.green) + panel(1275, 350, 430, 270, "Goal", "What terminal wealth or solvency condition must be achieved?", C.amber) + formula(580, 710, "Policy = f(time, wealth, goal)", "A dynamic rule replaces a static portfolio label");
    case "transition":
      return lineChart(215, 335, 650, 420, [{ name: "Next-period wealth density", color: C.green, points: [5, 14, 35, 72, 92, 70, 42, 20, 8] }], { maxY: 100 }) + panel(960, 350, 650, 165, "Transition probability", "p(Wj(t+1) | Wi(t), portfolio choice) connects nodes across time.", C.cyan) + panel(960, 565, 650, 165, "Markov requirement", "The evolution model only needs next-period dynamics to depend on the current state.", C.green);
    case "bellman":
      return formula(210, 340, "V(Wi,T) = 1 if Wi >= G, else 0", "Terminal success condition") + formula(950, 340, "V(Wi,t) = max E[V(Wj,t+1)]", "Backward induction over portfolio choices") + panel(470, 610, 980, 165, "Interpretation", "V is the optimal probability of reaching the goal from a given wealth node and time.", C.green);
    case "heatmap":
      return heatmap(300, 315, 820, 510) + panel(1210, 360, 430, 135, "Rows", "Current wealth nodes", C.cyan) + panel(1210, 535, 430, 135, "Columns", "Time steps to horizon", C.green) + panel(1210, 710, 430, 135, "Color", "Selected portfolio on the menu", C.amber);
    case "frontierControl":
      return efficientFrontier(180, 320, 650, 480) + panel(930, 330, 650, 150, "Raise minimum risk", "Can increase upside exposure, but may lower goal-attainment probability.", C.amber) + panel(930, 525, 650, 150, "Raise maximum risk", "Can improve the chance of reaching G, while adding more left-tail exposure.", C.red) + panel(930, 720, 650, 120, "Lesson", "Risk controls are part of the goal design.", C.green);
    case "runtime":
      return barChart(210, 330, 700, 470, [{ label: "5", v: 1.8 }, { label: "10", v: 2.4 }, { label: "15", v: 2.9 }, { label: "20", v: 3.4 }, { label: "40", v: 8.5 }, { label: "60", v: 12 }, { label: "80", v: 15 }, { label: "100", v: 18 }], { c1: C.cyan }) + panel(1010, 340, 520, 140, "m = 15", "Base case portfolio choices were sufficient for accuracy.", C.green) + panel(1010, 535, 520, 140, "Under 5 sec", "Base case: ten years, annual rebalance, 15 choices.", C.cyan) + panel(1010, 730, 520, 120, "Scaling", "Runtime grows roughly linearly with portfolio choices.", C.amber);
    case "infusions":
      return lineChart(210, 330, 780, 470, [{ name: "Pr W(T) >= 200", color: C.green, points: [66.9, 73, 78.9, 84.8, 90.1, 94.4, 97.6, 99.2, 99.8, 99.9] }, { name: "Pr W(T) >= 150", color: C.cyan, points: [77.7, 83.2, 88.1, 92.6, 96.1, 98.4, 99.6, 99.9, 99.9, 99.9] }], { maxY: 100 }) + panel(1080, 355, 520, 165, "Small contributions matter", "In the paper’s 10-year case, annual infusions materially lift success probabilities.", C.green) + panel(1080, 575, 520, 150, "No runtime penalty", "Cash flows enter the state transition without degrading runtime.", C.cyan);
    case "tdf":
      return barChart(210, 330, 760, 470, [{ label: "50-54", v: 44, v2: 27 }, { label: "55-59", v: 40, v2: 34 }, { label: "60-64", v: 35, v2: 42 }, { label: "65-69", v: 28, v2: 53 }, { label: "70-74", v: 20, v2: 67 }, { label: "75-80", v: 18, v2: 70 }], { c1: C.green, c2: C.cyan }) + panel(1060, 360, 510, 150, "Glide path", "Allocation shifts with age.", C.cyan) + panel(1060, 565, 510, 170, "Missing state", "It does not adapt to current wealth versus the investor’s goal.", C.red);
    case "retirement":
      return panel(220, 330, 410, 220, "Start", "Age 50 with $100k retirement wealth.", C.cyan) + panel(755, 330, 410, 220, "Contribute", "Annual inflation-adjusted infusions until age 65.", C.green) + panel(1290, 330, 410, 220, "Withdraw", "Take $50k present-day dollars after age 65 through age 80.", C.amber) + formula(580, 670, "Goal: stay solvent at age 80", "The success event is not running out of money");
    case "result":
      return barChart(380, 315, 760, 500, [{ label: "GBWM", v: 58.6 }, { label: "TDF", v: 26.6 }], { c1: C.green }) + `<text x="510" y="405" font-family="Arial Narrow, Arial" font-size="92" font-weight="800" fill="${C.green}">58.6%</text><text x="820" y="655" font-family="Arial Narrow, Arial" font-size="92" font-weight="800" fill="${C.amber}">26.6%</text>` + panel(1220, 385, 430, 220, "Same fund universe", "The comparison uses the same three broad index-fund building blocks.", C.cyan) + panel(1220, 650, 430, 150, "Difference", "Dynamic state-dependent policy.", C.green);
    case "recipe":
      return bullets(["Define goal wealth G and horizon T.", "Select model portfolios and risk bounds.", "Build wealth grid and cash-flow schedule.", "Estimate transition probabilities.", "Set terminal success values.", "Run Bellman recursion backward.", "Use the policy map to rebalance forward."], 270, 335, 68, { size: 31, lh: 42, dot: C.green });
    default:
      return "";
  }
}

function genericVisual(name) {
  if (name === "goal") return formula(1040, 395, "Goal > Generic Risk Score", "Objective: make the stated outcome more likely");
  if (name === "flow") return panel(220, 350, 360, 190, "Inputs", "Goal, horizon, wealth, cash flows, portfolio menu", C.cyan) + panel(770, 350, 360, 190, "Dynamic Program", "Backward recursion over time and wealth states", C.green) + panel(1320, 350, 360, 190, "Policy", "Allocation rule and success probability", C.amber) + `<path d="M600 445 L740 445" stroke="${C.green}" stroke-width="5"/><path d="M1150 445 L1290 445" stroke="${C.green}" stroke-width="5"/>`;
  if (name === "compare") return panel(250, 355, 590, 260, "Utility-Based", "Choose a utility function, then maximize expected utility.", C.cyan) + panel(1080, 355, 590, 260, "Goals-Based", "Specify a target, then maximize probability of reaching it.", C.green);
  if (name === "accounts") return panel(235, 350, 390, 245, "Safety", "Protect minimum lifestyle funding.", C.cyan) + panel(765, 350, 390, 245, "Retirement", "Sustain planned withdrawals.", C.green) + panel(1295, 350, 390, 245, "Aspirational", "Seek upside for legacy or large purchases.", C.amber);
  if (name === "grid") return heatmap(520, 330, 820, 470);
  if (name === "risk") return lineChart(960, 335, 650, 420, [{ name: "Risk when behind", color: C.amber, points: [30, 42, 58, 68, 74, 70] }, { name: "Risk when ahead", color: C.green, points: [62, 55, 45, 34, 28, 24] }], { maxY: 100 });
  if (name === "withdrawal") return lineChart(980, 335, 620, 420, [{ name: "Wealth path under withdrawals", color: C.red, points: [90, 84, 71, 55, 37, 18, 4] }], { maxY: 100 });
  if (name === "edge") return panel(245, 365, 390, 250, "Efficient", "Avoid uncompensated volatility.", C.cyan) + panel(765, 365, 390, 250, "Adaptive", "React to wealth state.", C.green) + panel(1285, 365, 390, 250, "Goal-Aware", "Optimize the stated outcome.", C.amber);
  if (name === "modules") return panel(220, 330, 360, 205, "Update Frequency", "Annual, quarterly, or custom periods.", C.cyan) + panel(610, 570, 360, 205, "Multi-Goal", "Weighted terminal goals.", C.green) + panel(1000, 330, 360, 205, "Portfolio Set", "Efficient or externally supplied choices.", C.amber) + panel(1390, 570, 360, 205, "Return Model", "Any Markovian evolution model.", C.red);
  if (name === "takeaways") return heatmap(980, 330, 620, 430);
  if (name === "questions") return formula(1020, 395, "Advisor Conversation", "Translate model settings into investor choices");
  return "";
}

function slideSvg(slide, n) {
  let body = "";
  const panelVisuals = new Set(["compare", "accounts", "edge", "modules"]);
  if (slide.type === "cover") {
    body = `
      <text x="120" y="170" font-family="Arial" font-size="24" letter-spacing="4" fill="${C.green}">GOALS-BASED WEALTH MANAGEMENT</text>
      <text x="120" y="310" font-family="Arial Narrow, Arial" font-size="96" font-weight="800" fill="${C.text}">Dynamic Portfolio</text>
      <text x="120" y="415" font-family="Arial Narrow, Arial" font-size="96" font-weight="800" fill="${C.text}">Allocation</text>
      <text x="124" y="492" font-family="Arial" font-size="34" fill="${C.muted}">A 25-slide lesson deck based on Das et al. (2019)</text>
      ${efficientFrontier(1040, 185, 650, 480, false)}
      ${formula(120, 705, "max Pr[ W(T) >= G ]", "Dynamic programming for investor-specific goals")}
      <text x="120" y="980" font-family="Arial" font-size="24" fill="${C.muted}">Source: Dynamic Portfolio Allocation in Goals-Based Wealth Management</text>`;
  } else {
    body = header(n, slide.k, slide.t, slide.s);
    if (slide.bullets && !panelVisuals.has(slide.visual)) body += bullets(slide.bullets, 170, 335, 58, { size: 31, lh: 41 });
    if (slide.custom) body += customVisual(slide);
    if (slide.visual) body += genericVisual(slide.visual);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><filter id="soft"><feGaussianBlur stdDeviation="18"/></filter></defs>
    ${gridBg()}
    <circle cx="1650" cy="150" r="320" fill="${C.green}" opacity="0.06" filter="url(#soft)"/>
    ${body}
    <text x="92" y="1020" font-family="Arial" font-size="18" fill="${C.muted}" opacity="0.75">Das, Ostrov, Radhakrishnan &amp; Srivastav - Dynamic Portfolio Allocation in Goals-Based Wealth Management</text>
  </svg>`;
}

async function render() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Codex";
  pptx.subject = "Dynamic Portfolio Allocation in Goals-Based Wealth Management";
  pptx.title = "Dynamic Portfolio Allocation in Goals-Based Wealth Management";
  pptx.company = "Slide_Generator";
  pptx.lang = "en-US";

  const outline = [
    "# Dynamic Portfolio Allocation in Goals-Based Wealth Management",
    "",
    "25-slide English lesson deck based on Das, Ostrov, Radhakrishnan, and Srivastav.",
    "",
    "Design system: 01 - QuantSeras Design System.",
    "",
    "## Slide Outline",
    "",
  ];

  for (let i = 0; i < slides.length; i++) {
    const n = i + 1;
    const svg = slideSvg(slides[i], n);
    const img = path.join(imageDir, `slide-${String(n).padStart(2, "0")}.png`);
    await sharp(Buffer.from(svg)).png().toFile(img);
    const slide = pptx.addSlide();
    slide.background = { color: "121212" };
    slide.addImage({ path: img, x: 0, y: 0, w: 13.333333, h: 7.5 });
    outline.push(`${n}. ${slides[i].t} - ${slides[i].s || slides[i].k}`);
  }

  outline.push("", "## Sources", "", "- Das, S. R., Ostrov, D., Radhakrishnan, A., & Srivastav, D. Dynamic Portfolio Allocation in Goals-Based Wealth Management.", "- SSRN abstract ID 3211951 and author PDF mirror used for content extraction.");
  fs.writeFileSync(path.join(notesDir, "dynamic-portfolio-allocation-gbwm-outline.md"), outline.join("\n"));

  const pptPath = path.join(outDir, "dynamic-portfolio-allocation-gbwm-lesson.pptx");
  await pptx.writeFile({ fileName: pptPath });
  console.log(JSON.stringify({ pptPath, imageDir, slides: slides.length }, null, 2));
}

render().catch(err => {
  console.error(err);
  process.exit(1);
});
