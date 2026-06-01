const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const pptxgen = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_NAME = "hedge-fund-strategy-atlas-cinematic";
const IMG_DIR = path.join(ROOT, "assets", "images", OUT_NAME);
const OUT_DIR = path.join(ROOT, "outputs");
const NOTES_DIR = path.join(ROOT, "notes");
const COVER_SRC = "/Users/nuthdanai/.codex/generated_images/019e5acc-08a5-7e42-9613-5e1275e7745c/ig_01d46a7b125f22b9016a1334e7e5a08191867d49d8d5c50b79.png";

const W = 1920;
const H = 1080;

const C = {
  bg: "#050707",
  bg2: "#0B1211",
  panel: "#101615",
  panel2: "#17201E",
  panel3: "#26302E",
  green: "#69F0AE",
  green2: "#00C853",
  cyan: "#03DAC6",
  amber: "#FFB74D",
  red: "#CF6679",
  text: "#F0F0F0",
  muted: "#A6A6A6",
  low: "#707070",
  line: "rgba(255,255,255,0.10)",
};

const sourceUrls = [
  ["HFR strategy classifications", "https://www.hfr.com/hfr-indices/hfr-hedge-fund-strategy-classifications/"],
  ["HFR 2025 performance note", "https://www.hfr.com/media/market-commentary/hfri-surges-to-strongest-annual-gain-since-2009-as-risks-opportunities-evolve/"],
  ["HFR 2024 performance note", "https://www.hfr.com/media/market-commentary/hedge-funds-gain-in-december-as-hfri-macro-rv-arbitrage-lead-gains-into-2025/"],
  ["HFR 2023 performance note", "https://www.hfr.com/media/performance-notes/hfri-indices-december-2023-performance-notes/"],
  ["HFR 2022 performance note", "https://www.hfr.com/media/performance-notes/hfri-indices-december-2022-performance-notes/"],
  ["HFR 2021 performance note", "https://www.hfr.com/media/performance-notes/hfri-indices-december-2021-performance-notes/"],
  ["Pensions & Investments summary of HFR 2022 returns", "https://youdehaojing.com/most-hfr-hedge-fund-indexes-fall-2022.html"],
  ["Citadel strategies", "https://www.citadel.com/what-we-do/"],
  ["Millennium strategies", "https://www.mlp.com/investment-strategies/"],
  ["Bridgewater research and strategies", "https://www.bridgewater.com/"],
  ["AQR strategies", "https://www.aqr.com/"],
  ["Man AHL", "https://www.man.com/ahl"],
  ["Davidson Kempner strategies", "https://www.davidsonkempner.com/"],
  ["Canyon Partners strategies", "https://www.canyonpartners.com/"],
  ["Saba Capital", "https://www.sabacapital.com/"],
  ["Nephila Capital", "https://www.nephilacapital.com/"],
  ["Fermat Capital", "https://www.fcm.com/"],
  ["Galaxy Asset Management", "https://www.galaxy.com/asset-management/"],
  ["Pantera Capital", "https://panteracapital.com/"],
];

const performance = [
  { name: "HFRI FWC", vals: ["+10.3", "-4.25", "+7.5", "+10.0", "+12.6"], take: "Composite hedge funds recovered from the 2022 rate shock and reached the strongest year since 2009 in 2025." },
  { name: "Equity Hedge", vals: ["+11.7", "-10.4", "+10.4", "+12.3", "+17.3"], take: "Most beta-linked engine: weak in 2022, then led by technology, healthcare, energy and quant-directional exposures." },
  { name: "Event-Driven", vals: ["+13.1", "-5.0", "+10.7", "+8.7", "+11.0"], take: "Best when credit and M&A are improving; 2025 was the strongest year since 2021." },
  { name: "Macro", vals: ["+7.7", "+9.3", "flat+", "+5.95", "+7.2"], take: "The crisis-alpha engine of 2022; less explosive afterward but useful in rate, commodity and geopolitical regimes." },
  { name: "Relative Value", vals: ["+7.6", "-0.9", "+7.2", "steady+", "+7.5"], take: "Lower-volatility carry/spread engine; 2024 total figure not fully public in HFR note, but monthly trend stayed positive." },
  { name: "Crypto HF", vals: ["+215", "-55.1", "+65.8", "+59.8", "volatile"], take: "Specialist high-convexity sleeve: huge beta to digital-asset cycles; not comparable to core diversified hedge fund indices." },
];

