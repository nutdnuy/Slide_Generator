from __future__ import annotations

import math
from pathlib import Path
from textwrap import dedent

import matplotlib.pyplot as plt
import pandas as pd
import yfinance as yf
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_AUTO_SIZE, MSO_VERTICAL_ANCHOR
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs"
NOTES = ROOT / "notes"
IMG = ROOT / "assets" / "images" / "quant-fund-strategies"
DATA = ROOT / "outputs" / "data"
for p in (OUT, NOTES, IMG, DATA):
    p.mkdir(parents=True, exist_ok=True)


BG = RGBColor(9, 16, 28)
PANEL = RGBColor(18, 31, 48)
PANEL2 = RGBColor(24, 43, 65)
TEXT = RGBColor(236, 242, 247)
MUTED = RGBColor(148, 163, 184)
CYAN = RGBColor(58, 192, 201)
GREEN = RGBColor(86, 194, 138)
AMBER = RGBColor(241, 180, 74)
RED = RGBColor(226, 91, 91)
BLUE = RGBColor(79, 128, 255)
FONT = "Arial"


PROXIES = {
    "SPY": "S&P 500 ETF",
    "QMNNX": "Equity market neutral",
    "QSPNX": "Style premia / factor L-S",
    "QRPNX": "Alternative risk premia",
    "QMHNX": "Managed futures high vol",
    "AQMNX": "Managed futures",
    "QDSNX": "Diversifying multi-strategy",
    "ADANX": "Diversified arbitrage",
    "MNA": "Merger arbitrage",
    "RPAR": "Risk parity",
    "DBMF": "Managed futures ETF",
    "BTAL": "Anti-beta / low-beta L-S",
    "MTUM": "Momentum factor long-only",
    "VLUE": "Value factor long-only",
    "QUAL": "Quality factor long-only",
    "USMV": "Minimum volatility long-only",
    "PUTW": "Put-write options",
    "QAI": "Liquid multi-alternative",
}


STRATEGIES = [
    ("Trend following / CTA", "Time-series momentum across futures, FX, rates, commodities", "Man AHL, Winton, Aspect, Dunn, Transtrend, AQR"),
    ("Systematic global macro", "Rules/models on rates, FX, inflation, growth, policy and cross-asset risk", "Bridgewater, Two Sigma, D.E. Shaw, Qube, AQR"),
    ("Equity statistical arbitrage", "Short-horizon relative value, pairs, baskets, residual mean reversion", "Renaissance, Two Sigma, D.E. Shaw, PDT, Qube"),
    ("Equity market neutral", "Long/short stock selection with beta/sector/region risk hedged", "AQR, BlackRock, Acadian, PanAgora, Vanguard"),
    ("Factor/style premia", "Value, momentum, quality, carry, defensive harvested systematically", "AQR, Dimensional, Robeco, BlackRock, Invesco"),
    ("Alternative risk premia", "Multi-asset long/short factors; often market-neutral and diversified", "AQR, Man Numeric, BlackRock, Goldman Sachs"),
    ("Risk parity / balanced beta", "Risk-balanced exposure to growth/inflation assets, often levered bonds/commodities", "Bridgewater, AQR, BlackRock, RPAR"),
    ("Volatility risk premia", "Short implied volatility, variance swaps, option carry, put-write", "Capula, AQR, Goldman Sachs, option overlay desks"),
    ("Options relative value", "Skew, term structure, dispersion, gamma/theta, index vs single-name vol", "Citadel, Jane Street, Susquehanna, Optiver, IMC"),
    ("Market making / HFT", "Bid-ask capture, inventory/risk optimization, ultra-low-latency execution", "Citadel Securities, Jane Street, HRT, Jump, Virtu, Optiver"),
    ("ETF / index arbitrage", "ETF creation-redemption, NAV dislocations, basket/index/derivative basis", "Jane Street, Susquehanna, Citadel Securities"),
    ("Fixed-income relative value", "Yield curve, swap spread, bond futures basis, credit basis", "Citadel, Millennium pods, D.E. Shaw, Capula"),
    ("Convertible arbitrage", "Long convertible bond vs short equity/credit/vol hedges", "Calamos, Advent, Linden, multi-strategy pods"),
    ("Merger / event arbitrage", "Deal-spread models, probability, timing, regulatory/event risk", "AQR, Gabelli, Millennium pods, DE Shaw"),
    ("Commodity spreads", "Calendar, crack/crush, intermarket spreads and storage/carry anomalies", "CTAs, commodity RV pods, energy specialists"),
    ("Cross-asset carry", "Harvest yield/roll-down/forward premia with risk controls", "AQR, Bridgewater, systematic macro funds"),
    ("Machine-learning alpha", "Nonlinear signals from traditional/alternative data, NLP, deep learning", "Two Sigma, Citadel GQS, D.E. Shaw, QRT, G-Research"),
    ("Crypto quant", "Funding-rate, basis, market making, momentum, on-chain/liquidity signals", "Jump Crypto, GSR, Wintermute, Cumberland, Brevan Howard Digital"),
]


