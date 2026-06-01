#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const https = require("https");

const W = 1920;
const H = 1080;
const PPT_W = 13.333;
const PPT_H = 7.5;
const FONT = "Arial, Helvetica, sans-serif";
const DISPLAY_FONT = "Georgia, 'Times New Roman', serif";

const C = {
  bg: "#FFFFFF",
  text: "#172033",
  muted: "#657184",
  line: "#D5DCE6",
  panel: "#F3F6FA",
  navy: "#13294B",
  blue: "#2563EB",
  green: "#058A5B",
  red: "#C2413B",
  amber: "#B7791F",
  paleBlue: "#EAF1FF",
  paleGreen: "#EAF8F1",
  paleRed: "#FCEEEE",
};

const CHART_COLORS = ["#2563EB", "#058A5B", "#B7791F", "#7C3AED", "#DC2626", "#0891B2", "#4B5563", "#EA580C"];

function usage() {
  console.error(
    "Usage: node build_daily_market_deck.js --symbols SPY,QQQ,TLT,GLD [--api-key <key>] [--project-name <name>] [--output <pptx>] [--language en|th] [--deck-mode brief|four-hour] [--visual-style standard|premium-outlook] [--no-cache]"
  );
}

function parseArgs(argv) {
  const args = {
    apiKey: process.env.ALPHAVANTAGE_API_KEY || "",
    symbols: "SPY,QQQ,TLT,GLD",
    projectName: null,
    output: null,
    imagesDir: null,
    notesDir: path.resolve(process.cwd(), "notes"),
    cacheDir: path.resolve(process.cwd(), "notes", ".cache", "alphavantage"),
    title: "Daily Market Brief",
    language: "en",
    deckMode: "brief",
    durationMinutes: 30,
    visualStyle: "standard",
    noCache: false,
    throttleMs: 13000,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--api-key") args.apiKey = argv[++i] || "";
    else if (arg === "--symbols") args.symbols = argv[++i] || args.symbols;
    else if (arg === "--project-name") args.projectName = argv[++i] || "";
    else if (arg === "--output") args.output = path.resolve(argv[++i] || "");
    else if (arg === "--images-dir") args.imagesDir = path.resolve(argv[++i] || "");
    else if (arg === "--notes-dir") args.notesDir = path.resolve(argv[++i] || "");
    else if (arg === "--cache-dir") args.cacheDir = path.resolve(argv[++i] || "");
    else if (arg === "--title") args.title = argv[++i] || args.title;
    else if (arg === "--language") args.language = argv[++i] || args.language;
    else if (arg === "--deck-mode") args.deckMode = argv[++i] || args.deckMode;
    else if (arg === "--visual-style" || arg === "--style") args.visualStyle = argv[++i] || args.visualStyle;
    else if (arg === "--duration-minutes") args.durationMinutes = Number(argv[++i] || args.durationMinutes);
    else if (arg === "--throttle-ms") args.throttleMs = Number(argv[++i] || args.throttleMs);
    else if (arg === "--no-cache") args.noCache = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  args.symbols = args.symbols.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!args.symbols.length) throw new Error("At least one symbol is required");
  if (!args.apiKey) throw new Error("Missing Alpha Vantage API key. Set ALPHAVANTAGE_API_KEY or pass --api-key.");
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms || 0)));
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
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const out = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) out.push(line);
  return out;
}

function textBlock(text, x, y, opts = {}) {
  const size = opts.size || 32;
  const fill = opts.fill || C.text;
  const weight = opts.weight || 400;
  const max = opts.max || 46;
  const lh = opts.lh || 1.18;
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
  const lines = wrap(text, max);
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}>${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function fmtPct(value, digits = 1) {
  if (!Number.isFinite(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

function fmtNum(value, digits = 2) {
  if (!Number.isFinite(value)) return "n/a";
  return value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function colorForReturn(value) {
  if (!Number.isFinite(value)) return C.muted;
  if (value > 0.0001) return C.green;
  if (value < -0.0001) return C.red;
  return C.muted;
}

function fillForReturn(value) {
  if (!Number.isFinite(value)) return C.panel;
  if (value > 0.0001) return C.paleGreen;
  if (value < -0.0001) return C.paleRed;
  return C.panel;
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Slide_Generator/1.0" } }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(new Error(`Invalid JSON response: ${err.message}`));
        }
      });
    }).on("error", reject);
  });
}

function cachePath(cacheDir, symbol) {
  return path.join(cacheDir, "TIME_SERIES_DAILY", `${symbol.replace(/[^A-Z0-9_.-]/gi, "_")}.json`);
}

function isCacheFresh(file) {
  if (!fs.existsSync(file)) return false;
  const ageMs = Date.now() - fs.statSync(file).mtimeMs;
  return ageMs < 6 * 60 * 60 * 1000;
}

function validateAlphaResponse(data, symbol) {
  if (data["Time Series (Daily)"]) return null;
  return data.Note || data.Information || data["Error Message"] || `Missing daily time series for ${symbol}`;
}

async function fetchDaily(symbol, args) {
  const file = cachePath(args.cacheDir, symbol);
  if (!args.noCache && isCacheFresh(file)) {
    return { symbol, data: JSON.parse(fs.readFileSync(file, "utf8")), fromCache: true, warning: null, networkUsed: false };
  }

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "TIME_SERIES_DAILY");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("outputsize", "compact");
  url.searchParams.set("apikey", args.apiKey);

  try {
    const data = await httpGetJson(url);
    const problem = validateAlphaResponse(data, symbol);
    if (problem) throw new Error(problem);
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    return { symbol, data, fromCache: false, warning: null, networkUsed: true };
  } catch (err) {
    if (fs.existsSync(file)) {
      return {
        symbol,
        data: JSON.parse(fs.readFileSync(file, "utf8")),
        fromCache: true,
        warning: `${symbol}: Alpha Vantage fetch failed, used cache. ${err.message}`,
        networkUsed: true,
      };
    }
    throw new Error(`${symbol}: ${err.message}`);
  }
}

function parseDailySeries(symbol, data) {
  const series = data["Time Series (Daily)"];
  if (!series) throw new Error(`${symbol}: missing Time Series (Daily)`);
  const rows = Object.entries(series).map(([date, raw]) => ({
    date,
    open: Number(raw["1. open"]),
    high: Number(raw["2. high"]),
    low: Number(raw["3. low"]),
    close: Number(raw["4. close"]),
    volume: Number(raw["5. volume"]),
  })).filter((r) => Number.isFinite(r.close)).sort((a, b) => a.date.localeCompare(b.date));
  if (rows.length < 25) throw new Error(`${symbol}: not enough daily observations (${rows.length})`);
  return rows;
}

function ret(rows, days) {
  const i = rows.length - 1;
  const j = i - days;
  if (j < 0) return NaN;
  return rows[i].close / rows[j].close - 1;
}

function stdev(values) {
  const clean = values.filter(Number.isFinite);
  if (clean.length < 2) return NaN;
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  const variance = clean.reduce((a, b) => a + (b - mean) ** 2, 0) / (clean.length - 1);
  return Math.sqrt(variance);
}

function maxDrawdown(rows, days = 60) {
  const window = rows.slice(-days);
  let peak = -Infinity;
  let worst = 0;
  window.forEach((row) => {
    peak = Math.max(peak, row.close);
    worst = Math.min(worst, row.close / peak - 1);
  });
  return worst;
}

function summarize(symbol, rows, fetchMeta) {
  const dailyReturns = rows.slice(1).map((row, i) => row.close / rows[i].close - 1);
  const vol20 = stdev(dailyReturns.slice(-20)) * Math.sqrt(252);
  const latest = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  return {
    symbol,
    latest,
    prevClose: prev.close,
    ret1d: ret(rows, 1),
    ret5d: ret(rows, 5),
    ret20d: ret(rows, 20),
    ret60d: ret(rows, 60),
    vol20,
    drawdown60: maxDrawdown(rows, 60),
    rows,
    fromCache: fetchMeta.fromCache,
    warning: fetchMeta.warning,
  };
}

function narrative(summaries) {
  const by1d = [...summaries].sort((a, b) => b.ret1d - a.ret1d);
  const by20 = [...summaries].sort((a, b) => b.ret20d - a.ret20d);
  const leader = by1d[0];
  const laggard = by1d[by1d.length - 1];
  const bestTrend = by20[0];
  const highestVol = [...summaries].sort((a, b) => b.vol20 - a.vol20)[0];
  const equitySymbols = new Set(["SPY", "QQQ", "DIA", "IWM", "VOO", "IVV"]);
  const equity = summaries.filter((s) => equitySymbols.has(s.symbol));
  const equityAvg = equity.length ? equity.reduce((a, s) => a + s.ret1d, 0) / equity.length : summaries.reduce((a, s) => a + s.ret1d, 0) / summaries.length;
  const tone = equityAvg > 0.003 ? "risk-on" : equityAvg < -0.003 ? "risk-off" : "mixed";
  return {
    tone,
    bullets: [
      `Market tone is ${tone}: average equity proxy move is ${fmtPct(equityAvg)} on the latest close.`,
      `${leader.symbol} led the daily move at ${fmtPct(leader.ret1d)}; ${laggard.symbol} lagged at ${fmtPct(laggard.ret1d)}.`,
      `${bestTrend.symbol} has the strongest 20D trend at ${fmtPct(bestTrend.ret20d)}, while ${highestVol.symbol} has the highest 20D annualized volatility at ${fmtPct(highestVol.vol20)}.`,
    ],
    watch: [
      "Confirm whether the move is broad or concentrated in a single proxy.",
      "Watch rates-sensitive assets versus equity leadership.",
      "Use the next close to confirm or fade the 20D trend signal.",
    ],
  };
}

