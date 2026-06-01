---
name: create-daily-market-decks
description: Create presentation-ready daily market update decks, morning market briefs, end-of-day market decks, investment committee market dashboards, and portfolio briefing slides with Alpha Vantage data, market charts, cross-asset performance tables, return/volatility graphs, and concise presenter notes. Use when the user asks for daily market slides, market presentation, market update PPTX, stock market briefing, macro market deck, or Alpha Vantage-powered charts.
---

# Create Daily Market Decks

## Overview

Create a daily market deck that can be presented every trading day. The output should combine current market data, deterministic charts, concise takeaways, source notes, and a PowerPoint file.

Default to an **evidence-first workflow**: fetch market data, compute returns and risk metrics, build charts, write a short talk track, then render a PPTX. Do not store API keys in repo files, notes, cache, screenshots, or final slides.

## Workflow

1. Clarify or assume the brief: audience, market region, symbols, language, deck length, and time of day.
2. Fetch market data from Alpha Vantage using `ALPHAVANTAGE_API_KEY` or `--api-key`.
3. Build a small market narrative: risk tone, leaders/laggards, cross-asset signal, and watch items.
4. Render charts that fit the story:
   - snapshot table with 1D, 5D, 20D, 60D returns
   - normalized performance line chart
   - cross-asset return bar chart
   - return versus volatility scatter
   - watchlist / presenter talk track
5. Export:
   - `outputs/<project-name>.pptx`
   - `assets/images/<project-name>/slide-01.png`, etc.
   - `notes/<project-name>-market-data.json`
   - `notes/<project-name>-outline.md`
6. QA before delivery: latest available trading date, API errors/rate limits, chart labels, slide order, source notes, and whether any stale cache was used.

## Quick Start

Use the bundled builder when the user wants a repeatable daily deck:

```bash
ALPHAVANTAGE_API_KEY="..." node skills/create-daily-market-decks/scripts/build_daily_market_deck.js \
  --symbols SPY,QQQ,TLT,GLD \
  --project-name daily-market-us-test
```

Useful options:

- `--symbols SPY,QQQ,TLT,GLD` chooses market proxies.
- `--language en` or `--language th` changes major labels and presenter notes.
- `--title "Daily Market Brief"` changes the cover title.
- `--deck-mode short` creates the standard 6-slide daily brief.
- `--deck-mode four-hour --duration-minutes 240` creates an extended workshop/presentation deck with agenda, chart-reading walkthrough, asset deep dives, scenario planning, and discussion slides.
- `--visual-style premium-outlook` renders an editorial investment-outlook style deck with serif display headlines, chapter dividers, figure/exhibit pages, premium visual panels, and source/notes discipline. Use this when the user asks for annual outlook / mid-year outlook / private-bank-report level polish.
- `--output outputs/<name>.pptx` overrides the PPTX path.
- `--images-dir assets/images/<name>` overrides rendered slide image path.
- `--cache-dir notes/.cache/alphavantage` overrides API cache path.
- `--no-cache` forces fresh API calls.
- `--throttle-ms 13000` slows requests to respect free-tier rate limits.

Four-hour example:

```bash
ALPHAVANTAGE_API_KEY="..." node skills/create-daily-market-decks/scripts/build_daily_market_deck.js \
  --symbols SPY,QQQ,TLT,GLD \
  --project-name daily-market-4h-th \
  --title "Daily Market 4-Hour Briefing" \
  --language th \
  --deck-mode four-hour \
  --visual-style premium-outlook \
  --duration-minutes 240 \
  --throttle-ms 13000
```

## Data Rules

- Treat Alpha Vantage daily data as latest available official daily close, not live intraday data.
- Show the exact `data_date` used in the deck.
- If Alpha Vantage returns `Note`, `Information`, or `Error Message`, stop unless a cache file is available and explicitly mark the data as cached.
- Prefer ETF proxies for daily cross-asset decks when the user has not specified symbols:
  - `SPY` US equities
  - `QQQ` US growth / Nasdaq proxy
  - `TLT` long-duration Treasuries
  - `GLD` gold
- Keep market claims descriptive, not investment advice.

## References

Load only when needed:

- `references/alpha-vantage.md` for endpoint behavior, API key handling, and rate-limit handling.
- `references/daily-market-storyline.md` for slide narrative patterns and speaker-note structure.
- `references/chart-rules.md` for chart selection and QA rules.

## Builder Contract

The main script produces a complete PPTX and does not require a manifest. It writes a data JSON that can be inspected or reused.

Input:

- Alpha Vantage API key from env or CLI.
- Symbol list.
- Optional project name, language, title, and output paths.

Output:

- `outputs/<project-name>.pptx`
- `assets/images/<project-name>/slide-01.png` onward, with 6 slides in `short` mode and about 30+ slides in `four-hour` mode
- `notes/<project-name>-market-data.json`
- `notes/<project-name>-outline.md`

## Delivery Checklist

Before responding:

1. Confirm the script ran without API errors.
2. Confirm PPTX zip integrity and slide count.
3. Inspect at least the cover, snapshot, and one chart slide.
4. Report latest data date, output paths, and any limitations such as stale cache or free-tier rate limits.