SOURCES = [
    ("QuantStart taxonomy", "https://www.quantstart.com/articles/what-are-the-different-types-of-quant-funds/"),
    ("AQR style premia research", "https://www.aqr.com/Insights/Research/Journal-Article/Understanding-Style-Premia"),
    ("Two Sigma investment management", "https://www.twosigma.com/businesses/investment-management/"),
    ("Citadel GQS", "https://www.citadel.com/what-we-do/global-quantitative-strategies/"),
    ("Jane Street client offering", "https://www.janestreet.com/what-we-do/client-offering/"),
    ("Man AHL", "https://www.man.com/maninstitute/man-ahl"),
    ("Bridgewater balanced beta", "https://www.bridgewater.com/research-and-insights/balanced-beta-investing"),
    ("Kiplinger 2026 mutual fund guide", "https://www.kiplinger.com/investing/mutual-funds/kiplingers-mutual-fund-guide"),
    ("Yahoo Finance historical prices via yfinance", "https://finance.yahoo.com/"),
]


def fetch_returns() -> pd.DataFrame:
    frames = []
    for ticker, label in PROXIES.items():
        df = yf.download(ticker, start="2020-12-31", end="2026-01-05", auto_adjust=True, progress=False, threads=False)
        if df.empty:
            continue
        close = df["Close"]
        if isinstance(close, pd.DataFrame):
            close = close.iloc[:, 0]
        row = {"ticker": ticker, "proxy": label}
        for year in range(2021, 2026):
            y = close.loc[str(year)]
            row[str(year)] = float(y.iloc[-1] / y.iloc[0] - 1) if len(y) > 1 else math.nan
        period = close.loc[close.index >= pd.Timestamp("2021-01-01")]
        row["cagr_2021_2025"] = float((period.iloc[-1] / period.iloc[0]) ** (252 / len(period)) - 1)
        row["cum_2021_2025"] = float(period.iloc[-1] / period.iloc[0] - 1)
        frames.append(row)
    perf = pd.DataFrame(frames)
    perf.to_csv(DATA / "quant_strategy_proxy_returns_2021_2025.csv", index=False)
    return perf


def pct(x):
    return "" if pd.isna(x) else f"{x*100:.1f}%"