function narrativeThai(summaries) {
  const by1d = [...summaries].sort((a, b) => b.ret1d - a.ret1d);
  const by20 = [...summaries].sort((a, b) => b.ret20d - a.ret20d);
  const leader = by1d[0];
  const laggard = by1d[by1d.length - 1];
  const bestTrend = by20[0];
  const highestVol = [...summaries].sort((a, b) => b.vol20 - a.vol20)[0];
  const equitySymbols = new Set(["SPY", "QQQ", "DIA", "IWM", "VOO", "IVV"]);
  const equity = summaries.filter((s) => equitySymbols.has(s.symbol));
  const equityAvg = equity.length ? equity.reduce((a, s) => a + s.ret1d, 0) / equity.length : summaries.reduce((a, s) => a + s.ret1d, 0) / summaries.length;
  const tone = equityAvg > 0.003 ? "risk-on" : equityAvg < -0.003 ? "risk-off" : "mixed";
  const toneThai = tone === "risk-on" ? "เปิดรับความเสี่ยง" : tone === "risk-off" ? "ลดความเสี่ยง" : "ผสม";
  return {
    tone,
    toneThai,
    bullets: [
      `โทนตลาดวันนี้เป็นแบบ ${toneThai}: กลุ่ม equity proxy เฉลี่ยเคลื่อนไหว ${fmtPct(equityAvg)} จากราคาปิดล่าสุด`,
      `${leader.symbol} นำตลาดรายวัน ที่ ${fmtPct(leader.ret1d)} ขณะที่ ${laggard.symbol} อ่อนตัวที่สุด ที่ ${fmtPct(laggard.ret1d)}`,
      `แนวโน้ม 20 วันแข็งสุดคือ ${bestTrend.symbol} ที่ ${fmtPct(bestTrend.ret20d)} ส่วน volatility สูงสุดคือ ${highestVol.symbol} ที่ ${fmtPct(highestVol.vol20)}`,
    ],
    watch: [
      "ตรวจว่าการเคลื่อนไหวเกิดกว้างทั้งตลาด หรือกระจุกอยู่ใน proxy เดียว",
      "จับตาสินทรัพย์อ่อนไหวต่อดอกเบี้ย เทียบกับ leadership ของหุ้น",
      "ใช้ราคาปิดวันถัดไปยืนยันว่า momentum 20 วัน ยังไปต่อหรือเริ่มอ่อนแรง",
    ],
  };
}

function narrativeFor(summaries, language) {
  return String(language || "en").toLowerCase().startsWith("th") ? narrativeThai(summaries) : narrative(summaries);
}

function slideFrame(title, subtitle, body, footer, opts = {}) {
  const dark = opts.dark || false;
  const bg = dark ? C.navy : C.bg;
  const titleFill = dark ? C.bg : C.text;
  const subtitleFill = dark ? "#9EC5FF" : C.blue;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <rect x="0" y="0" width="${W}" height="14" fill="${dark ? C.blue : C.navy}"/>
    <rect x="1510" y="0" width="120" height="112" fill="${dark ? "#244677" : C.paleBlue}" opacity="0.7"/>
    <rect x="1745" y="0" width="175" height="112" fill="${dark ? "#244677" : C.paleBlue}" opacity="0.55"/>
    ${textBlock(title, 72, 110, { size: title.length > 88 ? 48 : 58, weight: 800, fill: titleFill, max: 46 })}
    ${subtitle ? textBlock(subtitle, 72, 255, { size: 30, fill: subtitleFill, max: 88 }) : ""}
    ${body}
    <line x1="72" y1="992" x2="1680" y2="992" stroke="${dark ? "#6D7D95" : C.line}" stroke-width="1"/>
    <text x="72" y="1030" font-family="${FONT}" font-size="18" fill="${dark ? "#BAC7D9" : C.muted}">${esc(footer)}</text>
    <text x="1835" y="1045" font-family="${FONT}" font-size="30" font-weight="800" fill="${dark ? C.bg : C.navy}" text-anchor="end">Daily Market</text>
  </svg>`;
}

function coverSlide(ctx) {
  const symbols = ctx.summaries.map((s) => s.symbol).join("  |  ");
  const body = `<g opacity="0.25">
      <path d="M260 780C520 660 730 830 990 710S1320 690 1560 765" fill="none" stroke="${C.blue}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="520" cy="690" r="12" fill="${C.blue}"/>
      <circle cx="990" cy="710" r="12" fill="${C.blue}"/>
      <circle cx="1560" cy="765" r="12" fill="${C.blue}"/>
    </g>
    <text x="960" y="470" font-family="${FONT}" font-size="76" font-weight="800" fill="${C.bg}" text-anchor="middle">${esc(ctx.title)}</text>
    <text x="960" y="555" font-family="${FONT}" font-size="34" fill="#9EC5FF" text-anchor="middle">Latest data: ${esc(ctx.dataDate)} | ${esc(symbols)}</text>
    <text x="960" y="625" font-family="${FONT}" font-size="24" fill="#BAC7D9" text-anchor="middle">Generated ${esc(ctx.generatedAt)}</text>`;
  return slideFrame("", "", body, "Source: Alpha Vantage TIME_SERIES_DAILY", { dark: true });
}

function snapshotCards(summaries, x, y) {
  const cardW = 410;
  const cardH = 180;
  const gap = 28;
  return summaries.slice(0, 4).map((s, i) => {
    const cx = x + i * (cardW + gap);
    return `<rect x="${cx}" y="${y}" width="${cardW}" height="${cardH}" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
      <text x="${cx + 24}" y="${y + 48}" font-family="${FONT}" font-size="34" font-weight="800" fill="${C.text}">${esc(s.symbol)}</text>
      <text x="${cx + 24}" y="${y + 88}" font-family="${FONT}" font-size="21" fill="${C.muted}">Close ${fmtNum(s.latest.close)}</text>
      <rect x="${cx + 235}" y="${y + 24}" width="145" height="52" fill="${fillForReturn(s.ret1d)}" stroke="${colorForReturn(s.ret1d)}" stroke-width="1.2"/>
      <text x="${cx + 307}" y="${y + 58}" font-family="${FONT}" font-size="25" font-weight="800" fill="${colorForReturn(s.ret1d)}" text-anchor="middle">${fmtPct(s.ret1d)}</text>
      <text x="${cx + 24}" y="${y + 132}" font-family="${FONT}" font-size="19" fill="${C.text}">5D ${fmtPct(s.ret5d)}   20D ${fmtPct(s.ret20d)}</text>
      <text x="${cx + 24}" y="${y + 160}" font-family="${FONT}" font-size="17" fill="${C.muted}">20D vol ${fmtPct(s.vol20)}   DD60 ${fmtPct(s.drawdown60)}</text>`;
  }).join("");
}

function snapshotTable(summaries, x, y, w) {
  const headers = ["Symbol", "Close", "1D", "5D", "20D", "60D", "20D vol"];
  const col = [160, 220, 150, 150, 150, 150, 180];
  const rowH = 58;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${C.navy}"/>`;
  let cx = x;
  headers.forEach((h, i) => {
    out += `<text x="${cx + 16}" y="${y + 38}" font-family="${FONT}" font-size="20" font-weight="800" fill="${C.bg}">${esc(h)}</text>`;
    cx += col[i];
  });
  summaries.forEach((s, r) => {
    const yy = y + rowH * (r + 1);
    out += `<rect x="${x}" y="${yy}" width="${w}" height="${rowH}" fill="${r % 2 ? C.bg : C.panel}" stroke="${C.line}" stroke-width="1"/>`;
    cx = x;
    const vals = [s.symbol, fmtNum(s.latest.close), fmtPct(s.ret1d), fmtPct(s.ret5d), fmtPct(s.ret20d), fmtPct(s.ret60d), fmtPct(s.vol20)];
    vals.forEach((v, i) => {
      const fill = i >= 2 && i <= 5 ? colorForReturn([s.ret1d, s.ret5d, s.ret20d, s.ret60d][i - 2]) : C.text;
      out += `<text x="${cx + 16}" y="${yy + 37}" font-family="${FONT}" font-size="21" font-weight="${i === 0 ? 800 : 400}" fill="${fill}">${esc(v)}</text>`;
      cx += col[i];
    });
  });
  return out;
}

function lineChartNormalized(summaries, x, y, w, h, days = 60) {
  const series = summaries.map((s, idx) => {
    const rows = s.rows.slice(-days);
    const base = rows[0].close;
    return {
      symbol: s.symbol,
      color: CHART_COLORS[idx % CHART_COLORS.length],
      points: rows.map((r) => ({ date: r.date, value: (r.close / base) * 100 })),
    };
  });
  const values = series.flatMap((s) => s.points.map((p) => p.value));
  const min = Math.floor((Math.min(...values) - 1) / 2) * 2;
  const max = Math.ceil((Math.max(...values) + 1) / 2) * 2;
  const sx = (i, n) => x + (n === 1 ? 0 : (i / (n - 1)) * w);
  const sy = (v) => y + h - ((v - min) / (max - min || 1)) * h;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>`;
  for (let i = 0; i <= 4; i += 1) {
    const v = min + ((max - min) * i) / 4;
    const yy = sy(v);
    out += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${C.line}" stroke-width="1"/>
      <text x="${x - 12}" y="${yy + 6}" text-anchor="end" font-family="${FONT}" font-size="16" fill="${C.muted}">${v.toFixed(0)}</text>`;
  }
  series.forEach((s) => {
    const pathD = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i, s.points.length).toFixed(1)} ${sy(p.value).toFixed(1)}`).join(" ");
    const last = s.points[s.points.length - 1];
    out += `<path d="${pathD}" fill="none" stroke="${s.color}" stroke-width="4"/>
      <circle cx="${sx(s.points.length - 1, s.points.length)}" cy="${sy(last.value)}" r="6" fill="${s.color}"/>
      <text x="${x + w + 16}" y="${sy(last.value) + 6}" font-family="${FONT}" font-size="19" font-weight="800" fill="${s.color}">${esc(s.symbol)}</text>`;
  });
  const firstDate = series[0].points[0].date;
  const lastDate = series[0].points[series[0].points.length - 1].date;
  out += `<text x="${x}" y="${y + h + 34}" font-family="${FONT}" font-size="18" fill="${C.muted}">${esc(firstDate)}</text>
    <text x="${x + w}" y="${y + h + 34}" font-family="${FONT}" font-size="18" fill="${C.muted}" text-anchor="end">${esc(lastDate)}</text>
    <text x="${x + w / 2}" y="${y + h + 55}" font-family="${FONT}" font-size="18" fill="${C.muted}" text-anchor="middle">Normalized close, first visible day = 100</text>`;
  return out;
}

function returnBars(summaries, x, y, w, h) {
  const periods = [
    ["1D", "ret1d", "#2563EB"],
    ["5D", "ret5d", "#058A5B"],
    ["20D", "ret20d", "#B7791F"],
  ];
  const maxAbs = Math.max(0.01, ...summaries.flatMap((s) => periods.map((p) => Math.abs(s[p[1]] || 0))));
  const rowH = h / summaries.length;
  const zeroX = x + 150 + (w - 220) / 2;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>
    <line x1="${zeroX}" y1="${y + 24}" x2="${zeroX}" y2="${y + h - 24}" stroke="${C.line}" stroke-width="2"/>`;
  summaries.forEach((s, i) => {
    const yy = y + i * rowH + 32;
    out += `<text x="${x + 24}" y="${yy + 34}" font-family="${FONT}" font-size="25" font-weight="800" fill="${C.text}">${esc(s.symbol)}</text>`;
    periods.forEach((p, j) => {
      const v = s[p[1]];
      const bw = (Math.abs(v) / maxAbs) * ((w - 240) / 2);
      const bx = v >= 0 ? zeroX : zeroX - bw;
      const by = yy + j * 26;
      out += `<rect x="${bx}" y="${by}" width="${Math.max(2, bw)}" height="18" fill="${v >= 0 ? p[2] : C.red}" opacity="${j === 0 ? 1 : 0.72}"/>
        <text x="${v >= 0 ? bx + bw + 8 : bx - 8}" y="${by + 15}" font-family="${FONT}" font-size="16" fill="${C.text}" text-anchor="${v >= 0 ? "start" : "end"}">${p[0]} ${fmtPct(v)}</text>`;
    });
  });
  return out;
}

