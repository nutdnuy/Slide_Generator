from __future__ import annotations

import json
import shutil
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw
from statsmodels.tsa.stattools import adfuller


PROJECT = "cointegration-vs-correlation"
ROOT = Path(__file__).resolve().parents[1]
FINAL_DIR = ROOT / "assets" / "images" / PROJECT / "final"
ORIGINAL_DIR = ROOT / "assets" / "images" / PROJECT / "originals"
NOTES_DIR = ROOT / "notes"
DATA_DIR = ROOT / "outputs" / "data"


def ar1_noise(rng: np.random.Generator, n: int, phi: float, sigma: float) -> np.ndarray:
    values = np.zeros(n)
    shocks = rng.normal(0, sigma, n)
    for i in range(1, n):
        values[i] = phi * values[i - 1] + shocks[i]
    return values


def build_series(n: int = 280) -> dict[str, np.ndarray]:
    # Left: cointegrated levels via a stationary spread, but noisy spread makes
    # one-period returns close to uncorrelated.
    rng_left = np.random.default_rng(9)
    x_coint = np.cumsum(rng_left.normal(0, 1, n))
    spread_coint = ar1_noise(rng_left, n=n, phi=0.65, sigma=8.0)
    y_coint = x_coint + spread_coint

    # Right: highly correlated innovations, but two stochastic trends remain.
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
    ax.set_title(title, loc="left", fontsize=13, fontweight="bold", color="#172033", pad=8)
    ax.grid(True, color="#D8DEE9", linewidth=0.8, alpha=0.75)
    ax.set_facecolor("#FFFFFF")
    for spine in ax.spines.values():
        spine.set_color("#CCD3DD")
        spine.set_linewidth(0.8)
    ax.tick_params(colors="#4A5568", labelsize=9)


def annotate_metric(ax: plt.Axes, text: str, color: str) -> None:
    ax.text(
        0.985,
        0.93,
        text,
        transform=ax.transAxes,
        ha="right",
        va="top",
        fontsize=10.5,
        color="#111827",
        bbox={
            "boxstyle": "round,pad=0.35,rounding_size=0.12",
            "facecolor": color,
            "edgecolor": "none",
            "alpha": 0.92,
        },
    )


def render_case(
    *,
    output_path: Path,
    title: str,
    subtitle: str,
    x: np.ndarray,
    y: np.ndarray,
    spread: np.ndarray,
    line_colors: tuple[str, str],
    spread_color: str,
    metric_fill: str,
    return_corr: float,
    adf_p: float,
    interpretation: str,
    y_label: str,
) -> None:
    t = np.arange(len(x))
    fig = plt.figure(figsize=(16, 9), dpi=150)
    fig.patch.set_facecolor("#F5F7FB")
    grid = fig.add_gridspec(
        3,
        2,
        height_ratios=[0.46, 1.42, 1.0],
        hspace=0.42,
        wspace=0.18,
        left=0.055,
        right=0.965,
        top=0.93,
        bottom=0.08,
    )

    header = fig.add_subplot(grid[0, :])
    header.axis("off")
    header.text(
        0.0,
        0.78,
        title,
        fontsize=25,
        fontweight="bold",
        color="#101828",
        ha="left",
        va="center",
    )
    header.text(
        0.0,
        0.26,
        subtitle,
        fontsize=12.5,
        color="#475467",
        ha="left",
        va="center",
    )

    ax_level = fig.add_subplot(grid[1, :])
    ax_scatter = fig.add_subplot(grid[2, 0])
    ax_spread = fig.add_subplot(grid[2, 1])

    setup_axis(ax_level, "Level series")
    ax_level.plot(t, x, color=line_colors[0], linewidth=2.35, label="X")
    ax_level.plot(t, y, color=line_colors[1], linewidth=1.95, label=y_label)
    ax_level.legend(loc="upper left", frameon=False, fontsize=10)
    ax_level.set_ylabel("Level", fontsize=9, color="#4A5568")
    annotate_metric(ax_level, f"return corr = {return_corr:.2f}", metric_fill)

    setup_axis(ax_scatter, "Returns scatter")
    ax_scatter.scatter(
        np.diff(x),
        np.diff(y),
        s=20,
        color=line_colors[1],
        alpha=0.58,
        edgecolors="none",
    )
    ax_scatter.axhline(0, color="#98A2B3", linewidth=0.9)
    ax_scatter.axvline(0, color="#98A2B3", linewidth=0.9)
    ax_scatter.set_xlabel("Delta X", fontsize=9, color="#4A5568")
    ax_scatter.set_ylabel("Delta Y", fontsize=9, color="#4A5568")

    setup_axis(ax_spread, "Spread: Y - X")
    ax_spread.plot(t, spread, color=spread_color, linewidth=2.0)
    ax_spread.axhline(0, color="#344054", linewidth=1.0)
    if adf_p < 0.05:
        ax_spread.axhline(np.std(spread), color="#98A2B3", linestyle="--", linewidth=0.9)
        ax_spread.axhline(-np.std(spread), color="#98A2B3", linestyle="--", linewidth=0.9)
    else:
        ax_spread.axhline(np.mean(spread), color="#98A2B3", linestyle="--", linewidth=0.9)
    ax_spread.set_xlabel("Time", fontsize=9, color="#4A5568")
    ax_spread.set_ylabel("Y - X", fontsize=9, color="#4A5568")
    annotate_metric(ax_spread, f"ADF p = {adf_p:.3g}", metric_fill)

    fig.text(
        0.055,
        0.024,
        interpretation,
        fontsize=10.8,
        color="#667085",
    )

    fig.savefig(output_path, facecolor=fig.get_facecolor())
    plt.close(fig)


