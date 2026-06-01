const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROJECT = "all-weather-risk-parity-lesson";
const NOTES_DIR = path.join(ROOT, "notes");
const MANIFEST_OUT = path.join(NOTES_DIR, `${PROJECT}-deck.json`);
const REFERENCES_OUT = path.join(NOTES_DIR, `${PROJECT}-references.md`);

const S = {
  education: "Educational synthesis; not investment advice",
  bridgewater: "Bridgewater, The All Weather Story",
  aqrLever: "AQR, Risk Parity: Why We Lever",
  aqrRealWorld: "AQR, Risk Parity, Risk Management and the Real World",
  asness: "Asness, Frazzini, and Pedersen, Leverage Aversion and Risk Parity",
  roncalli: "Roncalli, Introduction to Risk Parity and Budgeting",
};

function slide({
  no,
  role,
  message,
  subtitle,
  support,
  evidence,
  visual = "concept",
  note,
  source = S.education,
  ...extra
}) {
  return {
    slide_no: no,
    role,
    governing_message: message,
    subtitle,
    supporting_points: support,
    evidence,
    visual_type: visual,
    render_mode: "editable",
    speaker_note: note,
    source,
    ...extra,
  };
}

const slides = [
  slide({
    no: 1,
    role: "cover",
    message: "All Weather Strategy (Risk Parity)",
    subtitle: "A 50-slide lesson on balancing portfolios by risk, not by dollars",
    support: [
      "Goal: understand the logic before touching weights",
      "Method: connect macro regimes, asset behavior, and risk budgets",
      "Output: a practical checklist for evaluating a risk parity portfolio",
    ],
    evidence: [
      "All examples are simplified for education",
      "This deck is not investment advice or a product recommendation",
    ],
    visual: "cover",
    note:
      "Open by framing the course as a portfolio construction lesson. The goal is not to sell risk parity, but to understand how the framework thinks about macro uncertainty and risk balance.",
    source: S.bridgewater,
  }),
  slide({
    no: 2,
    role: "learning-outcomes",
    message: "By the end, you should be able to explain risk parity in plain English",
    subtitle: "Four capabilities for a practical investor or analyst",
    support: [
      "Explain why capital weights can hide risk concentration",
      "Read the four-regime All Weather map",
      "Compute and interpret risk contribution",
      "Identify the main implementation and leverage risks",
    ],
    evidence: [
      "Risk parity is a portfolio construction method, not a return forecast",
      "All Weather is a design philosophy built around macro surprises",
    ],
    visual: "roadmap",
    steps: ["Capital vs risk", "Macro regimes", "Risk budget", "Implementation"],
    note:
      "Give learners a clear target. They do not need advanced math to follow the deck, but they should leave knowing why risk contribution matters.",
    source: S.education,
  }),
  slide({
    no: 3,
    role: "problem",
    message: "The real problem is not volatility; it is being wrong about the future",
    subtitle: "Most portfolios implicitly bet on one version of the economy",
    support: [
      "Economic growth can surprise up or down",
      "Inflation can surprise up or down",
      "Asset classes react differently to those surprises",
      "A forecast-heavy portfolio can fail when the regime changes",
    ],
    evidence: [
      "All Weather starts from the idea that surprises are inevitable",
      "The design question is how to avoid needing one forecast to be right",
    ],
    visual: "alert concept",
    note:
      "Use this slide to shift the lesson away from predicting returns. The core issue is robustness when the macro environment moves away from expectations.",
    source: S.bridgewater,
  }),
  slide({
    no: 4,
    role: "concept",
    message: "All Weather asks one question: what portfolio can survive many environments?",
    subtitle: "The answer starts with balance, not prediction",
    support: [
      "Separate beta exposure from alpha skill",
      "Map assets to economic environments",
      "Balance the risk carried by each sleeve",
      "Rebalance when the risk mix drifts",
    ],
    evidence: [
      "Bridgewater describes All Weather as a passive beta allocation framework",
      "The framework was built to reduce dependence on economic forecasts",
    ],
    visual: "target concept",
    note:
      "Make clear that All Weather is not a magic allocation. It is a disciplined way to think about environmental biases in asset classes.",
    source: S.bridgewater,
  }),
  slide({
    no: 5,
    role: "framework",
    message: "The All Weather map has four basic macro climates",
    subtitle: "Growth and inflation surprises create the weather system",
    support: ["Use the table as a mental model, not a precise forecast engine"],
    evidence: ["Different assets have different environmental biases"],
    visual: "table",
    table: [
      ["Macro climate", "Growth surprise", "Inflation surprise", "Typical winners"],
      ["Boom", "Up", "Stable or down", "Equities, credit"],
      ["Disinflation bust", "Down", "Down", "Nominal government bonds"],
      ["Stagflation shock", "Down", "Up", "Inflation-linked bonds, commodities"],
      ["Reflation", "Up", "Up", "Commodities, selected real assets"],
    ],
    note:
      "The table is intentionally simplified. The teaching point is that assets are not just risky or safe; they are exposed to different economic drivers.",
    source: S.bridgewater,
  }),
  slide({
    no: 6,
    role: "problem",
    message: "A 60/40 portfolio can look balanced by dollars while being equity-heavy by risk",
    subtitle: "Capital allocation and risk allocation are different languages",
    support: [
      "Equities usually carry more volatility than high-quality bonds",
      "A smaller equity sleeve can dominate total portfolio movement",
      "Dollar diversification does not guarantee risk diversification",
    ],
    evidence: [
      "AQR highlights that 60/40 can be dominated by equity risk",
      "Risk parity begins by measuring risk contribution instead of only capital weight",
    ],
    visual: "metric-summary",
    metrics: [
      { label: "Traditional view", value: "60/40", note: "capital weights" },
      { label: "Risk view", value: "equity led", note: "typical risk driver" },
      { label: "Lesson", value: "measure risk", note: "before judging balance" },
    ],
    note:
      "Do not claim a universal risk split because it depends on volatility and correlation. The point is the direction: capital weights can mislead.",
    source: S.asness,
  }),
  slide({
    no: 7,
    role: "concept",
    message: "Risk parity changes the unit of diversification from dollars to risk",
    subtitle: "The question becomes: how much does each sleeve matter?",
    support: [
      "Start with asset risk and correlation",
      "Estimate each sleeve's contribution to total portfolio risk",
      "Allocate the risk budget deliberately",
      "Use capital weights as the output, not the starting belief",
    ],
    evidence: [
      "Risk parity targets more balanced risk contributions across assets",
      "Exact parity is one implementation, not the only possible risk budget",
    ],
    visual: "network concept",
    note:
      "This is the core vocabulary switch. Risk parity does not say every asset gets equal dollars; it says each selected risk source should be sized intentionally.",
    source: S.aqrLever,
  }),
  slide({
    no: 8,
    role: "comparison",
    message: "All Weather is the philosophy; risk parity is one construction toolkit",
    subtitle: "They overlap, but they are not identical",
    support: ["Use this distinction to avoid mixing brand history with portfolio math"],
    evidence: ["Bridgewater links All Weather to the risk parity movement"],
    visual: "table",
    table: [
      ["Question", "All Weather", "Risk Parity"],
      ["Core idea", "Balance macro environments", "Balance risk contributions"],
      ["Main input", "Growth and inflation regimes", "Volatility and covariance"],
      ["Output", "Robust strategic beta mix", "Risk-budgeted portfolio weights"],
      ["Main danger", "Regime map too simple", "Risk estimates too fragile"],
    ],
    note:
      "The table helps learners avoid using the terms interchangeably. A risk parity portfolio can be built without the full All Weather regime story.",
    source: S.bridgewater,
  }),
  slide({
    no: 9,
    role: "course-map",
    message: "The lesson moves from intuition to math to implementation",
    subtitle: "A structured path from concept to portfolio checklist",
    support: [
      "Part 1: motivation and macro regimes",
      "Part 2: risk contribution math",
      "Part 3: asset behavior and construction",
      "Part 4: pitfalls, monitoring, and practice",
    ],
    evidence: [
      "Risk parity is easy to describe but easy to implement poorly",
      "The rest of the deck builds implementation discipline step by step",
    ],
    visual: "roadmap",
    steps: ["Why", "Math", "Assets", "Build", "Pitfalls"],
    note:
      "Use this as the navigation slide. It also prepares learners that the deck will include formulas but keep them applied.",
    source: S.education,
  }),
  slide({
    no: 10,
    role: "section",
    message: "Part 1: Motivation and the All Weather idea",
    subtitle: "Why portfolio balance must be defined by economic drivers and risk",
    support: ["Introduce the logic behind robustness"],
    evidence: ["All examples remain simplified"],
    visual: "divider",
    note:
      "Transition into the first teaching section. The next slides focus on the intuition before formulas.",
    source: S.education,
  }),
  slide({
    no: 11,
    role: "intuition",
    message: "Every asset has an environmental bias",
    subtitle: "Assets are claims on cash flows, inflation, rates, and growth",
    support: [
      "Equities are often tied to earnings growth",
      "Nominal bonds are sensitive to rates and inflation expectations",
      "Commodities respond to supply, demand, and inflation shocks",
      "Cash responds quickly to central bank policy",
    ],
    evidence: [
      "Bridgewater emphasizes breaking assets into underlying economic drivers",
      "The same asset can help in one regime and hurt in another",
    ],
    visual: "network concept",
    note:
      "Use simple examples. A bond is not just a low-risk asset; it has duration and inflation exposure. A commodity is not just speculative; it can carry inflation shock exposure.",
    source: S.bridgewater,
  }),
  slide({
    no: 12,
    role: "intuition",
    message: "Diversification works only when the pieces behave differently when it matters",
    subtitle: "Owning many assets is not the same as owning different risks",
    support: [
      "Two funds can hold hundreds of securities but share the same driver",
      "Correlation can rise during stress",
      "Diversification should be measured across risk factors",
      "Stress behavior matters more than normal-day variety",
    ],
    evidence: [
      "Risk parity depends on reasonable risk and correlation assessment",
      "A portfolio that looks diversified can still be one large macro bet",
    ],
    visual: "risk concept",
    note:
      "Emphasize that a long list of holdings is not a diversified portfolio if most holdings lose money in the same scenario.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 13,
    role: "intuition",
    message: "The key design choice is which risks deserve budget",
    subtitle: "Risk parity does not remove judgment; it makes judgment explicit",
    support: [
      "Choose the asset classes included in the universe",
      "Choose the risk measure and estimation window",
      "Choose constraints, leverage limits, and rebalance rules",
      "Choose whether equal risk is the goal or just the anchor",
    ],
    evidence: [
      "Risk parity is not a single universal portfolio",
      "Different definitions of risk can produce different allocations",
    ],
    visual: "target concept",
    note:
      "This slide prevents overconfidence. The framework is systematic, but the design decisions still require human judgment and governance.",
    source: S.aqrLever,
  }),
  slide({
    no: 14,
    role: "intuition",
    message: "Risk parity often owns more of lower-volatility assets",
    subtitle: "More capital can be needed to create the same risk contribution",
    support: [
      "If one asset is less volatile, a larger dollar weight may be needed",
      "If assets diversify each other, their portfolio risk impact changes",
      "The final allocation can look bond-heavy before leverage is applied",
      "That does not mean the portfolio is only a bond bet",
    ],
    evidence: [
      "AQR argues risk parity is better viewed as levering a diversified portfolio",
      "Lower-risk assets receive higher capital weights relative to market-cap portfolios",
    ],
    visual: "metric-summary",
    metrics: [
      { label: "Sizing rule", value: "risk first", note: "not dollars first" },
      { label: "Typical result", value: "more low-vol", note: "capital weight" },
      { label: "Misread", value: "bond-only", note: "too narrow" },
    ],
    note:
      "Address a common misconception early. A larger bond allocation is a consequence of risk sizing, not necessarily a tactical bond forecast.",
    source: S.aqrLever,
  }),
  slide({
    no: 15,
    role: "intuition",
    message: "Leverage is a scaling decision after the diversified portfolio is built",
    subtitle: "It raises both expected return and risk, and it can fail badly if unmanaged",
    support: [
      "First build the best unlevered risk-balanced mix",
      "Then decide whether total volatility is too low",
      "Scale exposure only within prudent limits",
      "Manage liquidity, financing, and drawdown triggers",
    ],
    evidence: [
      "AQR frames leverage as an alternative to concentration risk",
      "Leverage risk remains real and must be actively controlled",
    ],
    visual: "risk concept",
    note:
      "This is a critical compliance and teaching slide. Leverage is not free. It is a tool that must be justified, limited, monitored, and stress tested.",
    source: S.aqrLever,
  }),
  slide({
    no: 16,
    role: "section",
    message: "Part 2: The risk contribution math",
    subtitle: "The minimum formula set needed to understand the engine",
    support: ["Volatility, covariance, marginal risk, total risk contribution"],
    evidence: ["The formulas are simplified for long-only portfolio intuition"],
    visual: "divider",
    note:
      "Transition into formulas. Reassure learners that each formula has one practical question attached to it.",
    source: S.roncalli,
  }),
  slide({
    no: 17,
    role: "math",
    message: "Portfolio risk depends on volatility and correlation together",
    subtitle: "The same asset weight can add different risk in different portfolios",
    support: [
      "Volatility measures standalone movement",
      "Correlation measures how assets move together",
      "Covariance combines both into one matrix",
      "Portfolio risk is shaped by all pairwise relationships",
    ],
    evidence: [
      "Formula: portfolio vol = sqrt(w' Sigma w)",
      "Risk cannot be read from asset weights alone",
    ],
    visual: "formula concept",
    note:
      "Introduce Sigma as the covariance matrix. The main idea is that each asset's risk impact depends on both its own volatility and how it interacts with the rest.",
    source: S.roncalli,
  }),
  slide({
    no: 18,
    role: "math",
    message: "Marginal risk asks: what happens if I add one more dollar?",
    subtitle: "It measures the local impact of changing a weight",
    support: [
      "Marginal risk contribution is the slope of portfolio volatility",
      "It depends on the covariance matrix and current weights",
      "A diversifying asset can have low marginal risk",
      "A crowded risk factor can have high marginal risk",
    ],
    evidence: [
      "Formula: MRC_i = (Sigma w)_i / sigma_p",
      "MRC is a building block, not the full risk budget",
    ],
    visual: "formula concept",
    note:
      "Explain MRC as the sensitivity of portfolio volatility to a small change in one asset's weight.",
    source: S.roncalli,
  }),
  slide({
    no: 19,
    role: "math",
    message: "Total risk contribution asks: how much risk does this sleeve own?",
    subtitle: "It combines the weight and the marginal impact",
    support: [
      "Risk contribution multiplies size by marginal risk",
      "All risk contributions add up to total portfolio volatility",
      "A small weight can still matter if it is very volatile",
      "A large weight can matter less if it diversifies the rest",
    ],
    evidence: [
      "Formula: RC_i = w_i * (Sigma w)_i / sigma_p",
      "Percentage risk contribution: PRC_i = RC_i / sigma_p",
    ],
    visual: "formula concept",
    note:
      "This is the central formula for the deck. Learners should connect it back to the 60/40 example.",
    source: S.roncalli,
  }),
  slide({
    no: 20,
    role: "math",
    message: "Equal risk contribution means every selected sleeve matters equally",
    subtitle: "Equal dollars are not required, and often not expected",
    support: [
      "The target can be equal PRC across sleeves",
      "Or it can be a custom risk budget by role",
      "The optimizer searches for weights that hit the budget",
      "Constraints may prevent perfect equality",
    ],
    evidence: [
      "Risk budgeting generalizes equal risk contribution",
      "Practical portfolios often use bands instead of exact point targets",
    ],
    visual: "target formula",
    note:
      "Mention that exact equality may not be realistic when constraints, taxes, liquidity, and leverage caps are present.",
    source: S.roncalli,
  }),
  slide({
    no: 21,
    role: "example",
    message: "Inverse volatility is the simplest rough approximation",
    subtitle: "It works only when correlations are ignored or assumed similar",
    support: [
      "Weight each asset roughly proportional to 1 / volatility",
      "Normalize the weights so they sum to 100%",
      "Use it as intuition, not a complete optimizer",
      "Correlation can materially change the answer",
    ],
    evidence: [
      "A simple risk parity example can use inverse volatility weights",
      "Full risk parity uses the covariance matrix, not just standalone vol",
    ],
    visual: "formula concept",
    note:
      "This slide gives learners a mental shortcut while warning them not to stop there.",
    source: S.asness,
  }),
  slide({
    no: 22,
    role: "example",
    message: "A simple two-asset example shows why low-vol assets can get more capital",
    subtitle: "Illustration only: ignore correlation for the first pass",
    support: ["When one asset is less volatile, it needs a larger weight to carry similar risk"],
    evidence: ["Correlation and constraints can change the final portfolio"],
    visual: "table",
    table: [
      ["Asset", "Assumed volatility", "Inverse vol score", "Normalized capital weight"],
      ["Equity sleeve", "16%", "6.25", "33%"],
      ["Bond sleeve", "8%", "12.50", "67%"],
      ["Teaching point", "Half the vol", "Double the score", "More capital to equalize risk"],
    ],
    note:
      "Keep the math slow and concrete. This is not a recommendation; it is a demonstration of the inverse volatility intuition.",
    source: S.education,
  }),
  slide({
    no: 23,
    role: "math",
    message: "Volatility targeting scales the whole portfolio after weights are set",
    subtitle: "The risk-balanced mix and the total risk level are separate decisions",
    support: [
      "Estimate current portfolio volatility",
      "Choose a target volatility consistent with mandate and risk tolerance",
      "Scale exposure by target vol divided by estimated vol",
      "Cap the scale factor to avoid excessive leverage",
    ],
    evidence: [
      "Formula: scale = target_vol / estimated_vol",
      "Target volatility does not eliminate tail losses",
    ],
    visual: "metric-summary",
    metrics: [
      { label: "Estimated vol", value: "8%", note: "example" },
      { label: "Target vol", value: "10%", note: "example" },
      { label: "Scale", value: "1.25x", note: "before caps" },
    ],
    note:
      "Stress that volatility targeting reacts to measured risk, which can be stale or wrong during abrupt regime changes.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 24,
    role: "math",
    message: "Rebalancing is how the portfolio returns to its risk budget",
    subtitle: "Without rebalancing, yesterday's market moves set today's portfolio",
    support: [
      "Weights drift as asset prices move",
      "Volatility estimates drift as markets calm or stress",
      "Risk contributions drift even if capital weights look stable",
      "Rebalancing rules should be written before stress arrives",
    ],
    evidence: [
      "Risk parity requires ongoing risk management",
      "Rebalancing frequency affects turnover, tax, and tracking error",
    ],
    visual: "roadmap",
    steps: ["Measure", "Compare", "Trade", "Cap", "Review"],
    note:
      "Present rebalancing as governance, not just a trading task. The rule should specify triggers, limits, and escalation.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 25,
    role: "section",
    message: "Part 3: Asset behavior across regimes",
    subtitle: "The portfolio only works if the building blocks make economic sense",
    support: ["Equities, bonds, inflation-linked bonds, commodities, cash"],
    evidence: ["Asset behavior is regime-dependent and never guaranteed"],
    visual: "divider",
    note:
      "Transition from math to building blocks. The next slides connect each asset class to the four-weather framework.",
    source: S.bridgewater,
  }),
  slide({
    no: 26,
    role: "asset-class",
    message: "Equities are the growth engine, but they often dominate downside risk",
    subtitle: "They help when earnings and risk appetite surprise positively",
    support: [
      "Primary driver: expected earnings and valuation multiples",
      "Usually benefits from stronger growth expectations",
      "Can suffer when growth disappoints or discount rates rise",
      "Often the largest risk contributor in traditional portfolios",
    ],
    evidence: [
      "Risk parity usually reduces equity risk concentration",
      "Equity risk remains useful; it is not removed",
    ],
    visual: "chart concept",
    note:
      "Avoid framing equities as bad. They are central to long-term growth, but the risk parity question is whether they should own most of the risk budget.",
    source: S.asness,
  }),
  slide({
    no: 27,
    role: "asset-class",
    message: "Nominal government bonds can hedge growth shocks but dislike inflation shocks",
    subtitle: "Duration is powerful when rates fall, painful when rates rise",
    support: [
      "Primary drivers: real rates, inflation expectations, term premium",
      "Can help when growth falls and policy rates decline",
      "Can hurt when inflation and yields rise together",
      "Duration choice changes the size of the hedge",
    ],
    evidence: [
      "All Weather uses bonds for deflationary or disinflationary growth shocks",
      "Bond exposure must be stress tested for rising-rate regimes",
    ],
    visual: "chart concept",
    note:
      "Connect bonds to the four-regime map. They are not automatically safe; they are exposed to rate and inflation risk.",
    source: S.bridgewater,
  }),
  slide({
    no: 28,
    role: "asset-class",
    message: "Inflation-linked bonds target real purchasing power more directly",
    subtitle: "They can fill part of the inflation protection gap",
    support: [
      "Principal or cash flows are linked to inflation measures",
      "Real yields still matter, so prices can fall",
      "They are not the same as commodities or cash",
      "They may help when inflation surprises persist",
    ],
    evidence: [
      "Bridgewater highlights inflation-linked bonds as an important All Weather ingredient",
      "They can diversify nominal bond inflation exposure",
    ],
    visual: "target concept",
    note:
      "Clarify that inflation-linked bonds are not risk-free. Rising real yields can hurt even when inflation is high.",
    source: S.bridgewater,
  }),
  slide({
    no: 29,
    role: "asset-class",
    message: "Commodities and gold are inflation-shock diversifiers, not stable income engines",
    subtitle: "They can help in regimes that hurt both stocks and nominal bonds",
    support: [
      "Primary drivers: spot supply-demand, inflation, currency, real rates",
      "Can be volatile and path-dependent",
      "May diversify inflation surprises",
      "Position sizing matters because standalone volatility can be high",
    ],
    evidence: [
      "All Weather maps commodities to inflation-sensitive environments",
      "Diversification benefit depends on portfolio context and implementation",
    ],
    visual: "risk concept",
    note:
      "Avoid overpromising. Commodities can be helpful in a regime framework but are not guaranteed crisis hedges.",
    source: S.bridgewater,
  }),
  slide({
    no: 30,
    role: "asset-class",
    message: "Cash and collateral are small in return, large in operational importance",
    subtitle: "Liquidity is what lets a systematic portfolio keep operating",
    support: [
      "Cash supports margin, collateral, and rebalancing",
      "It can become attractive when policy rates are tight",
      "It reduces forced selling risk",
      "It creates drag when risky assets rally",
    ],
    evidence: [
      "Bridgewater separates cash, beta, and alpha as different return components",
      "Levered strategies must manage collateral and liquidity explicitly",
    ],
    visual: "metric-summary",
    metrics: [
      { label: "Role", value: "liquidity", note: "operations" },
      { label: "Cost", value: "drag", note: "when risk assets rise" },
      { label: "Benefit", value: "resilience", note: "under stress" },
    ],
    note:
      "This slide is practical. Many theoretical portfolio lessons ignore collateral, but real risk parity implementation cannot.",
    source: S.bridgewater,
  }),
  slide({
    no: 31,
    role: "asset-class",
    message: "Credit and alternatives can add return, but they also add hidden equity-like risk",
    subtitle: "A higher yield is not automatically a new diversifier",
    support: [
      "Credit spreads often widen when growth stress rises",
      "Private or illiquid assets can hide volatility",
      "Trend or alternative premia may diversify but need separate due diligence",
      "The risk budget should classify drivers, not labels",
    ],
    evidence: [
      "Risk parity portfolios can include more than stocks and bonds",
      "Each added sleeve must earn a clear role in the risk budget",
    ],
    visual: "risk concept",
    note:
      "The key caution is label risk. High yield, private credit, and equity-like alternatives may add the same stress exposure already in the portfolio.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 32,
    role: "asset-class",
    message: "Correlations are not constants; they are regime-sensitive estimates",
    subtitle: "The diversification you need most can disappear temporarily",
    support: [
      "Stock-bond correlation can change sign across regimes",
      "Commodities may diversify inflation but not every selloff",
      "Historical windows can understate future co-movement",
      "Stress tests should override blind faith in averages",
    ],
    evidence: [
      "Risk parity needs dynamic risk assessment in changing markets",
      "Correlation assumptions are a major model risk",
    ],
    visual: "network risk",
    note:
      "This is a bridge to implementation. A covariance matrix is only an estimate, and estimates can fail when regimes change.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 33,
    role: "section",
    message: "Part 4: Building a risk parity portfolio",
    subtitle: "A practical workflow from universe design to monitoring",
    support: ["Define, estimate, budget, optimize, scale, rebalance, monitor"],
    evidence: ["Good implementation is as important as the concept"],
    visual: "divider",
    note:
      "Transition into the construction process. The next slides are a checklist that learners can reuse.",
    source: S.education,
  }),
  slide({
    no: 34,
    role: "build-step",
    message: "Step 1: define the investable universe before estimating risk",
    subtitle: "Bad inputs cannot produce a robust portfolio",
    support: [
      "Use liquid instruments with reliable pricing",
      "Represent distinct economic drivers",
      "Avoid adding assets only because backtests look good",
      "Document exclusions, constraints, and implementation vehicles",
    ],
    evidence: [
      "Risk parity depends on the selected asset universe",
      "Universe design is an investment decision, not a clerical task",
    ],
    visual: "roadmap",
    steps: ["Liquid", "Distinct", "Transparent", "Implementable"],
    note:
      "The universe determines what risks can be balanced. A poor universe makes the optimizer look precise while solving the wrong problem.",
    source: S.education,
  }),
  slide({
    no: 35,
    role: "build-step",
    message: "Step 2: estimate volatility with humility",
    subtitle: "Use measurement, but do not confuse it with truth",
    support: [
      "Choose a lookback window and frequency",
      "Decide whether to use realized, implied, or blended volatility",
      "Apply floors and caps to avoid extreme leverage changes",
      "Compare short-term and long-term estimates",
    ],
    evidence: [
      "Volatility estimates drive position sizing",
      "Abrupt shocks can make backward-looking estimates stale",
    ],
    visual: "formula concept",
    note:
      "This slide introduces model risk in the first input. The answer is not to abandon models; it is to govern them.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 36,
    role: "build-step",
    message: "Step 3: estimate correlations, then stress them",
    subtitle: "Diversification is only as good as the co-movement assumption",
    support: [
      "Use a covariance matrix for the optimizer",
      "Review correlations by regime, not only full sample averages",
      "Shock correlations toward one during liquidity stress",
      "Ask which assumption would break the portfolio",
    ],
    evidence: [
      "Portfolio volatility uses the full covariance matrix",
      "Stress correlation behavior is a core risk management task",
    ],
    visual: "network concept",
    note:
      "Encourage learners to ask a practical question: what if my diversifier stops diversifying exactly when I need it?",
    source: S.roncalli,
  }),
  slide({
    no: 37,
    role: "build-step",
    message: "Step 4: choose the risk budget by role, not by habit",
    subtitle: "Equal risk is a starting point; custom budgets may be better",
    support: [
      "Equal budget: each sleeve gets similar risk contribution",
      "Macro budget: each regime gets a target share of risk",
      "Constraint-aware budget: respect liquidity and leverage limits",
      "Governance budget: document why each sleeve exists",
    ],
    evidence: [
      "Risk budgeting generalizes strict parity",
      "The target budget should match the investor's objective and constraints",
    ],
    visual: "target concept",
    note:
      "Make clear that equal risk contribution is not automatically optimal. It is an anchor that can be adapted.",
    source: S.roncalli,
  }),
  slide({
    no: 38,
    role: "build-step",
    message: "Step 5: solve for weights, then inspect the answer like a skeptic",
    subtitle: "The optimizer is a calculator, not an investment committee",
    support: [
      "Check whether weights make economic sense",
      "Review exposures by asset, factor, and regime",
      "Apply maximum weights and leverage constraints",
      "Run sensitivity tests on volatility and correlation inputs",
    ],
    evidence: [
      "Small input changes can create meaningful weight changes",
      "A robust process reviews the output before trading",
    ],
    visual: "formula risk",
    note:
      "This is a quality-control slide. The optimizer's output should be challenged with economic reasoning and constraints.",
    source: S.education,
  }),
  slide({
    no: 39,
    role: "build-step",
    message: "Step 6: scale total exposure only after the risk mix is acceptable",
    subtitle: "Do not use leverage to rescue a weak portfolio design",
    support: [
      "Target volatility should fit the mandate",
      "Leverage caps should be hard limits",
      "Collateral needs should be pre-funded",
      "De-risking rules should be written in advance",
    ],
    evidence: [
      "Leverage can improve risk-adjusted portfolio design only with careful controls",
      "Excessive leverage plus illiquidity is a dangerous combination",
    ],
    visual: "risk concept",
    note:
      "Repeat that leverage is not an afterthought. It is an operational and behavioral risk as well as a financial one.",
    source: S.aqrLever,
  }),
  slide({
    no: 40,
    role: "build-step",
    message: "Step 7: stress test regimes before trusting the backtest",
    subtitle: "Ask how the portfolio behaves when the forecast is wrong",
    support: [
      "Growth shock: equities and credit under pressure",
      "Inflation shock: nominal bonds and equities can both suffer",
      "Liquidity shock: correlations rise and funding tightens",
      "Policy shock: rates move faster than models expected",
    ],
    evidence: [
      "All Weather thinking is built around economic surprises",
      "Stress testing checks whether the risk budget survives bad regimes",
    ],
    visual: "table",
    table: [
      ["Stress", "What to shock", "Question to answer"],
      ["Growth down", "Equities, credit spreads", "Does the hedge have enough duration?"],
      ["Inflation up", "Rates, commodities, real yields", "Do inflation sleeves matter enough?"],
      ["Liquidity stress", "Correlations, financing", "Can the portfolio keep rebalancing?"],
      ["Vol spike", "Position scaling", "Do caps prevent forced deleveraging?"],
    ],
    note:
      "This table turns the All Weather idea into a risk management checklist.",
    source: S.bridgewater,
  }),
  slide({
    no: 41,
    role: "build-step",
    message: "Step 8: monitor risk contributions, not just returns",
    subtitle: "A good month can still leave the portfolio badly positioned",
    support: [
      "Track capital weights and percentage risk contributions",
      "Track realized volatility versus target volatility",
      "Track leverage, collateral, and liquidity buffers",
      "Track drawdown triggers and rebalance exceptions",
    ],
    evidence: [
      "Risk parity portfolios require dynamic management",
      "Monitoring should reveal drift before it becomes a crisis",
    ],
    visual: "metric-summary",
    metrics: [
      { label: "Risk mix", value: "PRC", note: "by sleeve" },
      { label: "Total risk", value: "Vol", note: "vs target" },
      { label: "Operations", value: "Liquidity", note: "collateral and caps" },
    ],
    note:
      "Connect this slide to actual portfolio governance. Risk parity is not set-and-forget.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 42,
    role: "example",
    message: "An illustrative risk budget makes the strategy concrete",
    subtitle: "This is a teaching example, not a recommended allocation",
    support: ["The portfolio designer chooses risk budgets first, then solves for weights"],
    evidence: ["Weights depend on volatility, correlation, constraints, and instruments"],
    visual: "table",
    table: [
      ["Sleeve", "Economic role", "Target risk budget", "Typical concern"],
      ["Global equities", "Growth upside", "25%", "Drawdowns and valuation"],
      ["Nominal bonds", "Growth downside hedge", "25%", "Inflation and duration risk"],
      ["Inflation-linked bonds", "Real return and inflation", "20%", "Real yield risk"],
      ["Commodities / gold", "Inflation shock", "20%", "High standalone volatility"],
      ["Cash / collateral", "Liquidity", "10%", "Return drag"],
    ],
    note:
      "Use this as a worked design example. The numbers are simple so learners can see the logic; they are not a model portfolio.",
    source: S.education,
  }),
  slide({
    no: 43,
    role: "section",
    message: "Part 5: Case studies, pitfalls, and practice",
    subtitle: "A strategy is only useful if you know when it can fail",
    support: ["Review historical-style stresses and practical failure modes"],
    evidence: ["Risk parity improves some risks and introduces others"],
    visual: "divider",
    note:
      "Transition into the final section. The tone should be balanced: neither promotional nor dismissive.",
    source: S.education,
  }),
  slide({
    no: 44,
    role: "case-study",
    message: "A 2008-type growth shock is the environment risk parity was built to handle better",
    subtitle: "Equity losses can be offset if high-quality duration performs",
    support: [
      "Growth disappoints sharply",
      "Equities and credit sell off",
      "Policy rates fall and nominal bonds may rally",
      "Rebalancing can add exposure to beaten-down assets",
    ],
    evidence: [
      "The risk parity premise is not that losses vanish",
      "The premise is that one risk source should not dominate the portfolio",
    ],
    visual: "chart concept",
    note:
      "Keep this as a stylized regime lesson. Do not imply every 2008-like episode will behave the same way.",
    source: S.asness,
  }),
  slide({
    no: 45,
    role: "case-study",
    message: "A 2022-type inflation and rate shock is a hard test for the framework",
    subtitle: "Stocks and nominal bonds can fall together when inflation surprises up",
    support: [
      "Inflation rises faster than expected",
      "Central banks tighten policy",
      "Bond duration loses value as yields rise",
      "Inflation sleeves and leverage controls become critical",
    ],
    evidence: [
      "The four-weather map explicitly includes rising-inflation regimes",
      "Implementation quality determines whether the portfolio has enough inflation protection",
    ],
    visual: "risk concept",
    note:
      "This slide is important because many learners will remember 2022. Use it to show that All Weather is not immune to all losses.",
    source: S.bridgewater,
  }),
  slide({
    no: 46,
    role: "pitfall",
    message: "Pitfall 1: backward-looking risk estimates can be too calm before the storm",
    subtitle: "A smooth past can create excessive present exposure",
    support: [
      "Long calm periods reduce measured volatility",
      "Lower measured volatility can increase target exposure",
      "A sudden shock can arrive before the model catches up",
      "Floors, caps, and stress overlays reduce this risk",
    ],
    evidence: [
      "Risk estimates should be dynamic but governed",
      "Volatility targeting should not be purely mechanical",
    ],
    visual: "alert risk",
    note:
      "This is a model risk slide. Learners should remember that risk models often look best just before they are needed most.",
    source: S.aqrRealWorld,
  }),
  slide({
    no: 47,
    role: "pitfall",
    message: "Pitfall 2: leverage risk is not the same as market risk",
    subtitle: "Funding, margin, and liquidity can force bad trades",
    support: [
      "Margin calls can occur when assets are temporarily dislocated",
      "Financing terms can change during stress",
      "Illiquid holdings can make deleveraging expensive",
      "Behavioral pressure can break the strategy at the wrong time",
    ],
    evidence: [
      "AQR stresses that excessive leverage is dangerous",
      "Leverage should be paired with liquidity and capital preservation rules",
    ],
    visual: "risk concept",
    note:
      "Explain that leverage risk includes operational and psychological pressure, not just a larger daily P&L swing.",
    source: S.aqrLever,
  }),
  slide({
    no: 48,
    role: "pitfall",
    message: "Pitfall 3: constraints can turn a clean theory into a concentrated portfolio",
    subtitle: "Real portfolios face limits that the textbook version may ignore",
    support: [
      "No leverage or low leverage caps",
      "Limited access to commodities or futures",
      "Tax and turnover constraints",
      "Home-bias and currency exposure limits",
    ],
    evidence: [
      "An unlevered risk parity portfolio may have lower expected return",
      "Constraints should be visible in the design, not hidden after the fact",
    ],
    visual: "table",
    table: [
      ["Constraint", "Effect", "Possible response"],
      ["No leverage", "Lower target return", "Accept lower risk or add return engines carefully"],
      ["No commodities", "Weaker inflation hedge", "Use TIPS or real-asset proxies with caution"],
      ["Low liquidity", "Harder rebalancing", "Increase cash buffer and reduce scale"],
      ["Tax sensitivity", "Turnover cost", "Use wider rebalance bands"],
    ],
    note:
      "This slide is especially useful for retail or policy-constrained learners. Risk parity is adaptable, but constraints change the result.",
    source: S.education,
  }),
  slide({
    no: 49,
    role: "practice",
    message: "Class exercise: design a risk budget before choosing funds",
    subtitle: "The answer should explain roles, risks, and controls",
    support: [
      "Pick four sleeves and assign a target risk budget",
      "Write the macro role of each sleeve in one sentence",
      "List one condition where each sleeve can fail",
      "Define one rebalance or de-risking rule",
    ],
    evidence: [
      "A good risk parity design is explainable before the optimizer runs",
      "If the role is unclear, the sleeve probably does not belong",
    ],
    visual: "roadmap",
    steps: ["Sleeves", "Risk budget", "Failure mode", "Rule"],
    note:
      "Use this as an interactive activity. Ask learners to defend the role of every asset before discussing ticker symbols.",
    source: S.education,
  }),
  slide({
    no: 50,
    role: "close",
    message: "The takeaway: risk parity is a discipline for balance, not a promise of safety",
    subtitle: "Use it as a framework, test it as a model, govern it as a real portfolio",
    support: [
      "All Weather starts from macro uncertainty",
      "Risk parity sizes exposures by contribution to total risk",
      "Leverage can replace concentration risk, but it adds its own risks",
      "Monitoring, stress testing, and liquidity rules are non-negotiable",
    ],
    evidence: [
      "Educational content only",
      "Not investment advice, not a recommendation, and not a performance guarantee",
    ],
    visual: "target concept",
    note:
      "Close with balance. The best lesson is neither that risk parity is perfect nor that it is flawed beyond use. It is a disciplined way to ask better portfolio questions.",
    source: S.education,
  }),
];