const strategies = [
  ["Equity Hedge", "Fundamental long/short equity", "Stock selection, sector views, gross/net exposure", "Viking, Lone Pine, Coatue, Tiger Global, Point72"],
  ["Equity Hedge", "Equity market neutral", "Stock alpha with beta, sector and factor neutralization", "AQR, D. E. Shaw, Two Sigma, Millennium"],
  ["Equity Hedge", "Quantitative directional equity", "Model-driven equity signals with directional exposure", "D. E. Shaw, Qube, Marshall Wace, Man Numeric"],
  ["Equity Hedge", "Statistical arbitrage / pairs", "Short-horizon mean reversion, cross-sectional signals", "Renaissance, Two Sigma, D. E. Shaw, Schonfeld"],
  ["Equity Hedge", "Sector specialists", "Healthcare, technology, energy, financials, consumer", "Citadel, Balyasny, Point72, Millennium"],
  ["Equity Hedge", "Dedicated short / short activist", "Fraud, overvaluation, balance-sheet stress", "Muddy Waters, Kerrisdale, Hindenburg-style activists"],
  ["Equity Hedge", "Emerging-market equity L/S", "Country, governance, currency and liquidity premia", "TT International, Marshall Wace, regional Asia funds"],
  ["Event-Driven", "Merger / risk arbitrage", "Spread between deal price and market price", "Farallon, Davidson Kempner, Millennium, Citadel"],
  ["Event-Driven", "Activist equity", "Governance, capital allocation and strategic change", "Elliott, Pershing Square, TCI, Third Point, Starboard"],
  ["Event-Driven", "Special situations", "Spin-offs, restructurings, recapitalizations, litigation", "Elliott, Farallon, Davidson Kempner, Baupost"],
  ["Event-Driven", "Distressed / restructuring", "Bankruptcy claims, recovery value, capital structure control", "Oaktree, Silver Point, King Street, Canyon"],
  ["Event-Driven", "Credit arbitrage", "Mispriced credit vs equity, CDS, loans or bonds", "Canyon, Saba, Davidson Kempner, Citadel"],
  ["Event-Driven", "SPAC arbitrage", "Trust-value yield, redemption optionality and deal optionality", "Glazer, Magnetar, Polar, Fir Tree"],
  ["Event-Driven", "Litigation / regulatory catalyst", "Court, antitrust, patent or regulatory outcome", "Burford-style specialists, event-driven funds"],
  ["Relative Value", "Convertible arbitrage", "Convertible bond, equity hedge, volatility and credit", "Citadel, Millennium, Advent, Walleye"],
  ["Relative Value", "Fixed income relative value", "Yield-curve, swap spread, bond basis and roll-down", "Capula, Citadel, Millennium, ExodusPoint"],
  ["Relative Value", "Mortgage / asset-backed arbitrage", "Agency MBS, non-agency, ABS and prepayment convexity", "Bracebridge, Ellington, Metacapital"],
  ["Relative Value", "Capital structure arbitrage", "Equity-credit mispricing within same issuer", "Saba, Canyon, Davidson Kempner, Citadel"],
  ["Relative Value", "Volatility arbitrage", "Implied vs realized vol, skew, dispersion, options carry", "Capstone, 36 South, Artemis, volatility pods"],
  ["Relative Value", "ETF / index arbitrage", "Creation-redemption, index rebalance and basket dislocations", "Jane Street-style trading firms, quant pods"],
  ["Relative Value", "Yield alternatives", "Income, carry and alternative yield premia", "Relative-value credit and structured-credit funds"],
  ["Macro", "Discretionary global macro", "Rates, FX, equity index, commodities and policy regimes", "Bridgewater, Brevan Howard, Tudor, Rokos, Caxton"],
  ["Macro", "Systematic CTA / trend following", "Time-series momentum across futures markets", "Man AHL, Winton, Aspect, Systematica, Graham"],
  ["Macro", "Commodity macro", "Energy, metals, agriculture, weather and inventory cycles", "Citadel Commodities, Balyasny, Castleton, Andurand"],
  ["Macro", "Currency macro", "FX carry, valuation, policy divergence and balance of payments", "Brevan Howard, Tudor, Rokos, macro pods"],
  ["Macro", "Rates macro", "Central-bank policy, curve shape, inflation and term premia", "Rokos, Capula, Brevan Howard, BlueCrest"],
  ["Macro", "Active trading / tactical macro", "Short-horizon cross-asset trading", "Pod-shop macro teams, Graham, Tudor"],
  ["Multi-Strategy", "Multi-manager pod shop", "Capital allocated to many low-correlation PM teams", "Citadel, Millennium, Balyasny, Point72, Schonfeld"],
  ["Multi-Strategy", "Internal multi-strategy", "Firm-level blend of equity, macro, credit, quant and RV", "D. E. Shaw, Farallon, Davidson Kempner"],
  ["Credit", "Long/short credit", "Bond, loan and CDS security selection", "Saba, Canyon, Diameter, Anchorage"],
  ["Credit", "Structured credit", "CLO, RMBS, ABS and bespoke securitization exposures", "Ellington, Metacapital, LibreMax, Pine River alumni"],
  ["Credit", "Direct lending / private credit hedge", "Illiquidity premium, covenants and downside control", "Ares, Apollo, HPS, Oaktree credit arms"],
  ["Specialist", "Insurance-linked securities", "Cat bonds, reinsurance risk and natural catastrophe premia", "Nephila, Fermat, Leadenhall, Elementum"],
  ["Specialist", "Digital assets / crypto", "Token beta, market neutral, DeFi, venture and basis trades", "Pantera, Galaxy, Multicoin, BH Digital, Polychain"],
  ["Specialist", "Risk premia / alternative beta", "Systematic carry, momentum, value, defensive and vol premia", "AQR, Man, BlackRock, JPMorgan AM"],
  ["Specialist", "Tail-risk / crisis protection", "Long volatility, convexity and crash protection", "Universa, 36 South, Artemis, Capstone"],
  ["Specialist", "Fund of hedge funds", "Manager selection, portfolio construction and access", "Blackstone BAAM, UBS O'Connor FoHF, Grosvenor"],
];

const slides = [
  { no: 1, role: "cover", title: "HEDGE FUND STRATEGY ATLAS", subtitle: "Five-year strategy readout and manager map" },
  { no: 2, title: "The hedge fund universe is not one asset class.", subtitle: "It is a toolkit of return engines, each paid by a different market inefficiency." },
  { no: 3, title: "Four HFR pillars anchor the market taxonomy.", subtitle: "Equity Hedge, Event-Driven, Macro and Relative Value explain most institutional hedge fund buckets." },
  { no: 4, title: "Strategy taxonomy: the practical atlas.", subtitle: "The investable universe breaks into directional alpha, event outcomes, spread convergence, macro timing and specialist risk premia." },
  { no: 5, title: "Five-year heatmap: the cycle mattered more than labels.", subtitle: "2021-2025 shows a clean regime story: equity/event strength, 2022 macro defense, and broad 2025 participation." },
  { no: 6, title: "Equity Hedge: strongest five-year comeback engine.", subtitle: "Equity long/short absorbed the 2022 drawdown, then regained leadership through technology, healthcare, energy and quant-directional books." },
  { no: 7, title: "Event-Driven: paid when catalysts clear.", subtitle: "M&A, activism, distressed and special situations recover when financing markets reopen and corporate actions accelerate." },
  { no: 8, title: "Relative Value: steady spread and carry machine.", subtitle: "Less spectacular than equity hedge, but useful when rates, credit curves and volatility surfaces create pricing dislocations." },
  { no: 9, title: "Macro / CTA: portfolio shock absorber.", subtitle: "Macro dominated 2022, then became a more balanced rates, commodities, active trading and trend-following allocation." },
  { no: 10, title: "Multi-strategy pod shops institutionalized capacity.", subtitle: "The model is not a strategy label; it is a capital-allocation machine across many strategy sleeves." },
  { no: 11, title: "Quant and systematic strategies cut across every bucket.", subtitle: "Stat arb, market neutral, trend following and risk premia are implementation methods, not just standalone categories." },
  { no: 12, title: "Credit and distressed strategies monetize balance-sheet stress.", subtitle: "They overlap Event-Driven and Relative Value, but their risk is credit selection, recovery value and liquidity timing." },
  { no: 13, title: "Volatility, tail-risk and options strategies are convexity trades.", subtitle: "They can look expensive in calm markets and essential when correlation spikes." },
  { no: 14, title: "Specialist sleeves expand the hedge fund opportunity set.", subtitle: "Digital assets and insurance-linked securities are high-specificity risk premia, not substitutes for core hedge fund beta." },
  { no: 15, title: "Manager map: who publicly plays where.", subtitle: "Examples are public strategy associations, not recommendations or a complete manager database." },
  { no: 16, title: "Allocator takeaway: choose the role before the manager.", subtitle: "The last five years rewarded portfolios that combined growth alpha, catalyst alpha, crisis alpha and carry alpha." },
  { no: 17, title: "Research appendix: strategy inventory.", subtitle: "A broad practical list of strategy sleeves found across hedge fund platforms and specialists." },
  { no: 18, title: "Sources and methodology.", subtitle: "Annual figures are rounded from public HFR notes. Manager examples use public firm materials and market taxonomy." },
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[m]));
}