def make_contact_sheet(image_paths: list[Path], output_path: Path) -> None:
    thumbs = []
    for path in image_paths:
        image = Image.open(path).convert("RGB")
        image.thumbnail((1160, 653), Image.Resampling.LANCZOS)
        thumbs.append(image.copy())

    sheet = Image.new("RGB", (2400, 780), "#F5F7FB")
    draw = ImageDraw.Draw(sheet)
    labels = ["01 Cointegration Without Correlation", "02 Correlation Without Cointegration"]
    for index, thumb in enumerate(thumbs):
        x = 40 + index * 1200
        y = 70
        sheet.paste(thumb, (x, y))
        draw.text((x, 30), labels[index], fill="#101828")
    sheet.save(output_path)


def save_chart() -> dict[str, float]:
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
        "left_return_correlation": left_return_corr,
        "left_spread_adf_pvalue": left_adf,
        "right_return_correlation": right_return_corr,
        "right_spread_adf_pvalue": right_adf,
    }

    blue = "#1B67D1"
    teal = "#00A7A5"
    orange = "#E36B2C"
    magenta = "#C23A73"
    green_fill = "#DDF7E8"
    red_fill = "#FFE6DF"

    output_1 = FINAL_DIR / "info-01.png"
    output_2 = FINAL_DIR / "info-02.png"
    render_case(
        output_path=output_1,
        title="Cointegration Without Return Correlation",
        subtitle="Low one-period return correlation, but the long-run spread Y - X is stationary.",
        x=series["x_coint"],
        y=series["y_coint"],
        spread=series["spread_coint"],
        line_colors=(blue, teal),
        spread_color="#087F5B",
        metric_fill=green_fill,
        return_corr=left_return_corr,
        adf_p=left_adf,
        interpretation="Key read: the two levels share a long-run equilibrium even when short-term returns do not move together.",
        y_label="Y = X + stationary spread",
    )
    render_case(
        output_path=output_2,
        title="Correlation Without Cointegration",
        subtitle="High one-period return correlation, but the spread Y - X behaves like a non-stationary process.",
        x=series["x_corr"],
        y=series["y_corr"],
        spread=series["spread_corr"],
        line_colors=(orange, magenta),
        spread_color="#B42318",
        metric_fill=red_fill,
        return_corr=right_return_corr,
        adf_p=right_adf,
        interpretation="Key read: short-term co-movement is strong, but there is no stable spread to mean-revert around.",
        y_label="Y with correlated shocks",
    )

    for index, output_path in enumerate([output_1, output_2], start=1):
        shutil.copy2(output_path, ORIGINAL_DIR / f"info-{index:02d}.png")

    contact_path = ROOT / "assets" / "images" / PROJECT / "contact-sheet.png"
    make_contact_sheet([output_1, output_2], contact_path)

    metrics_path = DATA_DIR / f"{PROJECT}-metrics.json"
    metrics_path.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")

    notes_path = NOTES_DIR / f"{PROJECT}-outline.md"
    notes_path.write_text(
        "\n".join(
            [
                "# Cointegration vs Correlation Chart",
                "",
                "- Format: two standalone 16:9 chart images.",
                "- Image 01: X is a random walk, Y = X + stationary AR(1) spread. The spread is cointegrated even though return correlation is intentionally low.",
                "- Image 02: X and Y are random walks with highly correlated innovations. Returns are highly correlated, but the spread is non-stationary.",
                f"- Left return correlation: {left_return_corr:.3f}; spread ADF p-value: {left_adf:.3g}.",
                f"- Right return correlation: {right_return_corr:.3f}; spread ADF p-value: {right_adf:.3g}.",
                "",
            ]
        ),
        encoding="utf-8",
    )

    return metrics


if __name__ == "__main__":
    result = save_chart()
    print(json.dumps(result, indent=2))