def make_charts(perf: pd.DataFrame) -> None:
    plt.rcParams["font.family"] = "DejaVu Sans"
    years = [str(y) for y in range(2021, 2026)]
    selected = ["QMNNX", "QSPNX", "QRPNX", "QMHNX", "AQMNX", "QDSNX", "ADANX", "MNA", "RPAR", "DBMF", "BTAL", "PUTW", "SPY"]
    heat = perf.set_index("ticker").loc[selected, years] * 100
    fig, ax = plt.subplots(figsize=(14.5, 6.5), facecolor="#09101c")
    ax.set_facecolor("#09101c")
    im = ax.imshow(heat.values, cmap="RdYlGn", vmin=-25, vmax=35)
    ax.set_xticks(range(len(years)), years, color="#ecf2f7", fontsize=11)
    short_names = {
        "QMNNX": "Equity MN",
        "QSPNX": "Style premia",
        "QRPNX": "Alt risk premia",
        "QMHNX": "MF high vol",
        "AQMNX": "Managed futures",
        "QDSNX": "Multi-strat",
        "ADANX": "Diversified arb",
        "MNA": "Merger arb",
        "RPAR": "Risk parity",
        "DBMF": "MF ETF",
        "BTAL": "Anti-beta L-S",
        "PUTW": "Put-write",
        "SPY": "S&P 500",
    }
    ax.set_yticks(range(len(selected)), [short_names[t] for t in selected], color="#ecf2f7", fontsize=10)
    for i in range(len(selected)):
        for j in range(len(years)):
            ax.text(j, i, f"{heat.iloc[i, j]:.1f}", ha="center", va="center", color="#08111f", fontsize=8, weight="bold")
    ax.set_title("Calendar-year returns by public proxy (%)", color="#ecf2f7", fontsize=16, weight="bold", pad=14)
    cbar = fig.colorbar(im, ax=ax, fraction=0.035, pad=0.025)
    cbar.ax.tick_params(colors="#ecf2f7", labelsize=8)
    for spine in ax.spines.values():
        spine.set_visible(False)
    fig.tight_layout(pad=0.8)
    fig.savefig(IMG / "performance_heatmap.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    top = perf.sort_values("cagr_2021_2025", ascending=True).tail(12)
    fig, ax = plt.subplots(figsize=(11.5, 6), facecolor="#09101c")
    ax.set_facecolor("#09101c")
    colors = ["#56c28a" if v >= 0.1 else "#3ac0c9" if v >= 0.05 else "#f1b44a" for v in top["cagr_2021_2025"]]
    ax.barh(top["proxy"], top["cagr_2021_2025"] * 100, color=colors)
    ax.tick_params(colors="#ecf2f7", labelsize=9)
    ax.set_xlabel("CAGR 2021-2025 (%)", color="#94a3b8")
    ax.set_title("Best-performing public proxies over 2021-2025", color="#ecf2f7", fontsize=16, weight="bold", pad=12)
    ax.grid(axis="x", color="#24384f", alpha=0.6)
    for spine in ax.spines.values():
        spine.set_visible(False)
    for i, v in enumerate(top["cagr_2021_2025"] * 100):
        ax.text(v + 0.4, i, f"{v:.1f}%", va="center", color="#ecf2f7", fontsize=9, weight="bold")
    fig.tight_layout()
    fig.savefig(IMG / "cagr_ranking.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    regimes = pd.DataFrame({
        "Year": ["2021", "2022", "2023", "2024", "2025"],
        "Dominant regime": ["Risk-on reopening", "Inflation shock", "AI mega-cap rebound", "Trend continuation", "Broadening + high rates"],
        "What worked": ["Equity beta, value", "Trend/CTA, market neutral", "Quality, market neutral", "Momentum, market neutral", "Value, ARP, CTA"],
    })
    regimes.to_csv(DATA / "quant_regime_summary_2021_2025.csv", index=False)


def slide_bg(slide):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = BG