const manifest = {
  project_name: PROJECT,
  deck_title: "All Weather Strategy (Risk Parity)",
  deck_mark: "ALL WEATHER / RISK PARITY",
  audience:
    "Beginner to intermediate investors, finance students, and analysts learning portfolio construction",
  objective:
    "Teach the logic, math, implementation workflow, and practical risks of All Weather and risk parity strategies.",
  language: "English",
  aspect_ratio: "16:9",
  rendering_mode: "image-first",
  style: "institutional-finance lesson deck",
  slides,
};

const references = `# All Weather / Risk Parity References

These sources informed the educational content in the deck.

- Bridgewater Associates: The All Weather Story
  https://www.bridgewater.com/research-and-insights/the-all-weather-story
- AQR: Risk Parity: Why We Lever
  https://www.aqr.com/Insights/Perspectives/Risk-Parity-Why-We-Fight-Lever
- AQR: Risk Parity, Risk Management and the Real World
  https://www.aqr.com/insights/research/white-papers/risk-parity-risk-management-and-the-real-world
- Asness, Frazzini, and Pedersen: Leverage Aversion and Risk Parity
  https://www.aqr.com/-/media/AQR/Documents/Insights/Journal-Article/Leverage-Aversion-and-Risk-Parity.pdf
- Thierry Roncalli: Introduction to Risk Parity and Budgeting
  https://arxiv.org/abs/1403.1889

Note: The deck is educational only. It is not investment advice, not a product recommendation, and not a performance guarantee.
`;

fs.mkdirSync(NOTES_DIR, { recursive: true });
fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2), "utf8");
fs.writeFileSync(REFERENCES_OUT, references, "utf8");

console.log(`[OK] Wrote ${MANIFEST_OUT}`);
console.log(`[OK] Wrote ${REFERENCES_OUT}`);
