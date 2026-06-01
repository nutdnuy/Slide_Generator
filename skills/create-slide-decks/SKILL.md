---
name: create-slide-decks
description: Local Slide_Generator skill for creating complete presentation slide decks, PowerPoint decks, lesson decks, pitch decks, workshop decks, report decks, executive decks, and visual slide-by-slide PPTX outputs. Use when the user asks for slides, a deck, PowerPoint, PPTX, presentation, lesson slides, or a multi-slide narrative.
---

# Create Slide Decks

Use this local skill for full presentation decks in this workspace only.

## Scope

Create a coherent multi-slide presentation with a clear storyline, one message per slide, generated or rendered slide visuals, and a final `.pptx` when requested or implied.

Default output locations:

- `outputs/<project-name>.pptx`
- `assets/images/<project-name>/slide-01.png`, `slide-02.png`, ...
- `notes/<project-name>-outline.md`
- `notes/<project-name>-plan.json` when useful for regeneration

## Workflow

1. Parse or assume the brief: topic, audience, objective, slide count, language, style, and aspect ratio.
2. Before generating any slide visuals, ask the user to choose the text workflow unless they already specified it clearly:
   - `Image with baked-in text`: generate each slide image with the final visible text already inside the image.
   - `Image first, text later`: generate visual/background images first, then add exact editable text later in PowerPoint or another renderer.
3. Default to `Image with baked-in text` only when the user has explicitly asked for image + text in the generated slide image, or when they confirm that choice. If the user does not answer and the task is not time-sensitive, wait for the choice because this materially affects output quality and editability.
4. Write an outline before generating visuals. Each slide must have one governing message and a clear role such as hook, problem, concept, example, proof, exercise, action, or summary.
5. Choose the rendering mode:
   - Use image-generator-first mode when the user asks for visual slides, cinematic slides, image slides, background plus content, or "generate image + text".
   - Use editable/hybrid PowerPoint mode when the user chooses `Image first, text later`, or when exact text, tables, numbers, Thai copy, or compliance wording matter more than visual richness.
6. Generate or render one slide at a time. For image generation, prompt for `ONE single 16:9 finished presentation slide image` unless the user specifies another aspect ratio.
7. Store accepted slide images in `assets/images/<project-name>/`.
8. Build the `.pptx` with consistent slide size and correct slide order.
9. QA before final delivery: spelling, readability, no clipped text, no visual overlap, consistent style, correct order, and file existence.

## Image Generation Rules

- Generate one full-slide image per slide, never a contact sheet or multi-slide mockup.
- Always resolve the text workflow before image generation: ask whether to bake text into the generated image or add text afterward as editable overlay text, unless the user already made the choice.
- When the user chooses baked-in text or asks for image + text, text must be generated inside the slide image itself. Do not generate a background/PNG first and add text afterward in PowerPoint, SVG, HTML, Canvas, Python, or another renderer unless the user explicitly chooses that workflow.
- When the user chooses text later, generate text-safe visual space and keep the image free of final copy except intentional labels that the user approved.
- Keep on-image text short, large, and presentation-safe.
- Reject and regenerate images with malformed text, fake logos, watermarks, cropped layouts, or unreadable labels.
- If text accuracy is critical but the user still asks for baked-in image text, reduce the amount of copy, split content across more slides, simplify labels, or regenerate. Do not silently switch to background-only generation plus overlay text.
- Use background-only generation plus exact overlay text only when the user explicitly approves that tradeoff or asks for editable/hybrid PowerPoint.
- Use generated images only as accepted production assets after visual inspection.

## Deck Quality Rules

- One main message per slide.
- Story flow must be clear before visual production starts.
- Use visuals to explain the idea, not to fill empty space.
- Keep layout, typography, color, and spacing consistent across the deck.
- For teaching decks, prioritize learning sequence, examples, and memory cues.
- For business decks, prioritize crisp evidence, fast scanning, and credibility.

## Delivery Checklist

Before responding:

1. Confirm output files exist.
2. Confirm slide count and aspect ratio when a `.pptx` is built.
3. Inspect representative slides or a contact sheet.
4. Report the key output paths and any limitations.