function riskScatter(summaries, x, y, w, h) {
  const xs = summaries.map((s) => s.ret20d).filter(Number.isFinite);
  const ys = summaries.map((s) => s.vol20).filter(Number.isFinite);
  const minX = Math.min(-0.02, Math.min(...xs) - 0.015);
  const maxX = Math.max(0.02, Math.max(...xs) + 0.015);
  const minY = 0;
  const maxY = Math.max(0.15, Math.max(...ys) * 1.15);
  const sx = (v) => x + ((v - minX) / (maxX - minX || 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>`;
  for (let i = 0; i <= 4; i += 1) {
    const xx = x + (i / 4) * w;
    const yy = y + (i / 4) * h;
    out += `<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y + h}" stroke="${C.line}" stroke-width="1"/>
      <line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${C.line}" stroke-width="1"/>`;
  }
  out += `<line x1="${sx(0)}" y1="${y}" x2="${sx(0)}" y2="${y + h}" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="6 6"/>`;
  summaries.forEach((s, i) => {
    const color = CHART_COLORS[i % CHART_COLORS.length];
    out += `<circle cx="${sx(s.ret20d)}" cy="${sy(s.vol20)}" r="14" fill="${color}" opacity="0.88"/>
      <text x="${sx(s.ret20d) + 20}" y="${sy(s.vol20) + 7}" font-family="${FONT}" font-size="22" font-weight="800" fill="${color}">${esc(s.symbol)}</text>`;
  });
  out += `<text x="${x + w / 2}" y="${y + h + 46}" font-family="${FONT}" font-size="21" fill="${C.muted}" text-anchor="middle">20D return</text>
    <text x="${x - 50}" y="${y + h / 2}" transform="rotate(-90 ${x - 50} ${y + h / 2})" font-family="${FONT}" font-size="21" fill="${C.muted}" text-anchor="middle">20D annualized volatility</text>
    <text x="${x}" y="${y + h + 28}" font-family="${FONT}" font-size="17" fill="${C.muted}">${fmtPct(minX)}</text>
    <text x="${x + w}" y="${y + h + 28}" font-family="${FONT}" font-size="17" fill="${C.muted}" text-anchor="end">${fmtPct(maxX)}</text>
    <text x="${x - 12}" y="${sy(maxY) + 7}" font-family="${FONT}" font-size="17" fill="${C.muted}" text-anchor="end">${fmtPct(maxY)}</text>`;
  return out;
}

function bulletList(items, x, y, opts = {}) {
  const size = opts.size || 31;
  const max = opts.max || 62;
  const gap = opts.gap || 84;
  return items.map((item, i) => {
    const yy = y + i * gap;
    return `<circle cx="${x}" cy="${yy - 8}" r="7" fill="${C.blue}"/>
      ${textBlock(item, x + 28, yy, { size, max, fill: C.text, lh: 1.12 })}`;
  }).join("");
}

function buildSlides(ctx) {
  const s = ctx.summaries;
  const n = ctx.narrative;
  const footer = `Source: Alpha Vantage TIME_SERIES_DAILY | Data date: ${ctx.dataDate}${ctx.cacheNote ? " | Cache used" : ""}`;
  const slides = [];

  slides.push({
    title: "Cover",
    note: `Open with the market universe and data date. Symbols: ${s.map((x) => x.symbol).join(", ")}.`,
    svg: coverSlide(ctx),
  });

  slides.push({
    title: "Market snapshot",
    note: n.bullets.join(" "),
    svg: slideFrame(
      "Market snapshot shows the latest cross-asset tone",
      `${n.tone.toUpperCase()} | Leader: ${s.slice().sort((a, b) => b.ret1d - a.ret1d)[0].symbol} | Data date ${ctx.dataDate}`,
      `${snapshotCards(s, 72, 330)}${snapshotTable(s, 170, 570, 1160)}
       <rect x="1390" y="570" width="370" height="260" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
       ${textBlock("Presenter takeaway", 1420, 620, { size: 25, weight: 800, fill: C.blue, max: 24 })}
       ${textBlock(n.bullets[0], 1420, 674, { size: 24, fill: C.text, max: 28, lh: 1.1 })}`,
      footer
    ),
  });

  slides.push({
    title: "60-session normalized trend",
    note: "Use this slide to compare trend persistence across symbols on a normalized basis.",
    svg: slideFrame(
      "The 60-session trend shows relative market leadership",
      "Normalized close levels make cross-asset comparison readable",
      `${lineChartNormalized(s, 150, 345, 1420, 520, 60)}`,
      footer
    ),
  });

  slides.push({
    title: "Returns by horizon",
    note: "Use the grouped bars to separate daily noise from weekly and monthly trend.",
    svg: slideFrame(
      "Returns split by horizon distinguish daily noise from trend",
      "1D, 5D, and 20D returns for each selected market proxy",
      `${returnBars(s, 210, 330, 1380, 540)}`,
      footer
    ),
  });

  slides.push({
    title: "Return versus volatility",
    note: "Use the scatter to separate trend from risk. Assets farther right have stronger 20D returns; assets higher on the chart carry higher realized volatility.",
    svg: slideFrame(
      "Return versus volatility highlights where trend is carrying risk",
      "20D return plotted against annualized 20D volatility",
      `${riskScatter(s, 300, 330, 1200, 520)}
       ${textBlock("Readout", 1540, 395, { size: 25, weight: 800, fill: C.blue, max: 18 })}
       ${textBlock(n.bullets[2], 1540, 455, { size: 24, max: 23, fill: C.text, lh: 1.1 })}`,
      footer
    ),
  });

  slides.push({
    title: "Talk track and watchlist",
    note: `${n.bullets.join(" ")} ${n.watch.join(" ")}`,
    svg: slideFrame(
      "Talk track: keep the discussion focused on confirmation signals",
      "Use this as the presenter close and watchlist for the next session",
      `${textBlock("Today", 120, 360, { size: 30, weight: 800, fill: C.blue, max: 16 })}
       ${bulletList(n.bullets, 132, 425, { size: 31, max: 58, gap: 105 })}
       <rect x="1080" y="350" width="650" height="390" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
       ${textBlock("Watch next", 1120, 410, { size: 30, weight: 800, fill: C.blue, max: 24 })}
       ${bulletList(n.watch, 1132, 485, { size: 28, max: 34, gap: 88 })}
       <rect x="1080" y="785" width="650" height="86" fill="${ctx.cacheNote ? C.paleRed : C.paleGreen}" stroke="${ctx.cacheNote ? C.red : C.green}" stroke-width="2"/>
       ${textBlock(ctx.cacheNote ? "Data note: cache used for at least one symbol." : "Data note: fresh API pull completed.", 1120, 840, { size: 25, fill: ctx.cacheNote ? C.red : C.green, weight: 800, max: 42 })}`,
      footer
    ),
  });

  return slides;
}

function sectionSlide(title, subtitle, footer, note) {
  const body = `<text x="960" y="465" font-family="${FONT}" font-size="68" font-weight="800" fill="${C.bg}" text-anchor="middle">${esc(title)}</text>
    <text x="960" y="540" font-family="${FONT}" font-size="30" fill="#9EC5FF" text-anchor="middle">${esc(subtitle || "")}</text>
    <path d="M535 715H1385" stroke="${C.blue}" stroke-width="8" stroke-linecap="round" opacity="0.55"/>`;
  return { title, note: note || title, svg: slideFrame("", "", body, footer, { dark: true }) };
}

function agendaSlide(ctx, footer) {
  const items = [
    ["00:00-00:20", "เปิดภาพรวมและกติกาการอ่านข้อมูล"],
    ["00:20-01:05", "Market snapshot และ cross-asset readout"],
    ["01:05-01:55", "Trend, return horizon, volatility map"],
    ["01:55-02:45", "Asset deep dive: SPY / QQQ / TLT / GLD"],
    ["02:45-03:30", "Scenario planning และ watchlist"],
    ["03:30-04:00", "Q&A, action checklist, next-session plan"],
  ];
  const rows = items.map((item, i) => {
    const y = 345 + i * 88;
    return `<rect x="220" y="${y - 45}" width="1480" height="68" fill="${i % 2 ? C.bg : C.panel}" stroke="${C.line}" stroke-width="1.5"/>
      <text x="260" y="${y}" font-family="${FONT}" font-size="26" font-weight="800" fill="${C.blue}">${esc(item[0])}</text>
      <text x="515" y="${y}" font-family="${FONT}" font-size="28" fill="${C.text}">${esc(item[1])}</text>`;
  }).join("");
  return {
    title: "Agenda",
    note: "ใช้สไลด์นี้ตั้ง expectation ว่า deck นี้เป็น session 4 ชั่วโมง ไม่ใช่ daily snapshot สั้น ๆ",
    svg: slideFrame("แผนการนำเสนอ 4 ชั่วโมง", `ข้อมูลตลาดล่าสุด ${ctx.dataDate} | ${ctx.summaries.map((s) => s.symbol).join(", ")}`, rows, footer),
  };
}

function simpleListSlide(title, subtitle, items, footer, note, opts = {}) {
  const body = `${opts.kicker ? textBlock(opts.kicker, 120, 345, { size: 28, weight: 800, fill: C.blue, max: 60 }) : ""}
    ${bulletList(items, 130, opts.kicker ? 430 : 365, { size: opts.size || 32, max: opts.max || 70, gap: opts.gap || 100 })}`;
  return { title, note: note || items.join(" "), svg: slideFrame(title, subtitle, body, footer) };
}

function comparisonGridSlide(title, subtitle, rows, footer, note) {
  const colW = 405;
  const rowH = 120;
  let body = `<rect x="140" y="330" width="1620" height="${rowH * rows.length + 56}" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>`;
  const headers = ["มุมมอง", "Risk-on", "Risk-off", "สิ่งที่ต้องเช็ค"];
  headers.forEach((h, i) => {
    body += `<rect x="${140 + i * colW}" y="330" width="${colW}" height="56" fill="${C.navy}" stroke="${C.navy}" stroke-width="1"/>
      <text x="${160 + i * colW}" y="367" font-family="${FONT}" font-size="22" font-weight="800" fill="${C.bg}">${esc(h)}</text>`;
  });
  rows.forEach((r, ri) => {
    r.forEach((cell, ci) => {
      const x = 140 + ci * colW;
      const y = 386 + ri * rowH;
      body += `<rect x="${x}" y="${y}" width="${colW}" height="${rowH}" fill="${ri % 2 ? C.bg : C.panel}" stroke="${C.line}" stroke-width="1"/>
        ${textBlock(cell, x + 18, y + 38, { size: 22, max: 27, fill: ci === 0 ? C.blue : C.text, weight: ci === 0 ? 800 : 400, lh: 1.08 })}`;
    });
  });
  return { title, note, svg: slideFrame(title, subtitle, body, footer) };
}

