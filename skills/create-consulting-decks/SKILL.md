---
name: create-consulting-decks
description: Create consulting-grade strategy, executive, board, recommendation, market-entry, case-interview, BCG-style, Big 4-style, McKinsey-style, Bain-style, or professional advisory decks. Use when the user asks for a consulting deck, strategy deck, executive presentation, board deck, recommendation deck, business case deck, issue-tree storyline, pyramid-principle slides, or polished management-consulting PowerPoint output.
---

# Create Consulting Decks

## Overview

Create consulting-grade decks that communicate a decision, recommendation, or strategic argument with sharp storyline, one-message slides, clear evidence, consistent visual grammar, and a final PowerPoint. Do not clone proprietary templates, logos, exact brand systems, or confidential firm styles; translate the request into original, consulting-grade presentation craft.

Default to **hybrid mode**: use editable PowerPoint shapes, text, tables, and charts for exact content; use image generation only for hero visuals, conceptual scenes, backgrounds, or non-critical imagery.

## Workflow

1. Clarify the brief before building: audience, decision to be made, objective, slide count, language, time limit, source/data availability, required format, and any brand constraints.
2. Build the storyline before visuals. Use recommendation-first logic when the answer is known; use hypothesis-driven SCQA when discovery is still needed.
3. Draft an outline where every slide has exactly one governing message. Avoid label titles like "Market Overview"; write takeaway titles like "Thailand's premium segment is large enough to support a focused entry."
4. Select slide archetypes by job-to-be-done: executive summary, issue tree, market map, options comparison, recommendation, financial impact, roadmap, risk, appendix.
5. Render in hybrid mode. Keep text, numbers, tables, and charts editable. Generate only visual-heavy slide images when text accuracy is not the core requirement.
6. QA the deck before final delivery: logic, evidence, readability, alignment, source notes, brand safety, and slide order.

## Resource Loading

Load only the references needed for the current request:

- `references/storyline-patterns.md` for SCQA, pyramid principle, issue trees, and recommendation-first flow.
- `references/slide-archetypes.md` when choosing slide roles and layouts.
- `references/visual-system.md` before rendering consulting-style slides.
- `references/qa-checklist.md` before final deck handoff.
- `references/image-prompts.md` before using image generation for slide visuals.

Use scripts when a manifest exists or when building repeatable outputs:

```bash
node skills/create-consulting-decks/scripts/validate_deck_manifest.js notes/<project-name>-consulting-deck.json
node skills/create-consulting-decks/scripts/build_pptx_from_manifest.js notes/<project-name>-consulting-deck.json
node skills/create-consulting-decks/scripts/render_institutional_deck_from_manifest.js notes/<project-name>-consulting-deck.json
```

Use `render_institutional_deck_from_manifest.js` when the user wants an institutional seminar / asset-management / boardroom PDF-like deck and visual polish matters more than editing every text box. It renders a background image layer, overlays exact manifest text/tables with the renderer, exports composed 16:9 slide images, and wraps them in a PPTX with speaker notes.

## Manifest Contract

Use `notes/<project-name>-consulting-deck.json` as the source of truth when possible.

Required top-level fields:

- `project_name`
- `audience`
- `objective`
- `language`
- `aspect_ratio` such as `16:9`
- `rendering_mode`, normally `hybrid`
- `style`, such as `boardroom`, `strategy`, `financial`, `operations`, or `startup-advisory`
- `slides`

Required slide fields:

- `slide_no`
- `role`
- `governing_message`
- `supporting_points`
- `evidence`
- `visual_type`
- `render_mode`
- `speaker_note`
- `source`

Optional slide fields supported by the builder:

- `subtitle` for a secondary headline in accent color.
- `image_path` for generated full-slide images.
- `background_path` or `background_image_path` for a generated/background-only image; the renderer crops it to 16:9 and overlays exact text, tables, metrics, footer, and notes from the manifest.
- `figure_panel` as `{ "path": "...", "title": "...", "caption": "...", "placement": "right|right_wide|wide|bottom" }` for real source figures, charts, screenshots, or photo panels. Use this for paper/framework/trading-result visuals instead of replacing them with generic icons.
- `table` as an array of rows for editable tables.
- `chart` as `{ "type": "bar", "labels": [], "values": [], "unit": "" }` for simple editable shape-based charts.
- `metrics` as `[{ "label": "...", "value": "...", "note": "..." }]`.
- `steps` as roadmap/path labels.
- `options` as `[{ "name": "...", "pros": [], "cons": [], "verdict": "..." }]`.
- `risks` as `[{ "risk": "...", "mitigation": "..." }]`.
- `deck_mark` at top level for the footer/cover mark, such as a project or deck name.
- `brand_theme` or `ci_theme` at top level for supported CI-inspired palettes such as `krungsri`. Use only public/inspired visual cues unless the user supplies brand guidelines.

## Rendering Rules

- Use `render_mode: "editable"` for slides with important text, exact numbers, charts, tables, compliance wording, or Thai copy.
- Use the institutional image renderer for final visual polish when editable shape output is not good enough; exact text still comes from the manifest, but slide content is flattened as images in PowerPoint.
- Prefer background-only generation for visual polish: generate or provide a 16:9 image without readable text/logos, then use `background_path` so headings, bullets, tables, numbers, and source notes are rendered exactly by the deck script.
- Prefer `figure_panel` when a paper, report, or source PDF has an actual framework figure, chart, screenshot, or result graphic that improves evidence quality. Crop only the relevant visual, keep the source named, and use renderer text for the explanatory caption.
- Use `render_mode: "image"` only for visual-heavy slides. Store accepted images at `assets/images/<project-name>/slide-01.png`, `slide-02.png`, etc.
- For image generation prompts, require `ONE single 16:9 finished presentation slide image`; reject contact sheets, multi-slide mockups, watermarks, malformed text, or clipped layout.
- Do not imitate a named consulting firm's confidential template. Use original layouts with consulting principles: strong headline, evidence zone, tight annotation, sparse color, disciplined grid.
- For institutional seminar decks, use `style: "institutional-finance"` to apply a navy/teal/gray system with cover slides, large sans-serif headlines, source discipline, and dense editable tables.
- Keep sources and assumptions visible in footers or speaker notes for business-critical claims.

## Delivery Checklist

Before final response:

1. Validate the manifest.
2. Build or update the PPTX in `outputs/<project-name>.pptx`.
3. Write or update `notes/<project-name>-outline.md`.
4. Open or inspect the generated deck enough to confirm slide order, file existence, and no obvious build failures.
5. Report the output paths and any limitations, especially missing data or image-generation tradeoffs.
