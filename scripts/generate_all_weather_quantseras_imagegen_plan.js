const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROJECT = "all-weather-risk-parity-quantseras-imagegen";
const NOTES_DIR = path.join(ROOT, "notes");
const PLAN_OUT = path.join(NOTES_DIR, `${PROJECT}-plan.json`);
const OUTLINE_OUT = path.join(NOTES_DIR, `${PROJECT}-outline.md`);

const slides = [
  ["All Weather Strategy (Risk Parity)", "Balance portfolios by risk, not by dollars", ["Macro regimes", "Risk contribution", "Rebalancing discipline"]],
  ["What You Will Learn", "Four ideas for building robust portfolios", ["Macro weather", "Risk budget", "Leverage", "Monitoring"]],
  ["The Core Problem", "Forecasts fail when regimes change", ["Growth surprise", "Inflation surprise", "Portfolio bias"]],
  ["All Weather Mindset", "Prepare for many climates, not one forecast", ["No single bet", "Balanced drivers", "Rules over guesses"]],
  ["Four Macro Climates", "Growth and inflation define the map", ["Boom", "Disinflation", "Stagflation", "Reflation"]],
  ["Traditional 60/40", "Balanced dollars can hide uneven risk", ["60% equities", "40% bonds", "Equity risk dominates"]],
  ["Risk Parity Defined", "Equalize contribution to total portfolio risk", ["Measure risk", "Budget risk", "Rebalance risk"]],
  ["Philosophy vs Toolkit", "All Weather is the idea; risk parity is the method", ["Macro balance", "Covariance math", "Implementation rules"]],
  ["Course Map", "From intuition to implementation", ["Why it exists", "How it works", "Where it fails"]],
  ["Part 1", "Why balance matters", ["Uncertainty", "Diversification", "Economic drivers"]],
  ["Assets Have Weather Bias", "Each asset likes a different climate", ["Equities: growth", "Bonds: disinflation", "Commodities: inflation"]],
  ["Diversification Needs Difference", "Many holdings can share one risk", ["Same driver", "Stress correlation", "Hidden concentration"]],
  ["Choose Risk Sources", "The universe is an investment decision", ["Liquid assets", "Distinct drivers", "Clear role"]],
  ["Low Vol Gets More Capital", "Same risk may require different dollars", ["Higher weight", "Lower volatility", "Equal contribution"]],
  ["Leverage Scales Risk", "Useful tool, real danger", ["Target volatility", "Funding risk", "Hard limits"]],
  ["Part 2", "Risk contribution math", ["Volatility", "Covariance", "Risk budget"]],
  ["Portfolio Volatility", "Risk equals weights plus covariance", ["Weights", "Sigma matrix", "Total volatility"]],
  ["Marginal Risk", "What happens if we add one more dollar?", ["Local impact", "Diversifier", "Crowded risk"]],
  ["Risk Contribution", "Weight times marginal risk", ["RC = w x MRC", "Percent risk", "Sleeve impact"]],
  ["Equal Risk Contribution", "Every sleeve should matter", ["Equal PRC", "Risk budget", "Constraint bands"]],
  ["Inverse Vol Shortcut", "Useful intuition, incomplete model", ["1 / volatility", "Normalize weights", "Check correlation"]],
  ["Two-Asset Example", "Lower volatility can receive more capital", ["Equity vol: 16%", "Bond vol: 8%", "Weights: 33 / 67"]],
  ["Volatility Targeting", "Scale after the weights are set", ["Estimated vol", "Target vol", "Scale factor"]],
  ["Rebalancing Discipline", "Restore the risk budget when markets drift", ["Measure", "Compare", "Trade rules"]],
  ["Part 3", "Assets across regimes", ["Growth", "Rates", "Inflation"]],
  ["Equities", "Growth engine, drawdown driver", ["Earnings", "Risk appetite", "Valuation"]],
  ["Nominal Bonds", "Growth hedge, inflation risk", ["Duration", "Policy rates", "Real yields"]],
  ["Inflation-Linked Bonds", "Defend real purchasing power", ["Inflation link", "Real yield", "Diversifier"]],
  ["Commodities and Gold", "Inflation shock diversifiers", ["Supply shock", "Currency", "Real rates"]],
  ["Cash and Collateral", "Operational resilience matters", ["Liquidity", "Margin", "Rebalance buffer"]],
  ["Credit and Alternatives", "Return can hide equity-like risk", ["Spread risk", "Liquidity", "Beta overlap"]],
  ["Correlations Move", "Diversification is regime-sensitive", ["Stock-bond shift", "Stress co-move", "Model risk"]],
  ["Part 4", "Build the portfolio", ["Define", "Estimate", "Monitor"]],
  ["Step 1: Universe", "Choose liquid, distinct exposures", ["Liquid", "Transparent", "Implementable"]],
  ["Step 2: Volatility", "Estimate with humility", ["Lookback window", "Vol floor", "Vol cap"]],
  ["Step 3: Correlations", "Stress the matrix", ["Covariance", "Regime view", "Stress to one"]],
  ["Step 4: Risk Budget", "Choose roles before weights", ["Equal budget", "Macro budget", "Constraint budget"]],
  ["Step 5: Optimization", "Inspect the answer", ["Economic sense", "Sensitivity", "Max weights"]],
  ["Step 6: Scaling", "Cap leverage and protect liquidity", ["Leverage cap", "Collateral", "De-risk trigger"]],
  ["Step 7: Stress Tests", "Ask what breaks", ["Growth shock", "Inflation shock", "Liquidity shock"]],
  ["Step 8: Monitoring", "Track risk, not just return", ["Risk contribution", "Target vol", "Liquidity buffer"]],
  ["Example Risk Budget", "A teaching portfolio, not advice", ["Growth: 25%", "Deflation: 25%", "Inflation: 40%", "Cash: 10%"]],
  ["Part 5", "Pitfalls and practice", ["Failure modes", "Rules", "Judgment"]],
  ["Growth Shock", "Bonds may hedge equity stress", ["Equities down", "Rates down", "Rebalance rule"]],
  ["Inflation Shock", "Stocks and bonds can fall together", ["Yields up", "Duration loss", "Inflation sleeves"]],
  ["Pitfall: Calm Risk Estimates", "Quiet data can mislead position sizing", ["Low measured vol", "Too much scale", "Use caps"]],
  ["Pitfall: Leverage Risk", "Funding can force bad trades", ["Margin call", "Financing stress", "Liquidity first"]],
  ["Pitfall: Real-World Constraints", "Theory meets limits", ["No leverage", "Tax drag", "Limited instruments"]],
  ["Class Exercise", "Design a risk budget before choosing funds", ["Pick sleeves", "Assign risk", "Write rules"]],
  ["Final Takeaway", "Risk parity is balance, not a safety promise", ["Framework", "Stress test", "Governance"]],
].map(([title, subtitle, callouts], index) => ({
  slide_no: index + 1,
  title,
  subtitle,
  callouts,
}));