function assetDeepDiveSlide(summary, ctx, footer, index) {
  const body = `${textBlock(summary.symbol, 110, 360, { size: 64, weight: 800, fill: CHART_COLORS[index % CHART_COLORS.length], max: 12 })}
    <rect x="110" y="420" width="430" height="250" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
    ${textBlock(`Close ${fmtNum(summary.latest.close)}`, 145, 475, { size: 30, weight: 800, fill: C.text, max: 24 })}
    ${textBlock(`1D ${fmtPct(summary.ret1d)} | 5D ${fmtPct(summary.ret5d)}`, 145, 540, { size: 27, fill: C.text, max: 28 })}
    ${textBlock(`20D ${fmtPct(summary.ret20d)} | 60D ${fmtPct(summary.ret60d)}`, 145, 595, { size: 27, fill: C.text, max: 28 })}
    ${textBlock(`20D vol ${fmtPct(summary.vol20)} | DD60 ${fmtPct(summary.drawdown60)}`, 145, 650, { size: 22, fill: C.muted, max: 33 })}
    ${lineChartNormalized([summary], 690, 360, 910, 420, 60)}
    <rect x="110" y="730" width="520" height="150" fill="${fillForReturn(summary.ret20d)}" stroke="${colorForReturn(summary.ret20d)}" stroke-width="2"/>
    ${textBlock(`Key read: ${summary.ret20d >= 0 ? "trend ยังเป็นบวกในกรอบ 20 วัน" : "trend 20 วันยังอ่อนตัว"}`, 145, 790, { size: 28, weight: 800, fill: colorForReturn(summary.ret20d), max: 38 })}
    ${textBlock("ใช้ประกอบการพูด ไม่ใช่คำแนะนำซื้อขาย", 145, 848, { size: 21, fill: C.muted, max: 42 })}`;
  return {
    title: `${summary.symbol} deep dive`,
    note: `เจาะ ${summary.symbol}: close ${fmtNum(summary.latest.close)}, 1D ${fmtPct(summary.ret1d)}, 20D ${fmtPct(summary.ret20d)}, volatility ${fmtPct(summary.vol20)}.`,
    svg: slideFrame(`เจาะ ${summary.symbol}: ภาพราคาและ risk ล่าสุด`, `Latest close ${summary.latest.date}`, body, footer),
  };
}

function assetTalkSlide(summary, footer, index) {
  const positive = summary.ret20d >= 0;
  const items = [
    `${summary.symbol} ให้ภาพ 1D ${fmtPct(summary.ret1d)} และ 20D ${fmtPct(summary.ret20d)}`,
    positive ? "ประเด็นที่ต้องยืนยันคือ momentum ยังมี breadth สนับสนุนหรือไม่" : "ประเด็นที่ต้องยืนยันคือแรงขายเริ่มชะลอหรือยัง",
    `Volatility 20D อยู่ที่ ${fmtPct(summary.vol20)} เทียบกับ drawdown 60D ${fmtPct(summary.drawdown60)}`,
    "คำถามสำหรับผู้ฟัง: ถ้าราคาปิดวันถัดไปสวนทางกับ 20D trend เราจะตีความอย่างไร",
  ];
  const body = `${bulletList(items, 130, 370, { size: 31, max: 68, gap: 105 })}
    <rect x="1180" y="380" width="520" height="350" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
    ${textBlock("Presenter cue", 1225, 445, { size: 30, weight: 800, fill: CHART_COLORS[index % CHART_COLORS.length], max: 24 })}
    ${textBlock("ให้ผู้ฟังตอบก่อนว่า signal นี้คือ trend, mean reversion, หรือ noise แล้วค่อยเปิดมุมมองของเรา", 1225, 515, { size: 27, fill: C.text, max: 31, lh: 1.12 })}`;
  return {
    title: `${summary.symbol} talk track`,
    note: items.join(" "),
    svg: slideFrame(`${summary.symbol}: ประเด็นพูดคุยและคำถามชวนคิด`, "ใช้สำหรับยืด discussion ใน session ยาว", body, footer),
  };
}

const O = {
  paper: "#F7F3ED",
  white: "#FFFFFF",
  ink: "#282522",
  muted: "#68625B",
  faint: "#E4DDD2",
  rule: "#C9BBAA",
  bronze: "#9C6844",
  bronzeDark: "#5B3928",
  bronzePale: "#EFE3D8",
  teal: "#006B78",
  tealDark: "#083E46",
  slate: "#47505A",
  gray: "#8E9294",
  amber: "#C56A00",
  red: "#A94064",
};

const O_CHART_COLORS = ["#9C6844", "#006B78", "#7C8A8E", "#C56A00", "#A94064", "#5C6F91", "#2F2A26", "#BC8F57"];

function outlookTextBlock(text, x, y, opts = {}) {
  const size = opts.size || 32;
  const fill = opts.fill || O.ink;
  const weight = opts.weight || 400;
  const max = opts.max || 46;
  const lh = opts.lh || 1.18;
  const font = opts.font || FONT;
  const anchor = opts.anchor ? ` text-anchor="${opts.anchor}"` : "";
  const style = opts.italic ? " font-style=\"italic\"" : "";
  const lines = wrap(text, max);
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}"${anchor}${style}>${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function outlookFooter(footer, pageNo) {
  return `<line x1="72" y1="998" x2="1700" y2="998" stroke="${O.rule}" stroke-width="1"/>
    <text x="72" y="1032" font-family="${FONT}" font-size="16" fill="${O.muted}">${esc(footer)}</text>
    <text x="1810" y="1034" font-family="${FONT}" font-size="18" font-weight="700" fill="${O.ink}" text-anchor="end">${esc(pageNo || "")}</text>`;
}

function outlookVisualPanel(kind, x, y, w, h, id = "panel") {
  const sid = String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
  const baseA = kind === "teal" || kind === "ai" ? O.tealDark : O.bronzeDark;
  const baseB = kind === "teal" || kind === "ai" ? "#0A7784" : "#C68555";
  let accents = "";
  if (kind === "ai") {
    for (let i = 0; i < 16; i += 1) {
      const yy = y + 90 + i * 34;
      accents += `<path d="M${x - 40} ${yy} C${x + w * 0.35} ${yy - 80}, ${x + w * 0.62} ${yy + 110}, ${x + w + 45} ${yy + 10}" fill="none" stroke="#E9E1D5" stroke-width="1.6" opacity="${0.08 + (i % 4) * 0.025}"/>`;
    }
    for (let r = 0; r < 10; r += 1) {
      for (let c = 0; c < 16; c += 1) {
        accents += `<circle cx="${x + 55 + c * 55 + (r % 2) * 22}" cy="${y + 70 + r * 55}" r="4" fill="#FFFFFF" opacity="0.18"/>`;
      }
    }
  } else if (kind === "infrastructure") {
    accents += `<path d="M${x + w * 0.18} ${y + h + 40} L${x + w * 0.45} ${y - 30} L${x + w * 0.70} ${y + h + 60}" fill="none" stroke="#FFFFFF" stroke-width="10" opacity="0.35"/>
      <path d="M${x + w * 0.05} ${y + h * 0.22} H${x + w * 0.96} M${x + w * 0.02} ${y + h * 0.44} H${x + w * 0.98} M${x + w * 0.02} ${y + h * 0.66} H${x + w * 0.98}" stroke="#F5C98E" stroke-width="8" opacity="0.28"/>`;
  } else if (kind === "wave" || kind === "teal") {
    for (let i = 0; i < 9; i += 1) {
      accents += `<path d="M${x - 30} ${y + 90 + i * 62} C${x + w * 0.25} ${y + 20 + i * 70}, ${x + w * 0.55} ${y + 160 + i * 28}, ${x + w + 35} ${y + 80 + i * 62}" fill="none" stroke="#FFFFFF" stroke-width="${12 - i * 0.7}" opacity="${0.09 + i * 0.012}"/>`;
    }
  } else {
    accents += `<polygon points="${x + w * 0.25},${y + h + 70} ${x + w},${y} ${x + w},${y + h} ${x + w * 0.53},${y + h}" fill="#D49A66" opacity="0.45"/>
      <polygon points="${x + w * 0.62},${y + h + 40} ${x + w},${y - 20} ${x + w},${y + h}" fill="#F0D1B2" opacity="0.25"/>
      <path d="M${x + 40} ${y + h * 0.78} C${x + w * 0.35} ${y + h * 0.48}, ${x + w * 0.55} ${y + h * 0.94}, ${x + w - 40} ${y + h * 0.6}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.12"/>`;
  }
  return `<defs>
      <linearGradient id="${sid}Grad" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${baseA}"/>
        <stop offset="0.58" stop-color="${baseB}"/>
        <stop offset="1" stop-color="${kind === "ai" ? "#161A1E" : "#E2C1A4"}"/>
      </linearGradient>
      <clipPath id="${sid}Clip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    </defs>
    <g clip-path="url(#${sid}Clip)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${sid}Grad)"/>
      ${accents}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000000" opacity="${kind === "ai" ? 0.08 : 0.03}"/>
    </g>`;
}

