# Codex Build Brief

Use this brief during Module 5. The goal is to have Codex build a local dashboard from a CSV file, not a production trading system.

## Project

Build a single-file local HTML dashboard named `investor-dashboard.html`.

## User

Non-code investor who wants to review a watchlist and thesis notes.

## Input

CSV file with these columns:

- `symbol`
- `name`
- `asset_class`
- `theme`
- `score`
- `risk_level`
- `thesis`
- `next_action`
- `notes`

## Required Behavior

- Load a CSV file from the browser using file upload.
- Show all rows in a readable table/card layout.
- Display score, risk level, thesis, next action, and notes.
- Provide risk filter.
- Provide sort by score.
- Provide search by symbol/name/theme.
- Export current notes as a text file.
- Show a visible disclaimer: this tool is for research workflow, not buy/sell advice.

## Constraints

- No backend.
- No API keys.
- No login.
- No live price data.
- No package install.
- Must work by opening the HTML file in a browser.

## Test Cases

- Import the sample `watchlist.csv`.
- Confirm all rows appear.
- Filter `High` risk and confirm lower-risk rows are hidden.
- Sort by score and confirm highest score appears first.
- Search `AI` and confirm only relevant rows remain.
- Export notes and confirm a `.txt` file downloads.
- Confirm no text says “buy”, “sell”, or “recommended trade”.

