# Slide Generator Skills Workspace

Local Codex skills for creating slide decks, consulting presentations, and image-first information graphics.

This repository is intentionally small. It contains only the core Slide Generator skills that should be reused across projects.

## Included Skills

| Skill | Use For |
|---|---|
| `create-slide-decks` | Complete presentation decks, PowerPoint files, lesson decks, pitch decks, workshop decks, report decks, and slide-by-slide visual PPTX outputs. |
| `create-info-graphics` | Standalone infographics, square posts, carousel visuals, social explainers, one-page summaries, and image-first information graphics. |
| `create-consulting-decks` | Consulting-grade strategy decks, executive presentations, board decks, recommendation decks, market-entry decks, and advisory-style PowerPoint outputs. |

## Key Workflow Rule

Before generating visuals, the agent must ask whether text should be:

1. Baked directly into the generated image, or
2. Added later as editable overlay text.

This choice affects visual quality, text accuracy, and editability, so it should be resolved before slide or infographic generation begins.

## Repository Structure

```text
Slide_Generator/
  AGENTS.md
  README.md
  skills/
    create-slide-decks/
      SKILL.md
      agents/
    create-info-graphics/
      SKILL.md
      agents/
    create-consulting-decks/
      SKILL.md
      agents/
      references/
      scripts/
```

Generated work such as `assets/`, `outputs/`, `notes/`, and `sources/` is ignored by git and should stay local unless explicitly needed.

## Usage

Clone or place this repository in a Codex workspace, then ask for a deck or visual output in plain language.

Example prompts:

```text
สร้าง pitch deck สำหรับ startup FinTech 10 สไลด์ ภาษาไทย
ทำ infographic 1:1 เรื่อง AI in Healthcare
สร้าง consulting deck สำหรับ market-entry strategy 12 สไลด์
ทำ lesson deck เรื่อง factor investing พร้อมภาพรายสไลด์
```

The routing instructions in `AGENTS.md` tell the agent which local skill to load for each type of task.

## Skill Notes

- `create-slide-decks` is the default for full decks and PowerPoint outputs.
- `create-info-graphics` is the default for standalone images, square posts, and carousel-style visuals.
- `create-consulting-decks` is the default for management-consulting, executive, strategy, board, and recommendation decks.
- Image generation should create one finished slide/image at a time, not a contact sheet or multi-slide mockup.
- Final slide images should be inspected before being packaged into a PPTX.

## License

MIT