function outlookFrame(kicker, title, subtitle, body, footer, opts = {}) {
  const visual = opts.visual ? outlookVisualPanel(opts.visual, opts.visualX || 1160, opts.visualY || 0, opts.visualW || 760, opts.visualH || 1080, opts.id || "visual") : "";
  const titleSize = opts.titleSize || (title.length > 72 ? 58 : 72);
  const titleMax = opts.titleMax || 34;
  const page = opts.pageNo ? String(opts.pageNo).padStart(2, "0") : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${O.paper}"/>
    ${visual}
    <text x="72" y="60" font-family="${FONT}" font-size="17" font-weight="800" letter-spacing="1.6" fill="${O.ink}">${esc(String(kicker || "").toUpperCase())}</text>
    ${outlookTextBlock(title, 72, opts.titleY || 170, { size: titleSize, font: DISPLAY_FONT, fill: opts.titleFill || O.ink, max: titleMax, lh: 0.98 })}
    ${subtitle ? outlookTextBlock(subtitle, 72, opts.subtitleY || 310, { size: opts.subtitleSize || 28, font: opts.subtitleFont || DISPLAY_FONT, fill: opts.subtitleFill || O.bronze, max: opts.subtitleMax || 58, lh: 1.15 }) : ""}
    ${opts.rule === false ? "" : `<line x1="72" y1="${opts.ruleY || 354}" x2="${opts.ruleX2 || 1050}" y2="${opts.ruleY || 354}" stroke="${O.rule}" stroke-width="1.5"/>`}
    ${body}
    ${outlookFooter(footer, page)}
  </svg>`;
}

function outlookBullets(items, x, y, opts = {}) {
  const size = opts.size || 26;
  const gap = opts.gap || 92;
  const max = opts.max || 52;
  return items.map((item, i) => {
    const yy = y + i * gap;
    return `<path d="M${x} ${yy - 12} L${x + 9} ${yy} L${x} ${yy + 12} L${x - 9} ${yy} Z" fill="none" stroke="${opts.bulletColor || O.bronze}" stroke-width="2"/>
      ${outlookTextBlock(item, x + 34, yy + 8, { size, max, fill: opts.fill || O.ink, font: opts.font || FONT, weight: opts.weight || 400, lh: 1.12 })}`;
  }).join("");
}

function outlookSnapshotTable(summaries, x, y, w) {
  const headers = ["Symbol", "Close", "1D", "5D", "20D", "60D", "20D vol"];
  const col = [145, 190, 130, 130, 130, 130, 150];
  const rowH = 52;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${O.ink}"/>`;
  let cx = x;
  headers.forEach((h, i) => {
    out += `<text x="${cx + 14}" y="${y + 35}" font-family="${FONT}" font-size="18" font-weight="800" fill="${O.white}">${esc(h)}</text>`;
    cx += col[i];
  });
  summaries.forEach((s, r) => {
    const yy = y + rowH * (r + 1);
    out += `<rect x="${x}" y="${yy}" width="${w}" height="${rowH}" fill="${r % 2 ? O.white : "#F1EAE0"}" stroke="${O.faint}" stroke-width="1"/>`;
    cx = x;
    const vals = [s.symbol, fmtNum(s.latest.close), fmtPct(s.ret1d), fmtPct(s.ret5d), fmtPct(s.ret20d), fmtPct(s.ret60d), fmtPct(s.vol20)];
    vals.forEach((v, i) => {
      const fill = i >= 2 && i <= 5 ? (Number([s.ret1d, s.ret5d, s.ret20d, s.ret60d][i - 2]) >= 0 ? O.teal : O.red) : O.ink;
      out += `<text x="${cx + 14}" y="${yy + 34}" font-family="${FONT}" font-size="18" font-weight="${i === 0 ? 800 : 400}" fill="${fill}">${esc(v)}</text>`;
      cx += col[i];
    });
  });
  return out;
}

function outlookLineChartNormalized(summaries, x, y, w, h, days = 60) {
  const series = summaries.map((s, idx) => {
    const rows = s.rows.slice(-days);
    const base = rows[0].close;
    return { symbol: s.symbol, color: O_CHART_COLORS[idx % O_CHART_COLORS.length], points: rows.map((r) => ({ date: r.date, value: (r.close / base) * 100 })) };
  });
  const values = series.flatMap((s) => s.points.map((p) => p.value));
  const min = Math.floor((Math.min(...values) - 1) / 2) * 2;
  const max = Math.ceil((Math.max(...values) + 1) / 2) * 2;
  const sx = (i, n) => x + (n === 1 ? 0 : (i / (n - 1)) * w);
  const sy = (v) => y + h - ((v - min) / (max - min || 1)) * h;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${O.white}" stroke="${O.rule}" stroke-width="1.5"/>`;
  for (let i = 0; i <= 4; i += 1) {
    const v = min + ((max - min) * i) / 4;
    const yy = sy(v);
    out += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${O.faint}" stroke-width="1"/>
      <text x="${x - 10}" y="${yy + 5}" text-anchor="end" font-family="${FONT}" font-size="14" fill="${O.muted}">${v.toFixed(0)}</text>`;
  }
  series.forEach((s) => {
    const pathD = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i, s.points.length).toFixed(1)} ${sy(p.value).toFixed(1)}`).join(" ");
    const last = s.points[s.points.length - 1];
    out += `<path d="${pathD}" fill="none" stroke="${s.color}" stroke-width="4"/>
      <circle cx="${sx(s.points.length - 1, s.points.length)}" cy="${sy(last.value)}" r="6" fill="${s.color}"/>
      <text x="${x + w + 14}" y="${sy(last.value) + 6}" font-family="${FONT}" font-size="17" font-weight="800" fill="${s.color}">${esc(s.symbol)}</text>`;
  });
  out += `<text x="${x}" y="${y + h + 31}" font-family="${FONT}" font-size="15" fill="${O.muted}">${esc(series[0].points[0].date)}</text>
    <text x="${x + w}" y="${y + h + 31}" font-family="${FONT}" font-size="15" fill="${O.muted}" text-anchor="end">${esc(series[0].points[series[0].points.length - 1].date)}</text>`;
  return out;
}

function outlookReturnBars(summaries, x, y, w, h) {
  const periods = [["1D", "ret1d", O.bronze], ["5D", "ret5d", O.teal], ["20D", "ret20d", O.amber]];
  const maxAbs = Math.max(0.01, ...summaries.flatMap((s) => periods.map((p) => Math.abs(s[p[1]] || 0))));
  const rowH = h / summaries.length;
  const zeroX = x + 140 + (w - 210) / 2;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${O.white}" stroke="${O.rule}" stroke-width="1.5"/>
    <line x1="${zeroX}" y1="${y + 24}" x2="${zeroX}" y2="${y + h - 24}" stroke="${O.rule}" stroke-width="1.5"/>`;
  summaries.forEach((s, i) => {
    const yy = y + i * rowH + 32;
    out += `<text x="${x + 22}" y="${yy + 33}" font-family="${FONT}" font-size="22" font-weight="800" fill="${O.ink}">${esc(s.symbol)}</text>`;
    periods.forEach((p, j) => {
      const v = s[p[1]];
      const bw = (Math.abs(v) / maxAbs) * ((w - 230) / 2);
      const bx = v >= 0 ? zeroX : zeroX - bw;
      const by = yy + j * 25;
      out += `<rect x="${bx}" y="${by}" width="${Math.max(2, bw)}" height="17" fill="${v >= 0 ? p[2] : O.red}" opacity="${j === 0 ? 1 : 0.72}"/>
        <text x="${v >= 0 ? bx + bw + 8 : bx - 8}" y="${by + 14}" font-family="${FONT}" font-size="15" fill="${O.ink}" text-anchor="${v >= 0 ? "start" : "end"}">${p[0]} ${fmtPct(v)}</text>`;
    });
  });
  return out;
}

function outlookRiskScatter(summaries, x, y, w, h) {
  const xs = summaries.map((s) => s.ret20d).filter(Number.isFinite);
  const ys = summaries.map((s) => s.vol20).filter(Number.isFinite);
  const minX = Math.min(-0.02, Math.min(...xs) - 0.015);
  const maxX = Math.max(0.02, Math.max(...xs) + 0.015);
  const minY = 0;
  const maxY = Math.max(0.15, Math.max(...ys) * 1.15);
  const sx = (v) => x + ((v - minX) / (maxX - minX || 1)) * w;
  const sy = (v) => y + h - ((v - minY) / (maxY - minY || 1)) * h;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${O.white}" stroke="${O.rule}" stroke-width="1.5"/>`;
  for (let i = 0; i <= 4; i += 1) {
    const xx = x + (i / 4) * w;
    const yy = y + (i / 4) * h;
    out += `<line x1="${xx}" y1="${y}" x2="${xx}" y2="${y + h}" stroke="${O.faint}" stroke-width="1"/>
      <line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${O.faint}" stroke-width="1"/>`;
  }
  out += `<line x1="${sx(0)}" y1="${y}" x2="${sx(0)}" y2="${y + h}" stroke="${O.rule}" stroke-width="1.5" stroke-dasharray="6 6"/>`;
  summaries.forEach((s, i) => {
    const color = O_CHART_COLORS[i % O_CHART_COLORS.length];
    out += `<circle cx="${sx(s.ret20d)}" cy="${sy(s.vol20)}" r="14" fill="${color}" opacity="0.9"/>
      <text x="${sx(s.ret20d) + 19}" y="${sy(s.vol20) + 7}" font-family="${FONT}" font-size="19" font-weight="800" fill="${color}">${esc(s.symbol)}</text>`;
  });
  out += `<text x="${x + w / 2}" y="${y + h + 40}" font-family="${FONT}" font-size="18" fill="${O.muted}" text-anchor="middle">20D return</text>
    <text x="${x - 48}" y="${y + h / 2}" transform="rotate(-90 ${x - 48} ${y + h / 2})" font-family="${FONT}" font-size="18" fill="${O.muted}" text-anchor="middle">20D annualized volatility</text>`;
  return out;
}

