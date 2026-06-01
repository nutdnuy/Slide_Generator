# Slide Generator — Codex Skills Workspace

A skills workspace for Codex focused on generating high-quality presentations, financial analysis, and visual content. Drop this folder into Codex and get 70+ specialized skills ready to use.

## What This Is

This repository is a **Codex skills workspace** — a collection of agent instructions (skills) that Codex can invoke to complete complex tasks autonomously. Each skill in `skills/` defines a workflow for a specific type of output.

The primary focus is **slide and visual content generation**, plus a full suite of **financial analysis skills**.

## Getting Started

1. Clone this repo and open it in Codex
2. Claude will read `AGENTS.md` automatically and know which skills to use
3. Give a task in plain language — Claude routes to the right skill:

```
"สร้าง pitch deck สำหรับ startup FinTech ของผม 10 สไลด์"
"ทำ infographic เรื่อง AI in Healthcare"
"สร้าง DCF model สำหรับ ADVANC"
"ทำ morning note สำหรับ SET วันนี้"
```

## Core Skills

### Presentation & Visual
| Skill | Description |
|---|---|
| `create-slide-decks` | Full presentation decks — pitch, lesson, workshop, executive |
| `create-info-graphics` | Infographic and social carousel images |
| `create-consulting-decks` | Consulting-style structured decks |
| `create-daily-market-decks` | Daily market update slides |
| `deck-refresh` | Refresh and redesign existing decks |
| `pptx-author` | Low-level PPTX authoring with full formatting control |

### Financial Analysis
| Skill | Description |
|---|---|
| `dcf-model` | Discounted Cash Flow valuation |
| `lbo-model` | Leveraged Buyout model |
| `comps-analysis` | Comparable company analysis |
| `3-statement-model` | P&L, Balance Sheet, Cash Flow model |
| `earnings-analysis` | Earnings results breakdown |
| `morning-note` | Daily market morning note |
| `equity-research` | Full equity research report |
| `pitch-deck` | Investment pitch deck |
| `ic-memo` | Investment committee memo |
| `macro-rates-monitor` | Macro and rates monitoring |

### Research & Workflow
| Skill | Description |
|---|---|
| `idea-generation` | Investment idea generation |
| `thesis-tracker` | Track and update investment theses |
| `deal-screening` | Screen investment opportunities |
| `portfolio-monitoring` | Portfolio monitoring and reporting |
| `skill-creator` | Create new skills for this workspace |

## Repository Structure

```
skills/           # 70+ skill definitions (SKILL.md per skill)
scripts/          # Example generation scripts (JS & Python)
materials/        # Sample materials and templates
assets/           # Shared assets (logos, fonts, design tokens)
outputs/          # Generated files (gitignored — stays local)
notes/            # Working notes (gitignored — stays local)
AGENTS.md         # Agent routing instructions for Codex
```

## How Skills Work

Each skill lives in `skills/<skill-name>/SKILL.md` and contains:
- **Scope** — what the skill handles
- **Workflow** — step-by-step instructions Claude follows
- **Output spec** — where files are saved, naming conventions, format requirements

Codex reads the relevant SKILL.md automatically when you give a matching task.

## Example Scripts

`scripts/` contains real generation scripts used to produce past decks:

- `generate_hedge_fund_strategy_atlas.js` — Hedge fund strategy atlas deck
- `generate_dynamic_portfolio_allocation_deck.js` — Portfolio allocation lesson
- `build_quant_research_deck.py` — Quant research presentation
- `generate_02_sprintai_design_system.js` — Design system deck

Use these as starting points or reference for building your own.

## Requirements

- [Codex](https://claude.ai/code) — runs the skills
- Node.js 18+ (for JS-based generation scripts)
- Python 3.10+ (for Python-based scripts)

## Adding New Skills

Use the `skill-creator` skill:
```
"สร้าง skill ใหม่ชื่อ 'weekly-review' สำหรับสรุปพอร์ตรายสัปดาห์"
```

Or copy an existing skill folder and edit `SKILL.md` to fit your workflow.

## License

MIT
