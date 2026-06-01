from __future__ import annotations

import json
import shutil
from pathlib import Path
from textwrap import fill

import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager as fm
from PIL import Image, ImageDraw, ImageFont
from statsmodels.tsa.stattools import adfuller


PROJECT = "cointegration-pair-trade-article"
ROOT = Path(__file__).resolve().parents[1]
FINAL_DIR = ROOT / "assets" / "images" / PROJECT / "final"
ORIGINAL_DIR = ROOT / "assets" / "images" / PROJECT / "originals"
NOTES_DIR = ROOT / "notes"
DATA_DIR = ROOT / "outputs" / "data"

SARABUN_FONT = Path(
    "/System/Library/AssetsV2/com_apple_MobileAsset_Font7/"
    "bff515501313f56409358f8994642696000d2dbc.asset/AssetData/Sarabun.ttc"
)


def configure_fonts() -> None:
    if SARABUN_FONT.exists():
        fm.fontManager.addfont(str(SARABUN_FONT))
        plt.rcParams["font.family"] = "Sarabun"
    else:
        plt.rcParams["font.family"] = "Arial Unicode MS"
    plt.rcParams["axes.unicode_minus"] = False


def ar1_noise(rng: np.random.Generator, n: int, phi: float, sigma: float) -> np.ndarray:
    values = np.zeros(n)
    shocks = rng.normal(0, sigma, n)
    for i in range(1, n):
        values[i] = phi * values[i - 1] + shocks[i]
    return values


def build_series(n: int = 280) -> dict[str, np.ndarray]:
    rng_left = np.random.default_rng(9)
    x_coint = np.cumsum(rng_left.normal(0, 1, n))
    spread_coint = ar1_noise(rng_left, n=n, phi=0.65, sigma=8.0)
    y_coint = x_coint + spread_coint

    rng_corr = np.random.default_rng(1008)
    rho = 0.90
    dx = rng_corr.normal(0, 1, n)
    dy = rho * dx + np.sqrt(1 - rho**2) * rng_corr.normal(0, 1, n) + 0.025
    x_corr = np.cumsum(dx)
    y_corr = np.cumsum(dy)

    return {
        "x_coint": x_coint,
        "y_coint": y_coint,
        "spread_coint": y_coint - x_coint,
        "x_corr": x_corr,
        "y_corr": y_corr,
        "spread_corr": y_corr - x_corr,
    }


def corr(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.corrcoef(a, b)[0, 1])


def adf_pvalue(values: np.ndarray) -> float:
    return float(adfuller(values, regression="c", autolag="AIC")[1])


def setup_axis(ax: plt.Axes, title: str) -> None:
    ax.set_title(title, loc="left", fontsize=17, fontweight="bold", color="#172033", pad=8)
    ax.grid(True, color="#D8DEE9", linewidth=0.8, alpha=0.78)
    ax.set_facecolor("#FFFFFF")
    for spine in ax.spines.values():
        spine.set_color("#CCD3DD")
        spine.set_linewidth(0.8)
    ax.tick_params(colors="#4A5568", labelsize=11)


def metric_box(ax: plt.Axes, text: str, fill_color: str, x: float = 0.985, y: float = 0.93) -> None:
    ax.text(
        x,
        y,
        text,
        transform=ax.transAxes,
        ha="right",
        va="top",
        fontsize=15,
        color="#111827",
        bbox={
            "boxstyle": "round,pad=0.35,rounding_size=0.12",
            "facecolor": fill_color,
            "edgecolor": "none",
            "alpha": 0.95,
        },
    )


def draw_takeaway(ax: plt.Axes, text: str, face_color: str, edge_color: str) -> None:
    ax.axis("off")
    ax.text(
        0.02,
        0.5,
        fill(text, width=70),
        ha="left",
        va="center",
        fontsize=18,
        color="#172033",
        linespacing=1.25,
        bbox={
            "boxstyle": "round,pad=0.55,rounding_size=0.18",
            "facecolor": face_color,
            "edgecolor": edge_color,
            "linewidth": 1.4,
        },
    )