def add_text(slide, text, x, y, w, h, size=24, color=TEXT, bold=False, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = text
    r.font.name = FONT
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    return box


def add_title(slide, title, subtitle=None):
    add_text(slide, title, 0.55, 0.35, 11.9, 0.55, 25, TEXT, True)
    if subtitle:
        add_text(slide, subtitle, 0.58, 0.9, 11.5, 0.32, 9.5, MUTED)


def panel(slide, x, y, w, h, color=PANEL, line=None):
    shape = slide.shapes.add_shape(1, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.color.rgb = line or RGBColor(42, 60, 82)
    shape.line.width = Pt(0.8)
    return shape


def bullet_list(slide, items, x, y, w, h, size=13, color=TEXT):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
    for idx, item in enumerate(items):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.text = f"- {item}"
        p.font.name = FONT
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.space_after = Pt(5)
    return box


def add_footer(slide, idx):
    add_text(slide, f"{idx:02d}", 12.25, 7.08, 0.45, 0.18, 7, MUTED, True, PP_ALIGN.RIGHT)
    add_text(slide, "Research deck | public proxies, not investment advice", 0.58, 7.08, 5.5, 0.18, 6.5, MUTED)


def add_table(slide, data, x, y, w, h, cols, font_size=8.5):
    rows = len(data) + 1
    tbl = slide.shapes.add_table(rows, cols, Inches(x), Inches(y), Inches(w), Inches(h)).table
    for c in range(cols):
        tbl.columns[c].width = Inches(w / cols)
    headers = data[0].keys()
    for c, head in enumerate(headers):
        cell = tbl.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = PANEL2
        cell.text = head
        cell.text_frame.paragraphs[0].runs[0].font.bold = True
        cell.text_frame.paragraphs[0].runs[0].font.size = Pt(font_size)
        cell.text_frame.paragraphs[0].runs[0].font.color.rgb = TEXT
    for r, row in enumerate(data, start=1):
        for c, val in enumerate(row.values()):
            cell = tbl.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = PANEL if r % 2 else RGBColor(13, 25, 40)
            cell.text = str(val)
            for p in cell.text_frame.paragraphs:
                p.font.name = FONT
                p.font.size = Pt(font_size)
                p.font.color.rgb = TEXT
    return tbl


def lerp(a, b, t):
    return int(a + (b - a) * max(0, min(1, t)))


def return_color(value: float) -> RGBColor:
    # Red -> pale yellow -> green scale centered around 0%.
    v = max(-25.0, min(35.0, value * 100))
    if v < 0:
        t = (v + 25.0) / 25.0
        return RGBColor(lerp(200, 255, t), lerp(18, 238, t), lerp(42, 150, t))
    t = v / 35.0
    return RGBColor(lerp(255, 22, t), lerp(238, 138, t), lerp(150, 74, t))


def heatmap_shapes(slide, perf: pd.DataFrame, x=0.85, y=1.55):
    selected = ["QMNNX", "QSPNX", "QRPNX", "QMHNX", "AQMNX", "QDSNX", "ADANX", "MNA", "RPAR", "DBMF", "BTAL", "PUTW", "SPY"]
    labels = {
        "QMNNX": "Equity MN",
        "QSPNX": "Style premia",
        "QRPNX": "Alt risk premia",
        "QMHNX": "MF high vol",
        "AQMNX": "Managed futures",
        "QDSNX": "Multi-strat",
        "ADANX": "Diversified arb",
        "MNA": "Merger arb",
        "RPAR": "Risk parity",
        "DBMF": "MF ETF",
        "BTAL": "Anti-beta L-S",
        "PUTW": "Put-write",
        "SPY": "S&P 500",
    }
    years = [str(v) for v in range(2021, 2026)]
    idx = perf.set_index("ticker")
    add_text(slide, "Calendar-year returns by proxy (%)", x, y - 0.35, 8.7, 0.28, 16, TEXT, True)
    add_text(slide, "Strategy", x, y + 0.1, 1.75, 0.18, 8.3, MUTED, True)
    for j, year in enumerate(years):
        add_text(slide, year, x + 2.0 + j * 1.12, y + 0.1, 0.82, 0.18, 8.8, MUTED, True, PP_ALIGN.CENTER)
    cell_h = 0.34
    for i, ticker in enumerate(selected):
        yy = y + 0.43 + i * cell_h
        add_text(slide, labels[ticker], x, yy + 0.06, 1.75, 0.12, 7.8, TEXT)
        for j, year in enumerate(years):
            val = float(idx.loc[ticker, year])
            box = panel(slide, x + 2.0 + j * 1.12, yy, 1.03, cell_h - 0.02, return_color(val), line=RGBColor(9, 16, 28))
            box.line.width = Pt(0.4)
            add_text(slide, f"{val*100:.1f}", x + 2.02 + j * 1.12, yy + 0.075, 0.98, 0.1, 7.0, RGBColor(5, 12, 20), True, PP_ALIGN.CENTER)
    add_text(slide, "Key read", 9.1, 1.7, 2.7, 0.25, 14, CYAN, True)
    bullet_list(slide, [
        "2022: CTA / managed futures had crisis alpha.",
        "Equity market neutral and style premia led the 5-year proxy sample.",
        "Risk parity suffered when stocks and bonds fell together.",
        "Merger arb was stable but low-return.",
    ], 9.1, 2.15, 3.3, 2.2, 10.5, TEXT)


def build_ppt(perf: pd.DataFrame):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]
    slide_no = 0

    def new_slide(title=None, subtitle=None):
        nonlocal slide_no
        slide_no += 1
        s = prs.slides.add_slide(blank)
        slide_bg(s)
        if title:
            add_title(s, title, subtitle)
        add_footer(s, slide_no)
        return s

    s = new_slide()
    add_text(s, "Quant Fund Strategies", 0.6, 0.6, 11.8, 0.65, 36, TEXT, True)
    add_text(s, "Research summary: strategy universe, who uses what, and 2021-2025 public-proxy performance", 0.64, 1.35, 10.4, 0.5, 16, MUTED)
    for i, word in enumerate(["Signals", "Portfolio", "Execution", "Risk"]):
        panel(s, 0.75 + i * 3.05, 3.1, 2.55, 1.55, PANEL2)
        add_text(s, word, 0.95 + i * 3.05, 3.38, 2.1, 0.28, 20, [CYAN, GREEN, AMBER, BLUE][i], True, PP_ALIGN.CENTER)
        add_text(s, ["Data + model", "Sizing + hedging", "Costs + liquidity", "Drawdown control"][i], 0.95 + i * 3.05, 3.82, 2.1, 0.28, 10, MUTED, False, PP_ALIGN.CENTER)
    add_text(s, "Scope: public research + public mutual fund/ETF proxies. Private fund returns are not assumed.", 0.75, 5.55, 11.8, 0.3, 11, MUTED)

    s = new_slide("Executive Takeaways", "One line: quant is not one strategy; performance depends heavily on regime, horizon and capacity.")
    bullets = [
        "The usable taxonomy splits into directional trend/macro, market-neutral alpha, arbitrage/RV, volatility/options, HFT/market making, and multi-strategy platforms.",
        "2021-2025 favored equity market neutral, style premia and alternative risk premia proxies; 2022 was the stress-test year where CTAs stood out.",
        "Risk parity lagged because 2022 hit stocks and bonds together; merger arb was stable but low-return versus cash and equity beta.",
        "Capacity matters: HFT/stat-arb edges can be large but hard to scale; factor/risk-premia products scale better but face crowding.",
        "Use public proxy returns only as pattern evidence; actual funds differ by fees, leverage, turnover, financing, shorting and capacity limits.",
    ]
    bullet_list(s, bullets, 0.9, 1.55, 11.6, 4.8, 16)

    s = new_slide("Strategy Map", "18 commonly used quant strategies, grouped by return source.")
    groups = [
        ("Directional", "Trend following / CTA\nSystematic macro\nCross-asset carry\nCrypto momentum", CYAN),
        ("Market-neutral Alpha", "Equity stat arb\nEquity market neutral\nFactor/style premia\nML alpha", GREEN),
        ("Relative Value", "Fixed-income RV\nConvertible arb\nCommodity spreads\nETF/index arb", AMBER),
        ("Options + Microstructure", "Volatility premia\nOptions RV\nMarket making / HFT\nExecution alpha", BLUE),
    ]
    for i, (g, txt, col) in enumerate(groups):
        panel(s, 0.65 + i * 3.15, 1.55, 2.75, 4.6, PANEL)
        add_text(s, g, 0.85 + i * 3.15, 1.85, 2.35, 0.35, 17, col, True, PP_ALIGN.CENTER)
        add_text(s, txt, 0.9 + i * 3.15, 2.5, 2.25, 2.6, 13, TEXT, False, PP_ALIGN.CENTER)

    s = new_slide("Strategy Catalog", "The broadest practical list for institutional quant funds.")
    rows = [{"Strategy": a, "Core idea": b[:78], "Examples": c[:55]} for a, b, c in STRATEGIES[:9]]
    add_table(s, rows, 0.55, 1.35, 12.2, 5.45, 3, 7.4)

    s = new_slide("Strategy Catalog II", "More strategies: relative value, options, microstructure, crypto.")
    rows = [{"Strategy": a, "Core idea": b[:78], "Examples": c[:55]} for a, b, c in STRATEGIES[9:]]
    add_table(s, rows, 0.55, 1.35, 12.2, 5.45, 3, 7.4)

    s = new_slide("Who Uses What", "Representative mapping based on public descriptions; not a complete portfolio disclosure.")
    manager_rows = [
        {"Manager / firm": "AQR", "Publicly associated strategies": "style premia, equity market neutral, managed futures, diversified arbitrage"},
        {"Manager / firm": "Two Sigma", "Publicly associated strategies": "scientific/data-driven multi-strategy alpha; traditional + alternative data"},
        {"Manager / firm": "Citadel GQS", "Publicly associated strategies": "algorithmic strategies across equities, futures, fixed income and currencies"},
        {"Manager / firm": "Man AHL", "Publicly associated strategies": "systematic trend, multi-asset futures, machine-learning research"},
        {"Manager / firm": "Jane Street", "Publicly associated strategies": "ETF liquidity, market making, ETP/derivatives/crypto underliers"},
        {"Manager / firm": "Bridgewater", "Publicly associated strategies": "systematic macro process; All Weather / balanced beta risk parity"},
        {"Manager / firm": "D.E. Shaw / Renaissance", "Publicly associated strategies": "quant/statistical multi-strategy; proprietary short-horizon alpha"},
        {"Manager / firm": "HRT / Jump / Optiver / Virtu", "Publicly associated strategies": "market making, HFT, execution and microstructure alpha"},
    ]
    add_table(s, manager_rows, 0.65, 1.35, 12.0, 5.35, 2, 8.0)

    s = new_slide("Five-Year Performance Lens", "Calendar-year returns, 2021-2025, from public mutual fund/ETF proxies.")
    heatmap_shapes(s, perf)
    add_text(s, "Read as public product/proxy evidence, not the return of every fund using the strategy.", 1.0, 6.68, 11.2, 0.22, 8.5, MUTED)

    s = new_slide("Best Public Proxies", "CAGR over 2021-2025; AQR market-neutral/style-premia proxies led this sample.")
    s.shapes.add_picture(str(IMG / "cagr_ranking.png"), Inches(0.8), Inches(1.35), width=Inches(11.7))

    s = new_slide("Regime Read-Through", "What worked changed sharply by macro regime.")
    regimes = [
        ("2021", "Risk-on reopening", "Equity beta, value and quality worked; many hedged alts trailed stocks."),
        ("2022", "Inflation shock", "CTAs/managed futures and market neutral worked as rates/FX/commodities trended."),
        ("2023", "AI rebound", "Long-only equity factors recovered; trend following was mixed after reversals."),
        ("2024", "Continuation", "Momentum/quality and market neutral stayed strong; merger arb improved slowly."),
        ("2025", "Broadening", "Value, ARP and managed futures proxies had another solid year in this data set."),
    ]
    for i, (yr, regime, msg) in enumerate(regimes):
        y = 1.35 + i * 1.02
        panel(s, 0.75, y, 11.85, 0.78, RGBColor(13, 25, 40))
        add_text(s, yr, 0.95, y + 0.16, 0.8, 0.22, 15, CYAN, True)
        add_text(s, regime, 1.8, y + 0.14, 2.3, 0.24, 12, TEXT, True)
        add_text(s, msg, 4.25, y + 0.15, 7.85, 0.24, 10.3, MUTED)

    s = new_slide("Strategy-by-Strategy View", "Condensed research notes from the 5-year proxy study.")
    notes = [
        ("Equity market neutral", "Strong 2021-2025 in public AQR/BlackRock-type proxies; benefits from stock dispersion and controlled beta."),
        ("Style / alternative premia", "Very strong recent five years after a difficult 2015-2020 decade; still crowded and model-sensitive."),
        ("Managed futures / CTA", "Best crisis diversifier in 2022; softer when trends reverse, but useful portfolio convexity."),
        ("Risk parity", "Weak five-year result because 2022 broke stock/bond diversification; improved when bonds stabilized."),
        ("Merger / diversified arb", "Low volatility but modest return; deal breaks, spreads and cash rates dominate."),
        ("Options / vol premia", "Put-write proxy positive, but hidden crash risk; results depend on hedging and sizing."),
    ]
    for i, (name, msg) in enumerate(notes):
        x = 0.75 + (i % 2) * 6.05
        y = 1.35 + (i // 2) * 1.65
        panel(s, x, y, 5.55, 1.25)
        add_text(s, name, x + 0.25, y + 0.18, 5.05, 0.25, 13.5, GREEN if i < 3 else AMBER, True)
        add_text(s, msg, x + 0.25, y + 0.55, 5.05, 0.45, 9.2, MUTED)

    s = new_slide("Due Diligence Questions", "What to ask before allocating to a quant strategy.")
    qs = [
        "Signal half-life: milliseconds, days, months or years?",
        "Capacity: what AUM level compresses alpha?",
        "Crowding: how many funds are likely trading the same signal?",
        "Cost model: fees, financing, borrow, slippage, market impact?",
        "Risk: leverage, drawdown, convexity, tail loss, liquidity mismatch?",
        "Attribution: beta, factor, carry, volatility, selection, execution?",
        "Model governance: overfitting controls, research decay, kill rules?",
        "Operational edge: data rights, compute, execution, talent retention?",
    ]
    for i, q in enumerate(qs):
        panel(s, 0.75 + (i % 2) * 6.0, 1.35 + (i // 2) * 1.15, 5.55, 0.78, PANEL2)
        add_text(s, q, 1.0 + (i % 2) * 6.0, 1.55 + (i // 2) * 1.15, 5.05, 0.22, 10.8, TEXT)

    s = new_slide("Bottom Line", "Quant allocation should be built as a portfolio of different engines, not a single label.")
    add_text(s, "Best recent public proxies: equity market neutral, style premia, alternative risk premia, and managed futures.", 0.9, 1.55, 11.5, 0.5, 22, TEXT, True)
    bullet_list(s, [
        "For diversification: combine CTA/trend + market-neutral equity + diversified style premia.",
        "For equity enhancement: use factor/quality/momentum/value models, but accept equity beta.",
        "For liquidity/microstructure: market making/HFT edges are powerful but usually inaccessible to outside LPs.",
        "For 2026 diligence: focus on capacity, crowding, drawdown behavior and whether returns survive after fees/costs.",
    ], 1.0, 2.55, 11.2, 3.1, 16)

    s = new_slide("Sources + Method", "Key references used for taxonomy, manager mapping and public proxy performance.")
    source_lines = [f"{name}: {url}" for name, url in SOURCES]
    bullet_list(s, source_lines, 0.8, 1.25, 12.0, 5.7, 8.0, MUTED)

    path = OUT / "quant-fund-strategies-research-deck.pptx"
    prs.save(path)
    return path


def build_report(perf: pd.DataFrame):
    years = [str(y) for y in range(2021, 2026)]
    top = perf.sort_values("cagr_2021_2025", ascending=False)
    perf_md = "| Proxy | Ticker | 2021 | 2022 | 2023 | 2024 | 2025 | CAGR | Cum. |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|\n"
    for _, r in top.iterrows():
        perf_md += f"| {r['proxy']} | {r['ticker']} | " + " | ".join(pct(r[y]) for y in years) + f" | {pct(r['cagr_2021_2025'])} | {pct(r['cum_2021_2025'])} |\n"

    strat_md = "| Strategy | Core idea | Who uses it |\n|---|---|---|\n"
    for a, b, c in STRATEGIES:
        strat_md += f"| {a} | {b} | {c} |\n"

    content = dedent(f"""
    # Quant Fund Strategies Research

    Date: 2026-05-24  
    Scope: public research plus public mutual fund/ETF proxies for 2021-2025 calendar-year performance.

    ## Executive summary

    Quant fund is not a single strategy. It is a way of making investment decisions with data, models, portfolio construction, execution and risk rules. The strategy universe breaks into six major engines: directional trend/macro, market-neutral alpha, factor/style premia, relative-value/arbitrage, options/volatility, and market making/HFT.

    Over the 2021-2025 period, the strongest public proxies in this sample were equity market neutral, style premia, alternative risk premia and managed futures. The key regime result is 2022: when equities and bonds both sold off, managed futures and market-neutral strategies were unusually useful. Risk parity lagged because its stock/bond diversification engine was hit by the inflation/rate shock.

    ## Strategy universe and users

    {strat_md}

    ## 5-year performance proxy table

    Method: total-return-like adjusted close data from Yahoo Finance via `yfinance`, using the first and last available trading day of each calendar year. CAGR and cumulative return are computed from available daily adjusted close from January 2021 through December 2025. These are public products/proxies, not private fund returns.

    {perf_md}

    ## Interpretation by strategy

    - Equity market neutral: strong recent public results. Works best when stock dispersion is high and short book/hedges are controlled. It is still exposed to model crowding and shorting/financing costs.
    - Style premia / alternative risk premia: strong 2021-2025, especially after the difficult pre-2021 factor cycle. Returns are sensitive to factor definitions, leverage, fees and crowding.
    - Managed futures / CTA: valuable in 2022 because rates, currencies and commodities trended. Can lag when trends reverse or realized trend strength is low.
    - Risk parity: poor five-year proxy because 2022 hurt stocks and bonds simultaneously. It still has a role as balanced beta, but not as crisis alpha in inflation shocks.
    - Merger/diversified arbitrage: lower-volatility but modest returns. Spread width, regulatory timing, deal breaks and cash rates matter more than broad equity direction.
    - Options/volatility premia: put-write proxy was positive, but tail risk is structurally important. Manager quality depends on hedging, sizing and crisis controls.
    - HFT/market making/stat arb: public return proxies are weak because most firms are private. The right diligence lens is capacity, latency/data/execution advantage and drawdown controls, not mutual fund returns.

    ## Sources

    """ ).strip()
    for name, url in SOURCES:
        content += f"\n- {name}: {url}"
    content += "\n"
    path = NOTES / "quant-fund-strategies-research.md"
    path.write_text(content, encoding="utf-8")
    return path


def main():
    perf = fetch_returns()
    make_charts(perf)
    report = build_report(perf)
    deck = build_ppt(perf)
    print(f"report={report}")
    print(f"deck={deck}")
    print(f"data={DATA / 'quant_strategy_proxy_returns_2021_2025.csv'}")


if __name__ == "__main__":
    main()
