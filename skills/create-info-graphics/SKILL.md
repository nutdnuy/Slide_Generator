---
name: create-info-graphics
description: Local Slide_Generator skill for creating standalone infographics, square info posts, carousel visuals, social explainers, one-page visual summaries, and image-first information graphics. Use when the user asks for info, infographic, carousel, square posts, 1:1 visuals, story images, or a small set of standalone visual explainers rather than a full PowerPoint deck.
---

# Create Info Graphics

Use this local skill for standalone information graphics in this workspace only.

## Scope

Create a small set of visual explainers that can stand alone as images. This is not a full slide deck unless the user explicitly asks to package the images into PowerPoint.

Default output locations:

- `assets/images/<project-name>/final/info-01.png`, `info-02.png`, ...
- `assets/images/<project-name>/originals/info-01.png`, `info-02.png`, ...
- `assets/images/<project-name>/contact-sheet.png`
- `notes/<project-name>-outline.md` or `notes/<project-name>-plan.json` when useful

## Workflow

1. Parse or assume the brief: topic, audience, number of info images, language, visual style, and aspect ratio.
2. Before generating any infographic visuals, ask the user to choose the text workflow unless they already specified it clearly:
   - `Image with baked-in text`: generate each final image with the visible text already inside the image.
   - `Image first, text later`: generate visual/background images first, then add exact editable text afterward in a renderer or layout tool.
3. Default to `Image with baked-in text` only when the user has explicitly asked for image + text in the generated image, or when they confirm that choice. If the user does not answer and the task is not time-sensitive, wait for the choice because this materially affects output quality and editability.
4. Build a concise visual story arc before generating images. Each image should communicate one idea and work independently.
5. Choose format:
   - Default to `1:1` when the user says info, infographic, carousel, square, post, or social visual.
   - Use the user-specified size when provided.
6. Generate one image at a time using the image generator. Prompt for `ONE single 1:1 finished infographic image` for square output.
7. Keep text short and use the image as the main storytelling device. If the user chooses baked-in text or asks for image + text, the text must be part of the generated image itself.
8. Store accepted images under `assets/images/<project-name>/final/` and keep copied originals under `originals/`.
9. Build a contact sheet for review and inspect it before final delivery.

## Visual Style Rules

- Avoid generic AI-poster styling unless the user asks for it.
- Prefer coherent editorial, social, educational, or brand-like systems with consistent color, type hierarchy, and spacing.
- Use dark, light, premium, playful, or cinematic styles only when they fit the brief.
- Avoid fake logos, fake brands, watermarks, malformed text, and excessive decorative glow.
- If the user asks for a less AI-looking result, use restrained layouts, natural spacing, muted palettes, simpler illustration, and less 3D/gloss.

## Text Rules

- Always resolve the text workflow before image generation: ask whether to bake text into the generated image or add text afterward as editable overlay text, unless the user already made the choice.
- Use short English or Thai labels based on the brief.
- Avoid long paragraphs inside generated images.
- When the user chooses baked-in text or asks for image + text, do not generate a background image and add text afterward in a separate renderer unless the user explicitly chooses that workflow.
- When the user chooses text later, generate text-safe visual space and keep the image free of final copy except intentional labels that the user approved.
- If generated text is inaccurate, simplify the copy, split the story into more images, or regenerate. Do not silently switch to overlay text.
- Check spelling visually after generation.
- Regenerate if text is garbled, clipped, overlapping, or too small.

## Delivery Checklist

Before responding:

1. Confirm each final image exists.
2. Confirm image dimensions match the requested ratio and size.
3. Inspect the contact sheet for consistency and readability.
4. Report the final image folder and contact sheet path.