const promptBase = `Use case: scientific-educational / productivity-visual
Asset type: ONE single 16:9 finished presentation slide image, dark presentation slide, no mockup frame
Primary request: Create a finished English lesson slide with all text already rendered inside the image. No post-production text overlay.

Design System: QuantSeras (Material Dark + Green)
Colors: background #121212, surfaces #1D1D1D #212121 #242424, primary #69F0AE, primary variant #00C853, secondary #03DAC6, text high rgba(255,255,255,0.87), text medium rgba(255,255,255,0.60), profit #00E676, loss #FF5252, warning #FFB74D. Avoid pure black and avoid purple.
Typography: modern Inter / IBM Plex Sans style for headings, JetBrains Mono style for numbers and matrix/chart labels. High contrast, sharp readable English text.
Composition: premium quant-finance teaching slide, Material dark dashboard aesthetic, 12-column grid, subtle elevated panels, thin green/teal data lines, covariance matrix texture, clean portfolio/risk diagram suited to the slide topic.
Text rules: render only the exact English text specified for this slide; no extra paragraphs, no fake words, no watermark, no logos, no contact sheet, no multiple slides. All text must be large, sharp, aligned, and fully inside safe margins.
Negative: no Thai text, no misspellings, no lorem ipsum, no distorted letters, no tiny unreadable text, no stock photo people, no light theme.`;

const plan = {
  project_name: PROJECT,
  deck_title: "All Weather Strategy (Risk Parity)",
  audience: "Beginner to intermediate investors, finance students, and analysts learning portfolio construction",
  objective: "Teach All Weather and risk parity using short English text embedded directly in generated slide images.",
  language: "English",
  aspect_ratio: "16:9",
  design_system: "QuantSeras Design System",
  imagegen_rule: "Image generator creates all visible slide text; no post-generation text overlay.",
  prompt_base: promptBase,
  slides,
};

fs.mkdirSync(NOTES_DIR, { recursive: true });
fs.writeFileSync(PLAN_OUT, JSON.stringify(plan, null, 2), "utf8");

const outline = [
  "# All Weather Strategy (Risk Parity) — QuantSeras Imagegen Outline",
  "",
  "Design system: QuantSeras Material Dark + Green",
  "Language: English only",
  "Rendering rule: image generator creates final slide images with text already embedded.",
  "",
  ...slides.flatMap((s) => [
    `## ${String(s.slide_no).padStart(2, "0")}. ${s.title}`,
    `Subtitle: ${s.subtitle}`,
    `Callouts: ${s.callouts.join(" | ")}`,
    "",
  ]),
].join("\n");

fs.writeFileSync(OUTLINE_OUT, outline, "utf8");
console.log(`[OK] Wrote ${PLAN_OUT}`);
console.log(`[OK] Wrote ${OUTLINE_OUT}`);