def render_article_figure(
    *,
    output_path: Path,
    title: str,
    subtitle: str,
    badge: str,
    x: np.ndarray,
    y: np.ndarray,
    spread: np.ndarray,
    colors: tuple[str, str, str],
    return_corr: float,
    adf_p: float,
    takeaway: str,
    verdict: str,
    verdict_color: str,
    spread_reference: str,
) -> None:
    t = np.arange(len(x))
    fig = plt.figure(figsize=(16, 9), dpi=150)
    fig.patch.set_facecolor("#F4F7FB")
    grid = fig.add_gridspec(
        4,
        2,
        height_ratios=[0.46, 1.15, 0.9, 0.36],
        hspace=0.48,
        wspace=0.18,
        left=0.055,
        right=0.965,
        top=0.94,
        bottom=0.07,
    )

    header = fig.add_subplot(grid[0, :])
    header.axis("off")
    header.text(
        0,
        0.82,
        title,
        ha="left",
        va="center",
        fontsize=26,
        fontweight="bold",
        color="#101828",
    )
    header.text(
        0,
        0.28,
        subtitle,
        ha="left",
        va="center",
        fontsize=16,
        color="#475467",
    )
    header.text(
        0.985,
        0.78,
        badge,
        ha="right",
        va="center",
        fontsize=14,
        color="#101828",
        bbox={
            "boxstyle": "round,pad=0.42,rounding_size=0.12",
            "facecolor": "#FFFFFF",
            "edgecolor": "#D0D5DD",
            "linewidth": 1.2,
        },
    )

    ax_level = fig.add_subplot(grid[1, :])
    ax_scatter = fig.add_subplot(grid[2, 0])
    ax_spread = fig.add_subplot(grid[2, 1])
    ax_note = fig.add_subplot(grid[3, :])

    setup_axis(ax_level, "ราคา / Level series")
    ax_level.plot(t, x, color=colors[0], linewidth=2.5, label="Asset X")
    ax_level.plot(t, y, color=colors[1], linewidth=2.05, label="Asset Y")
    legend = ax_level.legend(loc="upper left", frameon=True, fontsize=12)
    legend.get_frame().set_facecolor("#FFFFFF")
    legend.get_frame().set_edgecolor("#D0D5DD")
    legend.get_frame().set_alpha(0.88)
    ax_level.set_ylabel("Level", fontsize=12, color="#4A5568")
    metric_box(ax_level, f"Return corr = {return_corr:.2f}", "#E6F4EA" if adf_p < 0.05 else "#FFE8E1")
    ax_level.text(
        0.985,
        0.12,
        verdict,
        transform=ax_level.transAxes,
        ha="right",
        va="bottom",
        fontsize=15,
        fontweight="bold",
        color="#101828",
        bbox={
            "boxstyle": "round,pad=0.42,rounding_size=0.12",
            "facecolor": verdict_color,
            "edgecolor": "none",
            "alpha": 0.92,
        },
    )

    setup_axis(ax_scatter, "Return scatter")
    ax_scatter.scatter(np.diff(x), np.diff(y), s=23, color=colors[1], alpha=0.6, edgecolors="none")
    ax_scatter.axhline(0, color="#98A2B3", linewidth=0.9)
    ax_scatter.axvline(0, color="#98A2B3", linewidth=0.9)
    ax_scatter.set_xlabel("Delta X", fontsize=12, color="#4A5568")
    ax_scatter.set_ylabel("Delta Y", fontsize=12, color="#4A5568")

    setup_axis(ax_spread, "Spread: Y - X")
    ax_spread.plot(t, spread, color=colors[2], linewidth=2.15)
    ax_spread.axhline(0, color="#344054", linewidth=1.05)
    if spread_reference == "stationary":
        ax_spread.axhline(np.std(spread), color="#98A2B3", linestyle="--", linewidth=1.0)
        ax_spread.axhline(-np.std(spread), color="#98A2B3", linestyle="--", linewidth=1.0)
    else:
        ax_spread.axhline(np.mean(spread), color="#98A2B3", linestyle="--", linewidth=1.0)
    ax_spread.set_xlabel("Time", fontsize=12, color="#4A5568")
    ax_spread.set_ylabel("Y - X", fontsize=12, color="#4A5568")
    metric_box(ax_spread, f"ADF p = {adf_p:.3g}", "#E6F4EA" if adf_p < 0.05 else "#FFE8E1")

    draw_takeaway(
        ax_note,
        takeaway,
        face_color="#FFFFFF",
        edge_color="#D0D5DD",
    )

    fig.text(
        0.965,
        0.022,
        "Synthetic data for explaining Pair Trade logic",
        ha="right",
        va="center",
        fontsize=9.5,
        color="#98A2B3",
    )

    fig.savefig(output_path, facecolor=fig.get_facecolor())
    plt.close(fig)


def make_contact_sheet(image_paths: list[Path], output_path: Path) -> None:
    thumbs = []
    for path in image_paths:
        image = Image.open(path).convert("RGB")
        image.thumbnail((1160, 653), Image.Resampling.LANCZOS)
        thumbs.append(image.copy())

    sheet = Image.new("RGB", (2400, 780), "#F4F7FB")
    draw = ImageDraw.Draw(sheet)
    if SARABUN_FONT.exists():
        label_font = ImageFont.truetype(str(SARABUN_FONT), 34)
    else:
        label_font = ImageFont.load_default()

    labels = [
        "01 Cointegration แต่ Return Correlation ต่ำ",
        "02 Correlation สูง แต่ไม่ Cointegrated",
    ]
    for index, thumb in enumerate(thumbs):
        x = 40 + index * 1200
        sheet.paste(thumb, (x, 82))
        draw.text((x, 30), labels[index], fill="#101828", font=label_font)
    sheet.save(output_path)