function wrap(value, max = 46) {
  const out = [];
  String(value).split("\n").forEach((part) => {
    let line = "";
    part.split(/\s+/).filter(Boolean).forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > max && line) {
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

function text(value, x, y, size, opts = {}) {
  const {
    fill = C.text,
    weight = 600,
    max = 46,
    lh = 1.15,
    family = "Arial, Helvetica, sans-serif",
    anchor = "start",
    opacity = 1,
  } = opts;
  const lines = wrap(value, max);
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${family}" text-anchor="${anchor}" opacity="${opacity}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function mono(value, x, y, size = 20, fill = C.green, weight = 700, anchor = "start") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Menlo, Consolas, monospace" text-anchor="${anchor}">${esc(value)}</text>`;
}

function rect(x, y, w, h, fill, stroke = "none", sw = 0, rx = 0, extra = "") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function line(x1, y1, x2, y2, color = C.line, sw = 1, extra = "") {
  return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${sw}" fill="none" ${extra}/>`;
}

function pill(label, x, y, color = C.green, w = 190) {
  return `<g>${rect(x, y, w, 42, "rgba(105,240,174,0.10)", color, 1.5, 18)}${mono(label, x + w / 2, y + 27, 17, color, 800, "middle")}</g>`;
}

function base(slide) {
  const n = String(slide.no).padStart(2, "0");
  const titleLines = wrap(slide.title, 40).length;
  const subtitleY = 188 + Math.min(titleLines, 2) * 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#020303"/><stop offset="0.48" stop-color="${C.bg2}"/><stop offset="1" stop-color="#050606"/>
    </linearGradient>
    <radialGradient id="spot" cx="50%" cy="0%" r="80%">
      <stop stop-color="${C.cyan}" stop-opacity="0.22"/><stop offset="0.42" stop-color="${C.green}" stop-opacity="0.10"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sideGlow" cx="88%" cy="44%" r="58%">
      <stop stop-color="${C.green}" stop-opacity="0.18"/><stop offset="0.45" stop-color="${C.cyan}" stop-opacity="0.08"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="stage" x1="0" x2="1" y1="0" y2="0">
      <stop stop-color="#050707"/><stop offset="0.5" stop-color="#16211F"/><stop offset="1" stop-color="#050707"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="28"/></filter>
  </defs>
  ${rect(0, 0, W, H, "url(#bg)")}
  ${rect(0, 0, W, H, "url(#spot)")}
  ${rect(0, 0, W, H, "url(#sideGlow)")}
  <path d="M-40 164 C420 78 1440 78 1960 164 L1960 816 C1410 900 460 900 -40 816 Z" fill="rgba(3,218,198,0.035)" stroke="rgba(3,218,198,0.20)" stroke-width="2"/>
  <path d="M0 820 C520 884 1320 884 1920 820 L1920 1080 L0 1080 Z" fill="url(#stage)" opacity="0.74"/>
  <ellipse cx="960" cy="952" rx="740" ry="86" fill="rgba(105,240,174,0.10)" filter="url(#blur)"/>
  <g opacity="0.38">${Array.from({ length: 23 }, (_, i) => line(20 + i * 86, 142, -90 + i * 96, 840, "rgba(255,255,255,0.040)")).join("")}</g>
  <g opacity="0.35">${Array.from({ length: 11 }, (_, i) => line(0, 190 + i * 66, W, 150 + i * 62, "rgba(105,240,174,0.050)")).join("")}</g>
  <path d="M1120 430 C1240 344 1324 530 1430 448 S1628 372 1768 502" stroke="rgba(105,240,174,0.42)" stroke-width="3" fill="none"/>
  <path d="M1070 620 C1218 570 1350 688 1492 622 S1692 560 1810 646" stroke="rgba(3,218,198,0.28)" stroke-width="2" fill="none"/>
  <g opacity="0.42">${Array.from({ length: 72 }, (_, i) => `<circle cx="${1050 + (i % 18) * 45}" cy="${255 + Math.floor(i / 18) * 34}" r="${i % 7 === 0 ? 2.8 : 1.7}" fill="${i % 9 === 0 ? C.amber : C.green}"/>`).join("")}</g>
  ${rect(0, 0, W, 92, "rgba(0,0,0,0.55)")}
  ${line(0, 92, W, 92, "rgba(105,240,174,0.26)", 2)}
  ${rect(0, 1004, W, 76, "rgba(0,0,0,0.72)")}
  ${line(0, 1004, W, 1004, "rgba(255,183,77,0.18)", 2)}
  ${mono(`QUANTSERAS EVENT RESEARCH / ${n} / ${String(slides.length).padStart(2, "0")}`, 80, 56, 18, C.green)}
  ${mono("CINEMATIC EDITION", 1515, 56, 16, C.amber)}
  ${text(slide.title, 82, 162, 58, { fill: C.text, weight: 900, max: 40, lh: 1.00, family: "Arial Narrow, Arial Black, Arial, sans-serif" })}
  ${text(slide.subtitle, 86, subtitleY, 25, { fill: C.muted, weight: 520, max: 82, lh: 1.22 })}
  ${text("Sources: HFR public notes; firm public materials; manager examples are illustrative.", 80, 1048, 17, { fill: C.low, weight: 450, max: 110 })}
  ${mono("STRATEGY ATLAS / EVENT READY", 1590, 1048, 16, C.low)}
`;
}

function end() {
  return "</svg>";
}

function panel(x, y, w, h, title, body, color = C.green) {
  return `<g>
    ${rect(x, y, w, h, "rgba(8,14,13,0.78)", "rgba(255,255,255,0.13)", 1.2, 18)}
    ${rect(x + 1, y + 1, w - 2, 46, "rgba(255,255,255,0.040)", "none", 0, 18)}
    ${rect(x, y, 7, h, color, "none", 0, 5)}
    ${line(x + 24, y + 66, x + w - 28, y + 66, "rgba(105,240,174,0.18)", 1)}
    ${text(title, x + 28, y + 48, 28, { fill: color, weight: 850, max: 28 })}
    ${text(body, x + 28, y + 106, 24, { fill: C.text, weight: 560, max: Math.floor(w / 13), lh: 1.16 })}
  </g>`;
}

function smallCard(x, y, w, h, title, body, color = C.green) {
  return `<g>
    ${rect(x, y, w, h, "rgba(7,12,12,0.78)", "rgba(255,255,255,0.13)", 1.2, 14)}
    ${rect(x, y, w, 5, color, "none", 0, 4)}
    ${mono(title, x + 24, y + 36, 18, color)}
    ${text(body, x + 24, y + 78, 21, { fill: C.text, weight: 540, max: Math.floor(w / 12), lh: 1.18 })}
  </g>`;
}

function heatColor(value) {
  if (value.includes("-55") || value.includes("-10") || value.includes("-5")) return "rgba(207,102,121,0.34)";
  if (value.includes("-4") || value.includes("-0")) return "rgba(207,102,121,0.18)";
  if (value.includes("flat") || value.includes("steady") || value.includes("volatile")) return "rgba(255,255,255,0.08)";
  if (value.includes("+215") || value.includes("+65") || value.includes("+59")) return "rgba(255,183,77,0.40)";
  if (value.includes("+17") || value.includes("+13") || value.includes("+12") || value.includes("+11")) return "rgba(105,240,174,0.35)";
  if (value.includes("+10") || value.includes("+9") || value.includes("+8") || value.includes("+7")) return "rgba(3,218,198,0.25)";
  return "rgba(105,240,174,0.16)";
}

function slide02(slide) {
  let s = base(slide);
  const cards = [
    ["Directional alpha", "Long/short equity, sector books, growth/value and emerging-market equity risk.", C.green],
    ["Event alpha", "M&A, activism, distressed, special situations and legal/regulatory outcomes.", C.amber],
    ["Macro timing", "Rates, FX, commodities and futures trend systems that can profit from regime breaks.", C.cyan],
    ["Spread convergence", "Relative value, convertibles, fixed income RV, volatility and capital structure arb.", C.green],
    ["Specialist premia", "Crypto, ILS, tail risk, risk premia, private credit and niche capacity sleeves.", C.amber],
  ];
  cards.forEach((c, i) => {
    const x = 90 + (i % 3) * 590;
    const y = 355 + Math.floor(i / 3) * 245;
    s += smallCard(x, y, i < 3 ? 520 : 800, 170, c[0], c[1], c[2]);
  });
  s += `<g transform="translate(1290,620)">
    ${rect(0, 0, 500, 250, "rgba(36,36,36,0.70)", "rgba(105,240,174,0.30)", 1.5, 18)}
    ${mono("FIVE-YEAR READOUT", 34, 46, 18, C.green)}
    ${text("Best core engine in 2025: Equity Hedge +17.3%. Best crisis engine in 2022: Macro +9.3%. Specialist crypto was extreme both ways.", 34, 94, 24, { fill: C.text, weight: 650, max: 31, lh: 1.18 })}
  </g>`;
  return s + end();
}

function slide03(slide) {
  let s = base(slide);
  const pillars = [
    ["EQUITY HEDGE", "Long/short equity, market neutral, sector, fundamental, quantitative, short bias.", C.green],
    ["EVENT-DRIVEN", "Merger arb, activist, distressed, special sits, credit arb, SPAC, litigation.", C.amber],
    ["MACRO", "Discretionary global macro, CTA trend, rates, FX, commodities, active trading.", C.cyan],
    ["RELATIVE VALUE", "Convertibles, fixed income RV, mortgage/ABS, volatility, capital structure, ETF/index arb.", C.green],
  ];
  pillars.forEach((p, i) => {
    const x = 120 + i * 445;
    s += panel(x, 360, 390, 370, p[0], p[1], p[2]);
    if (i < pillars.length - 1) s += line(x + 410, 545, x + 432, 545, "rgba(105,240,174,0.35)", 3);
  });
  s += `${rect(120, 805, 1680, 100, "rgba(36,36,36,0.72)", "rgba(255,255,255,0.10)", 1.2, 14)}
    ${text("Practical rule: classify the primary return driver, then tag implementation style. A strategy can be discretionary or systematic, single-manager or pod, liquid or illiquid.", 152, 860, 25, { fill: C.text, max: 110, weight: 600 })}`;
  return s + end();
}

function slide04(slide) {
  let s = base(slide);
  const buckets = [
    ["Directional", "Fundamental L/S, long-biased, short bias, sector specialists, EM equity L/S"],
    ["Market neutral", "Equity market neutral, stat arb, pairs, factor neutral, quant equity"],
    ["Event", "Merger arb, activist, special sits, distressed, SPAC, litigation"],
    ["Credit", "L/S credit, distressed, structured credit, direct lending, capital structure"],
    ["RV / Arbitrage", "Convertibles, FI RV, MBS/ABS, volatility, ETF/index, basis trades"],
    ["Macro / CTA", "Global macro, trend following, rates, FX, commodity, active trading"],
    ["Specialist", "Crypto, ILS, tail risk, risk premia, funds of funds, niche real assets"],
  ];
  buckets.forEach((b, i) => {
    const x = 100 + (i % 2) * 875;
    const y = 335 + Math.floor(i / 2) * 145;
    s += smallCard(x, y, 805, 108, b[0], b[1], [C.green, C.cyan, C.amber, C.red][i % 4]);
  });
  return s + end();
}

function slide05(slide) {
  let s = base(slide);
  const years = ["2021", "2022", "2023", "2024", "2025"];
  const x0 = 315, y0 = 420, cw = 166, ch = 70;
  years.forEach((yr, i) => {
    s += rect(x0 + i * cw, y0 - 68, cw - 10, 44, "rgba(105,240,174,0.10)", "rgba(105,240,174,0.26)", 1, 8);
    s += mono(yr, x0 + i * cw + 78, y0 - 39, 18, C.green, 800, "middle");
  });
  performance.forEach((row, r) => {
    const y = y0 + r * ch;
    s += text(row.name, 94, y + 43, 22, { fill: C.text, weight: 800, max: 16 });
    row.vals.forEach((v, i) => {
      const x = x0 + i * cw;
      s += rect(x, y, cw - 10, ch - 12, heatColor(v), "rgba(255,255,255,0.12)", 1, 8);
      s += mono(v, x + (cw - 10) / 2, y + 38, 22, C.text, 800, "middle");
    });
    s += text(row.take, 1188, y + 24, 18, { fill: C.muted, weight: 500, max: 51, lh: 1.10 });
  });
  s += `${text("Public-source caveat: selected cells use secondary HFR reporting or qualitative public-note language where a release does not state a full-year total figure.", 94, 930, 17, { fill: C.low, max: 102 })}
        ${pill("GREEN = STRONG", 1215, 880, C.green, 195)}
        ${pill("RED = STRESS", 1430, 880, C.red, 180)}
        ${pill("AMBER = HIGH VOL", 1630, 880, C.amber, 190)}`;
  return s + end();
}

function readoutSlide(slide, meta) {
  let s = base(slide);
  s += panel(100, 350, 520, 460, "5-YEAR SHAPE", meta.shape, meta.color);
  s += smallCard(675, 350, 520, 205, "WHO USES IT", meta.managers, C.green);
  s += smallCard(675, 595, 520, 215, "SUB-STRATEGIES", meta.subs, C.cyan);
  s += smallCard(1250, 350, 520, 205, "WHAT WORKED", meta.worked, C.amber);
  s += smallCard(1250, 595, 520, 215, "WATCHOUT", meta.risk, C.red);
  return s + end();
}

function slide10(slide) {
  let s = base(slide);
  const rows = [
    ["Model", "Dozens to hundreds of PM teams with tight risk budgets and centralized treasury, tech, data and execution."],
    ["Strategy mix", "Equity L/S, RV, macro, credit, commodities, quant, convertibles, event and specialist pods."],
    ["Public examples", "Citadel, Millennium, Balyasny, Point72, Schonfeld, ExodusPoint, Verition."],
    ["2025 signal", "HFRI Multi-Manager/Pod Shop Index: +9.7% for 2025; the index is new, so no true five-year public track record."],
  ];
  rows.forEach((r, i) => s += smallCard(120, 335 + i * 132, 790, 100, r[0], r[1], [C.green, C.cyan, C.amber, C.green][i]));
  s += `<g transform="translate(1050,365)">
    ${rect(0, 0, 640, 390, "rgba(29,29,29,0.70)", "rgba(255,255,255,0.12)", 1.2, 18)}
    ${mono("CAPITAL ALLOCATION ENGINE", 42, 52, 19, C.green)}
    ${["PM pods", "Risk limits", "Data stack", "Execution", "Central treasury", "Capital rebalancing"].map((label, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      const x = 320 + Math.cos(angle) * 215;
      const y = 215 + Math.sin(angle) * 125;
      return `${line(320, 210, x, y, "rgba(105,240,174,0.28)", 2)}<circle cx="${x}" cy="${y}" r="42" fill="rgba(105,240,174,0.12)" stroke="${C.green}" stroke-width="2"/><text x="${x}" y="${y + 6}" text-anchor="middle" fill="${C.text}" font-size="18" font-weight="700" font-family="Arial">${esc(label)}</text>`;
    }).join("")}
    <circle cx="320" cy="210" r="58" fill="rgba(3,218,198,0.18)" stroke="${C.cyan}" stroke-width="2"/>
    ${mono("CIO", 320, 217, 25, C.cyan, 900, "middle")}
  </g>`;
  return s + end();
}

function slide11(slide) {
  let s = base(slide);
  const items = [
    ["Stat arb", "Short-horizon mean reversion, pairs, microstructure and cross-sectional signals."],
    ["Equity market neutral", "Stock alpha with explicit beta, sector and factor neutralization."],
    ["Systematic trend", "Time-series momentum across futures; works best in persistent macro moves."],
    ["Alternative risk premia", "Transparent factor premia such as value, carry, momentum, defensive and volatility."],
    ["ML / data science", "Feature extraction, NLP, alternative data and execution optimization."],
    ["Quantamental", "Fundamental PM process enhanced by screens, data and systematic risk controls."],
  ];
  items.forEach((it, i) => {
    const x = 105 + (i % 3) * 585;
    const y = 335 + Math.floor(i / 3) * 235;
    s += smallCard(x, y, 510, 175, it[0], it[1], [C.green, C.cyan, C.amber][i % 3]);
  });
  s += text("Public examples: AQR, D. E. Shaw, Two Sigma, Renaissance, Man AHL, Winton, Aspect, Qube, Marshall Wace and pod-shop quant teams.", 110, 855, 24, { fill: C.text, weight: 650, max: 120 });
  return s + end();
}

function slide12(slide) {
  return readoutSlide(slide, {
    color: C.amber,
    shape: "Credit and distressed were stress-sensitive across 2021-2025: constructive in reopening years, hurt by spread widening and financing stress in 2022, then supported by higher yields and restructuring opportunity.",
    managers: "Oaktree, Silver Point, King Street, Canyon, Davidson Kempner, Saba, Diameter, Anchorage, Apollo and Ares credit arms.",
    subs: "L/S credit, credit arb, distressed debt, restructuring, capital structure arb, structured credit, private credit and direct lending.",
    worked: "Higher coupons improved carry after rates reset; distressed/restructuring opportunity grows when refinancing windows narrow.",
    risk: "Liquidity marks, crowded capital structures, legal timing, documentation and refinancing risk can dominate reported returns.",
  });
}

function slide13(slide) {
  return readoutSlide(slide, {
    color: C.cyan,
    shape: "Options and volatility strategies earned different payoffs: short-vol and dispersion can harvest carry, while long-vol and tail-risk lose carry until stress regimes pay.",
    managers: "Capstone, 36 South, Artemis, Universa, volatility pods inside Citadel, Millennium and Balyasny-style platforms.",
    subs: "Volatility arbitrage, dispersion, variance swaps, equity index options, rates options, tail-risk hedging and crisis convexity.",
    worked: "2022 and episodic volatility spikes helped convex strategies; calm periods favored carry and dispersion books.",
    risk: "Path dependency, bleed, liquidity gaps, margin, model risk and wrong-way correlation in severe stress.",
  });
}

function slide14(slide) {
  let s = base(slide);
  const cols = [
    ["Digital assets", "Pantera, Galaxy, Multicoin, BH Digital, Polychain", "Public HFR crypto index: +215% in 2021, -55.1% in 2022, +65.8% in 2023, +59.8% in 2024."],
    ["Insurance-linked securities", "Nephila, Fermat, Leadenhall, Elementum", "Return driver is catastrophe risk premium; correlation to equities/rates can be low, but event loss is lumpy."],
    ["Tail-risk / convexity", "Universa, 36 South, Artemis, Capstone", "Useful as portfolio insurance, but expected carry cost is the price of crisis liquidity."],
  ];
  cols.forEach((c, i) => s += panel(125 + i * 590, 350, 515, 455, c[0], `${c[1]}\n\n${c[2]}`, [C.amber, C.green, C.cyan][i]));
  return s + end();
}

function slide15(slide) {
  let s = base(slide);
  const map = [
    ["Citadel", "Multi-strategy, equity, macro, credit, commodities, quant"],
    ["Millennium", "Multi-manager pods, equity, RV, macro, commodities"],
    ["D. E. Shaw", "Quant, multi-strategy, equity, RV, systematic"],
    ["Bridgewater", "Global macro, systematic macro, risk-balanced research"],
    ["AQR", "Market neutral, managed futures, risk premia, macro"],
    ["Man AHL", "Systematic trend, quant, managed futures"],
    ["Elliott", "Activist, event-driven, distressed and special situations"],
    ["Davidson Kempner", "Event-driven, distressed, merger arb, credit"],
    ["Canyon / Saba", "Credit, distressed, relative value, capital structure"],
    ["Pantera / Galaxy", "Digital assets, liquid tokens, venture, market neutral"],
    ["Nephila / Fermat", "Insurance-linked securities and catastrophe bonds"],
    ["Capstone / 36 South", "Volatility, options and tail-risk strategies"],
  ];
  map.forEach((m, i) => {
    const x = 95 + (i % 3) * 585;
    const y = 315 + Math.floor(i / 3) * 145;
    s += smallCard(x, y, 515, 106, m[0], m[1], [C.green, C.cyan, C.amber][i % 3]);
  });
  return s + end();
}

function slide16(slide) {
  let s = base(slide);
  const roles = [
    ["Growth alpha", "Equity Hedge, sector L/S, quant directional", "2025 leader"],
    ["Catalyst alpha", "Event-driven, activist, merger arb, special sits", "reopening / M&A"],
    ["Crisis alpha", "Macro, CTA, long vol, tail risk", "2022 defense"],
    ["Carry alpha", "RV, credit, structured credit, ILS", "income / spreads"],
  ];
  roles.forEach((r, i) => {
    const x = 130 + i * 430;
    s += panel(x, 345, 370, 350, r[0], `${r[1]}\n\nRole: ${r[2]}`, [C.green, C.amber, C.cyan, C.green][i]);
  });
  s += `${rect(180, 780, 1560, 100, "rgba(36,36,36,0.70)", "rgba(105,240,174,0.22)", 1.2, 14)}
    ${text("A robust hedge fund allocation is less about finding one winning label and more about combining uncorrelated payoff shapes across market regimes.", 220, 842, 28, { fill: C.text, weight: 800, max: 100 })}`;
  return s + end();
}

function slide17(slide) {
  let s = base(slide);
  const shown = strategies.slice(0, 28);
  shown.forEach((row, i) => {
    const x = 80 + (i % 2) * 880;
    const y = 310 + Math.floor(i / 2) * 48;
    const color = row[0] === "Equity Hedge" ? C.green : row[0] === "Event-Driven" ? C.amber : row[0] === "Relative Value" ? C.cyan : row[0] === "Macro" ? C.green : C.red;
    s += rect(x, y, 830, 38, "rgba(29,29,29,0.72)", "rgba(255,255,255,0.08)", 0.8, 6);
    s += mono(row[0].slice(0, 14), x + 16, y + 25, 13, color);
    s += text(row[1], x + 165, y + 25, 17, { fill: C.text, weight: 700, max: 38 });
  });
  s += text("Full inventory and manager examples are written in the research note.", 90, 982, 20, { fill: C.muted, weight: 600, max: 80 });
  return s + end();
}

function slide18(slide) {
  let s = base(slide);
  const notes = [
    ["Return window", "Calendar years 2021-2025. 2025 figures are HFR estimates posted January 8, 2026."],
    ["Benchmark discipline", "HFRI Total indices used where public. Some composite/proxy cells are marked when the public release does not state the exact total figure."],
    ["Manager examples", "Publicly associated examples only. They are not recommendations, rankings or proof of current portfolio positions."],
    ["Research limitation", "Sub-strategy data is uneven in public releases; deck emphasizes strategy direction and regime behavior over false precision."],
  ];
  notes.forEach((n, i) => {
    const x = 100 + (i % 2) * 860;
    const y = 330 + Math.floor(i / 2) * 190;
    s += smallCard(x, y, 785, 140, n[0], n[1], [C.green, C.cyan, C.amber, C.red][i]);
  });
  sourceUrls.slice(0, 10).forEach((src, i) => {
    const x = 120 + (i % 2) * 860;
    const y = 770 + Math.floor(i / 2) * 38;
    s += mono(`${i + 1}. ${src[0]}`, x, y, 15, C.muted, 600);
  });
  return s + end();
}

function renderSlide(slide) {
  if (slide.no === 2) return slide02(slide);
  if (slide.no === 3) return slide03(slide);
  if (slide.no === 4) return slide04(slide);
  if (slide.no === 5) return slide05(slide);
  if (slide.no === 6) return readoutSlide(slide, {
    color: C.green,
    shape: "2021 strong, 2022 stress, 2023-2025 recovery. 2025 was the clear leader: HFRI Equity Hedge +17.3%, supported by healthcare, energy, AI/technology and quant directional exposure.",
    managers: "Viking, Lone Pine, Coatue, Tiger Global, Marshall Wace, Point72, Citadel, Millennium and Balyasny-style sector pods.",
    subs: "Fundamental L/S, market neutral, stat arb, quant directional, sector, short bias and emerging-market equity L/S.",
    worked: "Stock dispersion, AI infrastructure, healthcare rebound, energy/materials and stronger short alpha after the 2022 reset.",
    risk: "Crowded growth, factor shocks, net exposure drift, borrow cost, short squeezes and high correlation during risk-off moves.",
  });
  if (slide.no === 7) return readoutSlide(slide, {
    color: C.amber,
    shape: "Event-Driven led in 2021, sold off in 2022 as financing tightened, rebounded in 2023-2025 with activism, special situations and M&A expectations.",
    managers: "Elliott, Pershing Square, Third Point, TCI, Starboard, Farallon, Davidson Kempner, Canyon and Baupost.",
    subs: "Merger arb, activist, distressed/restructuring, special situations, credit arbitrage, SPAC and litigation/regulatory catalysts.",
    worked: "Activist was a leader in 2021 and 2023; multi-strategy event books led in 2024; 2025 gained on stronger M&A expectations.",
    risk: "Deal breaks, antitrust, financing cost, crowded target spreads, legal timing and liquidity gaps in distressed debt.",
  });
  if (slide.no === 8) return readoutSlide(slide, {
    color: C.cyan,
    shape: "Relative Value was a steadier engine: modest 2022 resilience, +7.2% in 2023 and +7.5% in 2025. 2024 public note highlighted a long positive monthly streak, but not the full total index return.",
    managers: "Citadel, Millennium, D. E. Shaw, Capula, ExodusPoint, Verition, Saba, Bracebridge, Ellington and Walleye.",
    subs: "Convertible arb, fixed income RV, mortgage/ABS, capital structure arb, volatility arb, ETF/index arb and yield alternatives.",
    worked: "Convertible arb led RV in 2025; FI sovereign led in 2023; yield alternatives led RV sub-strategies in 2021 and 2024.",
    risk: "Leverage, repo funding, basis blowouts, liquidity spirals, model error and hidden short-vol exposure.",
  });
  if (slide.no === 9) return readoutSlide(slide, {
    color: C.green,
    shape: "Macro was the standout in 2022 as inflation, rates and commodities trended. 2023 was choppier, then 2024-2025 delivered positive but less explosive gains.",
    managers: "Bridgewater, Brevan Howard, Tudor, Rokos, Caxton, Graham, Man AHL, Winton, Aspect, Systematica and macro pod teams.",
    subs: "Discretionary global macro, CTA/systematic trend, rates, FX, commodity macro, active trading and multi-strategy macro.",
    worked: "Commodity macro and trend following dominated 2022; macro commodity and systematic diversified books helped in late 2025.",
    risk: "Trend reversals, central-bank surprises, crowded positioning, leverage, model decay and policy whipsaw.",
  });
  if (slide.no === 10) return slide10(slide);
  if (slide.no === 11) return slide11(slide);
  if (slide.no === 12) return slide12(slide);
  if (slide.no === 13) return slide13(slide);
  if (slide.no === 14) return slide14(slide);
  if (slide.no === 15) return slide15(slide);
  if (slide.no === 16) return slide16(slide);
  if (slide.no === 17) return slide17(slide);
  if (slide.no === 18) return slide18(slide);
  return base(slide) + end();
}

function researchNote() {
  const lines = [];
  lines.push("# Hedge Fund Strategy Atlas - Research Note", "");
  lines.push("Language: English");
  lines.push("Design system: 01 - QuantSeras Design System");
  lines.push("Window: calendar years 2021-2025. The current date is 2026-05-24, so 2021-2025 is the latest complete five-year calendar window.", "");
  lines.push("## Executive Summary", "");
  lines.push("- Hedge funds are not one asset class. They are a set of return engines: directional alpha, catalyst/event alpha, spread convergence, macro timing, credit/liquidity premium, convexity and specialist risk premia.");
  lines.push("- Equity Hedge was the strongest broad strategy in 2025 (+17.3%) after a difficult 2022 and benefited from healthcare, energy, technology/AI and quant directional dispersion.");
  lines.push("- Macro was the 2022 shock absorber (+9.3% HFRI Macro Total) when inflation, rates and commodities trended. It stayed positive in 2024-2025 but was less dominant.");
  lines.push("- Event-Driven tracks the corporate-action cycle: strong in 2021, weak in 2022, then positive in 2023-2025 as M&A, activism and special situations improved.");
  lines.push("- Relative Value is the steadier spread/carry engine. Public HFR notes show +7.2% in 2023 and +7.5% in 2025, while 2024 notes stress monthly consistency and sub-strategy leadership rather than the exact total annual number.");
  lines.push("- Specialist sleeves such as crypto and ILS are not substitutes for core hedge fund exposure. Crypto hedge fund indices show extreme path dependency: +215% in 2021, -55.1% in 2022, +65.8% in 2023 and +59.8% in 2024.", "");
  lines.push("## 5-Year Broad Strategy Readout", "");
  lines.push("| Strategy proxy | 2021 | 2022 | 2023 | 2024 | 2025 | Readout |");
  lines.push("|---|---:|---:|---:|---:|---:|---|");
  performance.forEach((row) => {
    lines.push(`| ${row.name} | ${row.vals.join(" | ")} | ${row.take} |`);
  });
  lines.push("");
  lines.push("Notes: values are rounded from HFR public notes and secondary HFR reporting where needed. Qualitative cells are used where a public note states direction/sub-strategy leadership but not the exact full-year total figure.");
  lines.push("", "## Strategy Inventory and Public Manager Examples", "");
  lines.push("| Family | Strategy | Return driver | Public examples |");
  lines.push("|---|---|---|---|");
  strategies.forEach((row) => lines.push(`| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} |`));
  lines.push("", "## Strategy-by-Strategy Notes", "");
  lines.push("### Equity Hedge");
  lines.push("Equity Hedge includes fundamental long/short, market neutral, quantitative directional, sector specialist, short bias and emerging-market equity strategies. It tends to perform best when single-name dispersion is high and equity markets are constructive enough for long alpha to compound. The 2021-2025 path was cyclical: strong 2021, drawdown in 2022, then recovery in 2023-2025 with 2025 leadership.");
  lines.push("");
  lines.push("### Event-Driven");
  lines.push("Event-Driven strategies trade corporate catalysts: M&A, activism, spin-offs, distressed restructurings, credit events, SPACs and litigation. The strategy is sensitive to financing conditions, antitrust/regulatory uncertainty and credit spreads. It was strong in 2021, weak in 2022, and positive from 2023-2025.");
  lines.push("");
  lines.push("### Relative Value");
  lines.push("Relative Value strategies trade spread convergence: convertibles, fixed income RV, mortgages/ABS, capital structure, volatility, ETF/index and yield alternatives. The five-year readout is steadier than directional equity, with lower headline upside but a useful role as carry/spread alpha.");
  lines.push("");
  lines.push("### Macro and CTA");
  lines.push("Macro and CTA strategies trade rates, FX, commodities, equity indices and futures. They can be discretionary or systematic. The 2022 inflation/rate shock was the cleanest recent example of macro's crisis-alpha role, while 2023 was choppier and 2024-2025 were positive but more balanced.");
  lines.push("");
  lines.push("### Multi-Strategy / Pod Shops");
  lines.push("Multi-strategy pod shops are best understood as capital-allocation platforms rather than a single strategy. They combine many PM teams with centralized risk, treasury, data and execution. Public examples include Citadel, Millennium, Balyasny, Point72, Schonfeld, ExodusPoint and Verition. HFR's Multi-Manager/Pod Shop index is new, so it does not provide a five-year public history, but HFR reported +9.7% for 2025.");
  lines.push("");
  lines.push("### Specialist Sleeves");
  lines.push("Specialist hedge fund sleeves include digital assets, ILS/cat bonds, tail-risk/long volatility, risk premia, fund of funds, structured credit and niche real assets. They can diversify a portfolio, but each has a distinct risk driver and should be sized by payoff role rather than label.");
  lines.push("", "## Source Links", "");
  sourceUrls.forEach((src) => lines.push(`- [${src[0]}](${src[1]})`));
  return lines.join("\n");
}

async function buildContactSheet(imagePaths, outPath) {
  const thumbW = 384;
  const thumbH = 216;
  const cols = 3;
  const rows = Math.ceil(imagePaths.length / cols);
  const composites = [];
  for (let i = 0; i < imagePaths.length; i++) {
    const input = await sharp(imagePaths[i]).resize(thumbW, thumbH, { fit: "cover" }).png().toBuffer();
    composites.push({ input, left: (i % cols) * thumbW, top: Math.floor(i / cols) * thumbH });
  }
  await sharp({ create: { width: cols * thumbW, height: rows * thumbH, channels: 4, background: "#121212" } })
    .composite(composites)
    .png()
    .toFile(outPath);
}

async function main() {
  [IMG_DIR, OUT_DIR, NOTES_DIR].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  const imagePaths = [];
  const coverOut = path.join(IMG_DIR, "slide-01.png");
  await sharp(COVER_SRC).resize(W, H, { fit: "cover" }).png().toFile(coverOut);
  imagePaths.push(coverOut);

  for (const slide of slides.slice(1)) {
    const n = String(slide.no).padStart(2, "0");
    const svg = renderSlide(slide);
    const svgPath = path.join(IMG_DIR, `slide-${n}.svg`);
    const pngPath = path.join(IMG_DIR, `slide-${n}.png`);
    fs.writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    imagePaths.push(pngPath);
  }

  await buildContactSheet(imagePaths, path.join(IMG_DIR, "contact-sheet.png"));

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Slide_Generator";
  pptx.subject = "Hedge fund strategy research, five-year performance and manager map";
  pptx.title = "Hedge Fund Strategy Atlas";
  pptx.company = "QuantSeras";
  pptx.lang = "en-US";
  for (const p of imagePaths) {
    const page = pptx.addSlide();
    page.background = { color: "121212" };
    page.addImage({ path: p, x: 0, y: 0, w: 13.333333, h: 7.5 });
  }
  await pptx.writeFile({ fileName: path.join(OUT_DIR, `${OUT_NAME}.pptx`) });

  fs.writeFileSync(path.join(NOTES_DIR, `${OUT_NAME}-research.md`), researchNote());
  fs.writeFileSync(path.join(NOTES_DIR, `${OUT_NAME}-outline.md`), [
    "# Hedge Fund Strategy Atlas - Slide Outline",
    "",
    ...slides.map((s) => `${String(s.no).padStart(2, "0")}. ${s.title} - ${s.subtitle}`),
    "",
    `PPTX: outputs/${OUT_NAME}.pptx`,
    `Images: assets/images/${OUT_NAME}/slide-01.png ... slide-${String(slides.length).padStart(2, "0")}.png`,
  ].join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