function outlookCoverSlide(ctx) {
  const symbols = ctx.summaries.map((s) => s.symbol).join(" | ");
  const footer = "Source: Alpha Vantage TIME_SERIES_DAILY";
  const body = `${outlookVisualPanel("pressure", 0, 0, W, H, "cover")}
    <rect width="${W}" height="${H}" fill="#000000" opacity="0.18"/>
    <text x="90" y="92" font-family="${FONT}" font-size="20" font-weight="800" letter-spacing="2" fill="${O.white}">DAILY MARKET OUTLOOK</text>
    ${outlookTextBlock("Signals Under Pressure", 90, 420, { size: 84, font: DISPLAY_FONT, fill: O.white, max: 24, lh: 0.98 })}
    ${outlookTextBlock(ctx.title, 92, 590, { size: 32, font: DISPLAY_FONT, fill: "#F2D7BF", max: 44, lh: 1.1 })}
    <line x1="92" y1="646" x2="680" y2="646" stroke="#F2D7BF" stroke-width="1.3"/>
    <text x="92" y="700" font-family="${FONT}" font-size="23" fill="${O.white}">Data date ${esc(ctx.dataDate)}  |  ${esc(symbols)}</text>
    <text x="92" y="738" font-family="${FONT}" font-size="18" fill="#EADDD0">Generated ${esc(ctx.generatedAt)}. Independent briefing deck; no third-party brand template copied.</text>
    <text x="90" y="1030" font-family="${FONT}" font-size="15" fill="#EADDD0">${esc(footer)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

function outlookTakeawaysSlide(ctx, footer) {
  const n = ctx.narrative;
  const items = [
    n.bullets[0],
    n.bullets[1],
    n.bullets[2],
    "ใช้ framing แบบ what changed, why it matters, what to watch next",
  ];
  const body = `${outlookBullets(items, 190, 420, { size: 27, max: 68, gap: 116 })}
    <rect x="1180" y="245" width="560" height="585" fill="${O.white}" stroke="${O.rule}" stroke-width="1.5"/>
    ${outlookTextBlock("Ask the tough questions", 1225, 315, { size: 34, font: DISPLAY_FONT, fill: O.bronze, max: 24 })}
    ${outlookBullets([
      "Daily move หรือ trend หลายสัปดาห์?",
      "Return นี้แลกมากับ volatility เท่าไร?",
      "Signal กระจุกใน proxy เดียวหรือ broad-based?",
      "ต้องรอ confirmation อะไรในวันถัดไป?",
    ], 1240, 410, { size: 24, max: 31, gap: 84, bulletColor: O.teal })}`;
  return { title: "Key takeaways", note: items.join(" "), svg: outlookFrame("Daily market outlook", "Key takeaways", "สิ่งที่ผู้ฟังควรจำก่อนเข้า chart detail", body, footer, { pageNo: 2, titleSize: 78, titleMax: 24 }) };
}

function outlookContentsSlide(ctx, footer) {
  const rows = [
    ["Part 1", "Market snapshot", "Cross-asset tone, leader/laggard, return horizon"],
    ["Part 2", "Reading the exhibits", "How to interpret trend, return, volatility, drawdown"],
    ["Part 3", "Asset deep dives", "SPY / QQQ / TLT / GLD as market regime proxies"],
    ["Part 4", "Scenario planning", "What could go right, what could go wrong, what to watch"],
    ["Part 5", "Presentation playbook", "Daily routine, wording rules, Q&A and next steps"],
  ];
  const body = rows.map((r, i) => {
    const y = 360 + i * 108;
    return `<line x1="160" y1="${y + 56}" x2="1600" y2="${y + 56}" stroke="${O.rule}" stroke-width="1"/>
      <text x="160" y="${y}" font-family="${DISPLAY_FONT}" font-size="30" fill="${O.bronze}">${esc(r[0])}</text>
      <text x="370" y="${y}" font-family="${DISPLAY_FONT}" font-size="36" fill="${O.ink}">${esc(r[1])}</text>
      <text x="920" y="${y}" font-family="${FONT}" font-size="22" fill="${O.muted}">${esc(r[2])}</text>`;
  }).join("");
  return { title: "Contents", note: "Set the 4-hour flow.", svg: outlookFrame("Daily market outlook", "Contents", "", body, footer, { pageNo: 3, titleSize: 80, titleMax: 18, rule: false }) };
}

function outlookIntroSlide(ctx, footer) {
  const n = ctx.narrative;
  const body = `${outlookVisualPanel("wave", 0, 0, W, 360, "intro")}
    <rect x="0" y="0" width="${W}" height="360" fill="#000000" opacity="0.18"/>
    <text x="72" y="75" font-family="${FONT}" font-size="17" font-weight="800" letter-spacing="1.6" fill="${O.white}">DAILY MARKET OUTLOOK</text>
    ${outlookTextBlock("Introduction", 72, 218, { size: 76, font: DISPLAY_FONT, fill: O.white, max: 20 })}
    ${outlookTextBlock("The purpose of this session is not to forecast a single future. It is to read the current market pressure, identify the strongest signals, and prepare the next questions.", 96, 470, { size: 40, font: DISPLAY_FONT, fill: O.bronze, max: 82, lh: 1.12 })}
    ${outlookTextBlock(n.bullets.join(" "), 100, 650, { size: 23, fill: O.ink, max: 112, lh: 1.25 })}
    <line x1="100" y1="790" x2="860" y2="790" stroke="${O.rule}" stroke-width="1.5"/>
    ${outlookTextBlock("Session stance", 100, 850, { size: 28, font: DISPLAY_FONT, fill: O.bronze, max: 22 })}
    ${outlookTextBlock("Evidence first. Separate observation from interpretation. End with watch items, not broad predictions.", 360, 850, { size: 22, fill: O.ink, max: 76, lh: 1.22 })}
    ${outlookFooter(footer, "04")}`;
  return { title: "Introduction", note: "Frame the deck as an outlook-style session rather than a dashboard readout.", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${O.paper}"/>${body}</svg>` };
}