def save_article_figures() -> dict[str, float]:
    configure_fonts()
    FINAL_DIR.mkdir(parents=True, exist_ok=True)
    ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    series = build_series()
    left_return_corr = corr(np.diff(series["x_coint"]), np.diff(series["y_coint"]))
    right_return_corr = corr(np.diff(series["x_corr"]), np.diff(series["y_corr"]))
    left_adf = adf_pvalue(series["spread_coint"])
    right_adf = adf_pvalue(series["spread_corr"])
    metrics = {
        "cointegration_without_return_correlation": {
            "return_correlation": left_return_corr,
            "spread_adf_pvalue": left_adf,
        },
        "correlation_without_cointegration": {
            "return_correlation": right_return_corr,
            "spread_adf_pvalue": right_adf,
        },
    }

    output_1 = FINAL_DIR / "info-01.png"
    output_2 = FINAL_DIR / "info-02.png"
    render_article_figure(
        output_path=output_1,
        title="1) Cointegration แต่ Return Correlation ต่ำ",
        subtitle="สำหรับ Pair Trade สิ่งสำคัญคือ spread ต้องนิ่งและมีแรงดึงกลับ ไม่ใช่แค่ราคาขยับพร้อมกันรายวัน",
        badge="ใช้กับ Mean Reversion Pair Trade ได้",
        x=series["x_coint"],
        y=series["y_coint"],
        spread=series["spread_coint"],
        colors=("#1B67D1", "#00A7A5", "#087F5B"),
        return_corr=left_return_corr,
        adf_p=left_adf,
        verdict="Spread stationary",
        verdict_color="#DDF7E8",
        spread_reference="stationary",
        takeaway="ภาพนี้บอกว่า return ระยะสั้นแทบไม่สัมพันธ์กัน แต่ราคา 2 ตัวมี long-run relationship เพราะ spread กลับเข้าค่าเฉลี่ยได้",
    )
    render_article_figure(
        output_path=output_2,
        title="2) Correlation สูง แต่ไม่ Cointegrated",
        subtitle="Return อาจขยับไปทางเดียวกันแรงมาก แต่ถ้า spread drift ได้เรื่อย ๆ ก็ไม่มี anchor สำหรับ pair trade",
        badge="เสี่ยงสำหรับ Mean Reversion Pair Trade",
        x=series["x_corr"],
        y=series["y_corr"],
        spread=series["spread_corr"],
        colors=("#E36B2C", "#C23A73", "#B42318"),
        return_corr=right_return_corr,
        adf_p=right_adf,
        verdict="Spread non-stationary",
        verdict_color="#FFE6DF",
        spread_reference="drifting",
        takeaway="ภาพนี้บอกว่า return correlation สูงไม่ได้แปลว่า pair trade ได้ เพราะ spread ไม่กลับค่าเฉลี่ยและอาจลากขาดทุนต่อเนื่อง",
    )

    for index, output_path in enumerate([output_1, output_2], start=1):
        shutil.copy2(output_path, ORIGINAL_DIR / f"info-{index:02d}.png")

    contact_path = ROOT / "assets" / "images" / PROJECT / "contact-sheet.png"
    make_contact_sheet([output_1, output_2], contact_path)

    metrics_path = DATA_DIR / f"{PROJECT}-metrics.json"
    metrics_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    notes_path = NOTES_DIR / f"{PROJECT}-outline.md"
    notes_path.write_text(
        "\n".join(
            [
                "# Cointegration in Pair Trade Article Figures",
                "",
                "- Format: two standalone 16:9 article figures in Thai.",
                "- Figure 01: Cointegration despite low return correlation. Spread is stationary and mean-reverting.",
                "- Figure 02: High return correlation without cointegration. Spread is non-stationary/drifting.",
                f"- Figure 01 return correlation: {left_return_corr:.3f}; spread ADF p-value: {left_adf:.3g}.",
                f"- Figure 02 return correlation: {right_return_corr:.3f}; spread ADF p-value: {right_adf:.3g}.",
                "",
            ]
        ),
        encoding="utf-8",
    )

    return {
        "figure_01_return_correlation": left_return_corr,
        "figure_01_spread_adf_pvalue": left_adf,
        "figure_02_return_correlation": right_return_corr,
        "figure_02_spread_adf_pvalue": right_adf,
    }


if __name__ == "__main__":
    print(json.dumps(save_article_figures(), ensure_ascii=False, indent=2))