function outlookSectionSlide(part, title, subtitle, kind, footer, pageNo, note) {
  const body = `${outlookVisualPanel(kind, 0, 520, W, 560, `section${pageNo}`)}
    ${outlookTextBlock(part, 96, 210, { size: 58, font: DISPLAY_FONT, fill: O.bronze, max: 18 })}
    ${outlookTextBlock(title, 96, 330, { size: 78, font: DISPLAY_FONT, fill: O.ink, max: 39, lh: 0.96 })}
    ${outlookTextBlock(subtitle, 100, 455, { size: 27, fill: O.muted, max: 70 })}
    ${outlookFooter(footer, String(pageNo).padStart(2, "0"))}`;
  return { title: `${part}: ${title}`, note: note || title, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${O.paper}"/>${body}</svg>` };
}

function outlookExhibitSlide(kicker, title, subtitle, chartTitle, chartSub, chartSvg, insight, footer, pageNo, note) {
  const body = `<rect x="96" y="372" width="1175" height="505" fill="${O.white}" stroke="${O.rule}" stroke-width="1.5"/>
    <text x="126" y="420" font-family="${FONT}" font-size="21" font-weight="800" letter-spacing="0.8" fill="${O.bronze}">${esc(String(chartTitle || "").toUpperCase())}</text>
    <text x="126" y="452" font-family="${FONT}" font-size="18" fill="${O.muted}">${esc(chartSub || "")}</text>
    ${chartSvg}
    <rect x="1320" y="372" width="430" height="505" fill="${O.bronzePale}" stroke="${O.rule}" stroke-width="1.5"/>
    ${outlookTextBlock("Presenter read", 1360, 435, { size: 33, font: DISPLAY_FONT, fill: O.bronze, max: 20 })}
    ${outlookTextBlock(insight, 1360, 505, { size: 24, fill: O.ink, max: 32, lh: 1.18 })}`;
  return { title, note: note || insight, svg: outlookFrame(kicker, title, subtitle, body, footer, { pageNo, titleSize: title.length > 62 ? 55 : 64, titleMax: 46, subtitleY: 280, ruleY: 328 }) };
}

function outlookListSlide(kicker, title, subtitle, items, footer, pageNo, note, opts = {}) {
  const visual = opts.visual ? outlookVisualPanel(opts.visual, 1240, 355, 500, 420, `list${pageNo}`) : "";
  const body = `${outlookBullets(items, 150, 405, { size: opts.size || 27, max: opts.max || 68, gap: opts.gap || 100, bulletColor: opts.bulletColor || O.bronze })}
    ${visual}`;
  return { title, note: note || items.join(" "), svg: outlookFrame(kicker, title, subtitle, body, footer, { pageNo, titleSize: opts.titleSize || 62, titleMax: opts.titleMax || 48, subtitleY: 282, ruleY: 330 }) };
}

function outlookAssetDeepDive(summary, footer, pageNo, index) {
  const positive = summary.ret20d >= 0;
  const insight = `${summary.symbol} shows 1D ${fmtPct(summary.ret1d)} and 20D ${fmtPct(summary.ret20d)}. The key question is whether the next close confirms this as trend or treats it as noise.`;
  const chart = outlookLineChartNormalized([summary], 145, 505, 880, 280, 60);
  const metrics = `<rect x="1070" y="505" width="260" height="280" fill="${positive ? "#E3EFEA" : "#F0E3E8"}" stroke="${positive ? O.teal : O.red}" stroke-width="1.5"/>
    ${outlookTextBlock(summary.symbol, 1105, 570, { size: 50, font: DISPLAY_FONT, fill: O_CHART_COLORS[index % O_CHART_COLORS.length], max: 10 })}
    ${outlookTextBlock(`Close ${fmtNum(summary.latest.close)}`, 1108, 630, { size: 23, weight: 800, max: 18 })}
    ${outlookTextBlock(`1D ${fmtPct(summary.ret1d)} | 20D ${fmtPct(summary.ret20d)}`, 1108, 685, { size: 21, max: 19 })}
    ${outlookTextBlock(`20D vol ${fmtPct(summary.vol20)}`, 1108, 735, { size: 21, max: 18 })}
    ${outlookTextBlock(`DD60 ${fmtPct(summary.drawdown60)}`, 1108, 775, { size: 21, max: 18 })}`;
  return outlookExhibitSlide("Asset deep dive", `What changed in ${summary.symbol}?`, `Latest close ${summary.latest.date}`, `${summary.symbol} normalized trend and risk`, "Normalized close, first visible day = 100", `${chart}${metrics}`, insight, footer, pageNo, insight);
}

function outlookAssetQuestionSlide(summary, footer, pageNo) {
  const items = [
    `What could go right: ${summary.ret20d >= 0 ? "20D momentum broadens and volatility stays contained" : "downside pressure stabilizes and the next close stops making new lows"}`,
    `What could go wrong: price action diverges from the broader market and volatility rises above the current ${fmtPct(summary.vol20)} run rate`,
    `What to watch: next close versus the 20D path, drawdown behavior, and whether leadership is broad or isolated`,
  ];
  return outlookListSlide("Scenario prompt", `${summary.symbol}: What could go right, and what could go wrong?`, "ใช้สไลด์นี้เปิด discussion ไม่ใช่ให้คำแนะนำซื้อขาย", items, footer, pageNo, items.join(" "), { visual: summary.symbol === "TLT" ? "infrastructure" : summary.symbol === "GLD" ? "pressure" : "ai", size: 25, max: 64, gap: 118, titleSize: 56 });
}

function outlookScenarioMatrix(footer, pageNo) {
  const headers = ["Signal", "What could go right", "What could go wrong", "Watch next"];
  const rows = [
    ["Equities", "SPY/QQQ hold gains and breadth improves", "leadership narrows while defensives fail to offset", "close, breadth, volume"],
    ["Rates", "TLT stabilizes and supports valuation pressure", "TLT weakens and growth proxies fade", "yield-sensitive assets"],
    ["Gold", "GLD cools while risk assets advance", "GLD leads while equities weaken", "hedging demand"],
    ["Volatility", "returns improve with controlled realized vol", "returns fade while realized vol rises", "20D vol and DD60"],
  ];
  const col = [260, 430, 430, 300];
  const x = 135;
  const y = 385;
  const rowH = 104;
  let table = `<rect x="${x}" y="${y}" width="1420" height="${rowH * rows.length + 58}" fill="${O.white}" stroke="${O.rule}" stroke-width="1.5"/>`;
  let cx = x;
  headers.forEach((h, i) => {
    table += `<rect x="${cx}" y="${y}" width="${col[i]}" height="58" fill="${O.ink}"/>
      <text x="${cx + 18}" y="${y + 38}" font-family="${FONT}" font-size="18" font-weight="800" fill="${O.white}">${esc(h)}</text>`;
    cx += col[i];
  });
  rows.forEach((r, ri) => {
    cx = x;
    r.forEach((cell, ci) => {
      const yy = y + 58 + ri * rowH;
      table += `<rect x="${cx}" y="${yy}" width="${col[ci]}" height="${rowH}" fill="${ri % 2 ? O.white : "#F1EAE0"}" stroke="${O.faint}" stroke-width="1"/>
        ${outlookTextBlock(cell, cx + 18, yy + 37, { size: 20, max: ci === 0 ? 18 : 30, fill: ci === 0 ? O.bronze : O.ink, weight: ci === 0 ? 800 : 400, lh: 1.08 })}`;
      cx += col[ci];
    });
  });
  const body = table;
  return { title: "Scenario matrix", note: "Use the matrix to avoid one-way forecasting.", svg: outlookFrame("Scenario planning", "What could go right, and what could go wrong?", "ไม่ทำนายทางเดียว แต่เตรียมเงื่อนไขที่ต้อง monitor", body, footer, { pageNo, titleSize: 58, titleMax: 50, subtitleY: 282, ruleY: 330 }) };
}

function buildOutlookFourHourSlides(ctx) {
  const s = ctx.summaries;
  const n = ctx.narrative;
  const footer = `Alpha Vantage TIME_SERIES_DAILY | Data date: ${ctx.dataDate}${ctx.cacheNote ? " | Cache used" : ""}`;
  const slides = [];
  slides.push({ title: "Cover", note: "Open with a premium outlook frame and data date.", svg: outlookCoverSlide(ctx) });
  slides.push(outlookTakeawaysSlide(ctx, footer));
  slides.push(outlookContentsSlide(ctx, footer));
  slides.push(outlookIntroSlide(ctx, footer));
  slides.push(outlookSectionSlide("Part 1", "Market snapshot", "Start with the pressure points before discussing interpretation", "wave", footer, 5, "Start the evidence section."));
  slides.push({ title: "Market snapshot", note: n.bullets.join(" "), svg: outlookFrame("Market snapshot", "Latest cross-asset tone is mixed, so the story should separate daily reaction from 20D trend", `Data date ${ctx.dataDate}`, `${outlookSnapshotTable(s, 120, 390, 1020)}<rect x="1220" y="390" width="500" height="330" fill="${O.bronzePale}" stroke="${O.rule}" stroke-width="1.5"/>${outlookTextBlock("Executive readout", 1260, 455, { size: 36, font: DISPLAY_FONT, fill: O.bronze, max: 22 })}${outlookBullets(n.bullets, 1270, 535, { size: 22, max: 31, gap: 78, bulletColor: O.teal })}`, footer, { pageNo: 6, titleSize: 55, titleMax: 57, subtitleY: 292, ruleY: 342 }) });
  slides.push(outlookExhibitSlide("Market exhibit", "The 60-session trend shows where leadership is persistent", "Normalized close levels make cross-asset comparison readable", "Normalized performance", "First visible day = 100", outlookLineChartNormalized(s, 150, 495, 980, 305, 60), n.bullets[2], footer, 7, "Use this chart to compare leadership persistence."));
  slides.push(outlookExhibitSlide("Market exhibit", "Return horizon separates noise from trend", "Compare 1D reaction against 5D and 20D move", "Returns by horizon", "1D, 5D and 20D returns", outlookReturnBars(s, 155, 500, 980, 310), "If 1D and 20D tell different stories, lead with the tension and identify what would confirm either interpretation.", footer, 8, "Use horizon bars to separate daily noise from trend."));
  slides.push(outlookExhibitSlide("Market exhibit", "Return needs to be read together with realized volatility", "20D return versus annualized 20D volatility", "Risk-return map", "Right = stronger 20D return; up = higher realized volatility", outlookRiskScatter(s, 200, 505, 850, 300), "Assets in the upper-right may still be leaders, but the presenter must explain the volatility cost of that return.", footer, 9, "Use the risk map to avoid return-only storytelling."));
  slides.push(outlookListSlide("Investment implications", "Today’s readout should become a watchlist, not a one-way forecast", "For a 4-hour presentation, use this page to reset the room before deep dives", [...n.watch, "Avoid investment advice language; keep the discussion at evidence and scenario level"], footer, 10, "Convert the readout to watch items.", { visual: "infrastructure" }));
  slides.push(outlookSectionSlide("Part 2", "Reading the exhibits", "Teach the audience how to read the figures before asking for conclusions", "infrastructure", footer, 11, "Move to chart interpretation."));
  slides.push(outlookListSlide("Chart reading", "How to read the snapshot table", "Start with pulse, then test trend and risk", ["1D shows the latest reaction but is not enough to define a regime", "5D shows whether the move accumulated across sessions", "20D/60D help separate trend from daily noise", "Volatility and drawdown prevent over-reading positive returns"], footer, 12, "Explain table reading."));
  slides.push(outlookListSlide("Chart reading", "How to read the normalized trend exhibit", "Use the shape of the path, not only the final level", ["Persistent upward separation suggests relative leadership", "A sharp divergence from the group starts the discussion", "A choppy path means the same return may deserve less conviction", "Ask what macro driver explains the leadership: rates, growth, commodities or defensive flow"], footer, 13, "Explain normalized trend reading.", { visual: "wave", titleSize: 58 }));
  slides.push(outlookListSlide("Chart reading", "How to read return versus volatility", "Separate reward from the risk paid to receive it", ["Right side means stronger 20D return", "Higher position means higher realized volatility", "Lower-right is cleaner trend; upper-left is stress", "The question is not only what rose, but what risk it required"], footer, 14, "Explain risk-return map.", { visual: "ai" }));
  slides.push(outlookSectionSlide("Part 3", "Asset deep dives", "Use each proxy to test whether the market story is broad or narrow", "ai", footer, 15, "Move into asset deep dives."));
  s.forEach((summary, i) => {
    slides.push(outlookAssetDeepDive(summary, footer, 16 + i * 2, i));
    slides.push(outlookAssetQuestionSlide(summary, footer, 17 + i * 2));
  });
  slides.push(outlookSectionSlide("Part 4", "Scenario planning", "Turn market pressure into conditional questions for the next session", "pressure", footer, 24, "Move to scenario planning."));
  slides.push(outlookScenarioMatrix(footer, 25));
  slides.push(outlookListSlide("Watchlist", "What to check before the next market meeting", "Use this checklist as the closing discussion prompt", n.watch, footer, 26, n.watch.join(" "), { visual: "wave" }));
  slides.push(outlookListSlide("Discussion", "Questions that make the room do the work", "Designed to stretch the session without adding chart clutter", ["Is today’s tone risk-on, risk-off or mixed, and why?", "Which proxy gives the cleanest signal today?", "If equity leadership stays positive while gold volatility is high, how should we frame the tension?", "Which number should be monitored before the next presentation?"], footer, 27, "Facilitate discussion.", { visual: "infrastructure", titleSize: 56 }));
  slides.push(outlookSectionSlide("Part 5", "Presentation playbook", "Make the process repeatable every trading day", "teal", footer, 28, "Move to the repeatable routine."));
  slides.push(outlookListSlide("Daily routine", "The 15-minute preparation routine", "A high-quality daily deck needs a repeatable process", ["Check data date and cache note before presenting", "Write a three-bullet executive readout from the snapshot table", "Identify leader, laggard and whether the signal is broad", "Use the risk map before making any return statement"], footer, 29, "Daily prep routine."));
  slides.push(outlookListSlide("Wording rules", "Keep the language precise and defensible", "This keeps the presentation professional and compliant", ["Observation first, interpretation second", "Separate daily move from multi-week trend", "State that daily close data is not live intraday data", "End with what to watch next, not a broad prediction"], footer, 30, "Language rules.", { visual: "ai" }));
  slides.push(outlookListSlide("Q&A", "Close with the next version of the system", "Use the final minutes to decide what should be added to the daily workflow", ["Choose the symbol universe used in the real daily meeting", "Add Thai, Asia, FX, rates or sector proxies when data sources are ready", "Define refresh time and owner for the commentary", "Keep only slides that the audience actually uses"], footer, 31, "Close the session with next steps.", { visual: "pressure" }));
  return slides;
}

function buildFourHourSlides(ctx) {
  const s = ctx.summaries;
  const n = ctx.narrative;
  const footer = `Source: Alpha Vantage TIME_SERIES_DAILY | Data date: ${ctx.dataDate}${ctx.cacheNote ? " | Cache used" : ""}`;
  const slides = [];
  slides.push({ title: "Cover", note: "เปิด session 4 ชั่วโมงและระบุว่าข้อมูลเป็น daily close ล่าสุด", svg: coverSlide(ctx) });
  slides.push(agendaSlide(ctx, footer));
  slides.push(simpleListSlide("เป้าหมายของ session วันนี้", "ให้ผู้ฟังอ่าน market dashboard ได้และแปลงเป็น narrative สำหรับการประชุม", [
    "เข้าใจภาพตลาดล่าสุดแบบ cross-asset โดยไม่จมกับตัวเลขรายตัว",
    "อ่านกราฟ return, trend, volatility และ drawdown ให้เป็นเรื่องเดียวกัน",
    "ฝึกตั้งคำถามก่อนสรุปมุมมองตลาด",
    "จบด้วย watchlist สำหรับวันถัดไปและ Q&A ที่ใช้ได้จริง",
  ], footer, "ตั้งเป้าหมายให้ชัดว่า session นี้คือการฝึกอ่านตลาดและนำเสนอ ไม่ใช่การให้คำแนะนำลงทุน"));
  slides.push(sectionSlide("Part 1: Market Snapshot", "อ่านภาพรวมก่อนลงรายละเอียด", footer, "เริ่มจากภาพรวม cross-asset"));
  slides.push(...buildSlides(ctx).slice(1, 5));
  slides.push(simpleListSlide("Executive readout สำหรับเปิดประชุม", `Market tone: ${n.toneThai || n.tone}`, n.bullets, footer, n.bullets.join(" "), { kicker: "3 ประโยคที่ควรพูดให้จบใน 60 วินาที" }));
  slides.push(sectionSlide("Part 2: How To Read The Charts", "เปลี่ยนกราฟเป็น storyline", footer, "เข้าสู่ส่วนอธิบายวิธีอ่านกราฟ"));
  slides.push(simpleListSlide("วิธีอ่าน snapshot table", "เริ่มจาก 1D เพื่อรู้ pulse แล้วดู 20D/60D เพื่อแยก trend", [
    "1D บอก reaction ล่าสุด แต่ไม่พอสำหรับสรุป regime",
    "5D ช่วยดูว่าการเคลื่อนไหวเป็นรายวันหรือสะสมมาหลาย session",
    "20D/60D ใช้จับ trend และเปรียบเทียบสินทรัพย์ข้ามกลุ่ม",
    "Volatility และ drawdown เป็นตัวกันไม่ให้ตีความ return ดีเกินจริง",
  ], footer));
  slides.push(simpleListSlide("วิธีอ่าน normalized trend chart", "ทำให้สินทรัพย์ต่างราคาเปรียบเทียบกันได้", [
    "เส้นที่ยกตัวต่อเนื่องคือ relative leadership",
    "เส้นที่ diverge ออกจากกลุ่มคือจุดเริ่มต้นของ discussion",
    "อย่าดูเฉพาะเส้นสุดท้าย ให้ดู path ระหว่างทางว่าผันผวนแค่ไหน",
    "ถามเสมอว่า leadership มาจาก growth, rates, commodity หรือ defensive flow",
  ], footer));
  slides.push(simpleListSlide("วิธีอ่าน return-versus-volatility", "แยกผลตอบแทนออกจากความเสี่ยงที่ต้องรับ", [
    "ขวา = 20D return สูงกว่า",
    "บน = volatility สูงกว่า",
    "มุมขวาล่างคือ trend ที่ดูสะอาดกว่า",
    "มุมซ้ายบนคือจุดที่ต้องระวัง เพราะ return อ่อนแต่ risk สูง",
  ], footer));
  slides.push(sectionSlide("Part 3: Asset Deep Dive", "ใช้ proxy แต่ละตัวเล่า market regime", footer, "เข้าสู่ deep dive รายสินทรัพย์"));
  s.forEach((summary, i) => {
    slides.push(assetDeepDiveSlide(summary, ctx, footer, i));
    slides.push(assetTalkSlide(summary, footer, i));
  });
  slides.push(sectionSlide("Part 4: Scenario Planning", "จากข้อมูลวันนี้ สร้างกรอบคิดสำหรับวันถัดไป", footer, "เข้าสู่ scenario planning"));
  slides.push(comparisonGridSlide("Scenario matrix สำหรับการประชุมวันถัดไป", "ไม่ทำนาย แต่เตรียมเงื่อนไขที่ต้องดู", [
    ["Equities lead", "SPY/QQQ ยืนบวกและ breadth ดี", "SPY/QQQ หลุดแต่ defensive ไม่ช่วย", "ดู close, volume, breadth"],
    ["Rates pressure", "TLT ฟื้น ช่วย valuation multiple", "TLT ลงต่อ กด growth proxy", "ดู yield-sensitive assets"],
    ["Gold signal", "GLD พักตัวแต่ risk asset ไปต่อ", "GLD เด่นพร้อม equity อ่อน", "ดู risk hedge demand"],
    ["Volatility", "return บวกพร้อม vol คุมได้", "return อ่อนพร้อม vol สูง", "ดู 20D vol และ drawdown"],
  ], footer, "ใช้ matrix เพื่อกันการสรุปแบบ one-way forecast"));
  slides.push(simpleListSlide("Watchlist สำหรับวันถัดไป", "คำถามที่ควรเตรียมก่อนตลาดปิดรอบหน้า", n.watch, footer, n.watch.join(" "), { kicker: "ใช้ 3 ข้อนี้เป็น closing checklist" }));
  slides.push(simpleListSlide("คำถามชวน discussion", "ส่วนนี้ออกแบบไว้ให้ใช้เวลาคุยกับผู้ฟัง", [
    "วันนี้ market tone เป็น risk-on, risk-off หรือ mixed เพราะอะไร",
    "สินทรัพย์ไหนให้ signal ที่น่าเชื่อที่สุด และเพราะอะไร",
    "ถ้า QQQ ยังนำ แต่ GLD volatility สูง เราควรเล่าเรื่องนี้อย่างไร",
    "ตัวเลขไหนใน deck ที่ควร monitor ก่อนประชุมครั้งหน้า",
  ], footer));
  slides.push(sectionSlide("Part 5: Presentation Playbook", "ทำให้ daily market deck ใช้ซ้ำได้ทุกวัน", footer, "เข้าสู่ playbook การใช้งานประจำวัน"));
  slides.push(simpleListSlide("Daily routine 15 นาที ก่อนนำเสนอ", "ลดเวลาเตรียม แต่ยังคุมคุณภาพ", [
    "เช็ค data date และ cache note ก่อนทุกครั้ง",
    "อ่าน snapshot table แล้วเขียน 3-bullet readout",
    "ดู trend chart เพื่อหา leader และ laggard",
    "ดู risk map เพื่อกันการเล่า return โดยไม่พูดถึง volatility",
  ], footer));
  slides.push(simpleListSlide("กติกาการพูดในห้องประชุม", "ทำให้เนื้อหากระชับและ defensible", [
    "พูดเป็น observation ก่อน ไม่รีบตีความเป็น recommendation",
    "แยก daily move ออกจาก trend หลายสัปดาห์",
    "บอกข้อจำกัดของข้อมูลเสมอ: daily close ไม่ใช่ live intraday",
    "จบด้วยสิ่งที่จะ monitor ต่อ ไม่จบด้วยคำทำนายกว้าง ๆ",
  ], footer));
  slides.push(buildSlides(ctx).at(-1));
  slides.push(simpleListSlide("Q&A และ next steps", "ปิด session ด้วย action ที่ทำต่อได้", [
    "เลือก symbol universe ที่ใช้จริงใน daily meeting ของทีม",
    "เพิ่ม proxy ไทย / เอเชีย / FX / sector ETF ถ้ามี data source พร้อม",
    "กำหนดเวลา refresh และคนรับผิดชอบ commentary",
    "เก็บ feedback ว่าสไลด์ไหนใช้จริงและสไลด์ไหนควรถอดออก",
  ], footer, "ปิดด้วย next steps และถามว่าต้องเพิ่ม universe ใดในรอบถัดไป"));
  return slides;
}

function writeOutline(projectName, ctx, slides) {
  ensureDir(ctx.notesDir);
  const out = path.join(ctx.notesDir, `${projectName}-outline.md`);
  const lines = [
    `# ${projectName} Outline`,
    "",
    `Generated: ${ctx.generatedAt}`,
    `Data date: ${ctx.dataDate}`,
    `Symbols: ${ctx.summaries.map((s) => s.symbol).join(", ")}`,
    `Tone: ${ctx.narrative.tone}`,
    `Deck mode: ${ctx.deckMode}`,
    `Visual style: ${ctx.visualStyle || "standard"}`,
    `Duration minutes: ${ctx.durationMinutes}`,
    "",
    "## Slides",
    ...slides.map((slide, i) => `${i + 1}. ${slide.title || `Slide ${i + 1}`}`),
    "",
    "## Presenter Notes",
    ...slides.map((slide, i) => `${i + 1}. ${slide.note}`),
  ];
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  return out;
}

function writeData(projectName, ctx) {
  ensureDir(ctx.notesDir);
  const out = path.join(ctx.notesDir, `${projectName}-market-data.json`);
  const safe = {
    project_name: projectName,
    generated_at: ctx.generatedAt,
    data_date: ctx.dataDate,
    symbols: ctx.summaries.map((s) => s.symbol),
    source: "Alpha Vantage TIME_SERIES_DAILY",
    deck_mode: ctx.deckMode,
    visual_style: ctx.visualStyle || "standard",
    cache_used: ctx.cacheNote,
    warnings: ctx.warnings,
    summaries: ctx.summaries.map((s) => ({
      symbol: s.symbol,
      latest_date: s.latest.date,
      close: s.latest.close,
      ret1d: s.ret1d,
      ret5d: s.ret5d,
      ret20d: s.ret20d,
      ret60d: s.ret60d,
      vol20: s.vol20,
      drawdown60: s.drawdown60,
      from_cache: s.fromCache,
    })),
  };
  fs.writeFileSync(out, JSON.stringify(safe, null, 2), "utf8");
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

  const sharp = loadModule("sharp");
  const pptxgen = loadModule("pptxgenjs");
  const fetched = [];
  for (let i = 0; i < args.symbols.length; i += 1) {
    const result = await fetchDaily(args.symbols[i], args);
    fetched.push(result);
    if (result.networkUsed && i < args.symbols.length - 1) await sleep(args.throttleMs);
  }

  const summaries = fetched.map((item) => summarize(item.symbol, parseDailySeries(item.symbol, item.data), item));
  const dataDate = summaries.map((s) => s.latest.date).sort()[0];
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const projectName = args.projectName || `daily-market-${dataDate}`;
  const output = args.output || path.resolve(process.cwd(), "outputs", `${projectName}.pptx`);
  const imagesDir = args.imagesDir || path.resolve(process.cwd(), "assets", "images", projectName);
  ensureDir(imagesDir);
  ensureDir(path.dirname(output));

  const warnings = summaries.map((s) => s.warning).filter(Boolean);
  const ctx = {
    title: args.title,
    dataDate,
    generatedAt,
    summaries,
    narrative: narrativeFor(summaries, args.language),
    warnings,
    cacheNote: summaries.some((s) => s.fromCache),
    notesDir: args.notesDir,
    language: args.language,
    deckMode: args.deckMode,
    durationMinutes: args.durationMinutes,
    visualStyle: args.visualStyle,
  };
  const longDeck = String(args.deckMode).toLowerCase().includes("four") || String(args.deckMode).toLowerCase().includes("extended") || args.durationMinutes >= 180;
  const outlookStyle = String(args.visualStyle).toLowerCase().includes("outlook") || String(args.deckMode).toLowerCase().includes("outlook");
  const slides = outlookStyle ? buildOutlookFourHourSlides(ctx) : longDeck ? buildFourHourSlides(ctx) : buildSlides(ctx);
  const imagePaths = [];
  for (let i = 0; i < slides.length; i += 1) {
    const file = path.join(imagesDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await sharp(Buffer.from(slides[i].svg)).png().toFile(file);
    imagePaths.push(file);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.company = "Slide_Generator";
  pptx.subject = "Daily market brief";
  pptx.title = projectName;
  pptx.lang = String(args.language).toLowerCase().startsWith("th") ? "th-TH" : "en-US";

  slides.forEach((slideData, i) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({ path: imagePaths[i], x: 0, y: 0, w: PPT_W, h: PPT_H });
    if (typeof slide.addNotes === "function") slide.addNotes([slideData.note]);
  });
  await pptx.writeFile({ fileName: output });

  const dataPath = writeData(projectName, ctx);
  const outlinePath = writeOutline(projectName, ctx, slides);
  console.log(`[OK] Wrote ${output}`);
  console.log(`[OK] Wrote ${imagePaths.length} slide images to ${imagesDir}`);
  console.log(`[OK] Wrote ${dataPath}`);
  console.log(`[OK] Wrote ${outlinePath}`);
  console.log(`[OK] Data date ${dataDate}; symbols ${summaries.map((s) => s.symbol).join(", ")}`);
  warnings.forEach((warning) => console.log(`[WARN] ${warning}`));
}

main().catch((err) => {
  console.error(`[ERROR] ${err.stack || err.message}`);
  process.exit(1);
});
