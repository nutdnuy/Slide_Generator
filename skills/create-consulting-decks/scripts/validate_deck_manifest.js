#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TOP_REQUIRED = [
  "project_name",
  "audience",
  "objective",
  "language",
  "aspect_ratio",
  "rendering_mode",
  "style",
  "slides",
];

const SLIDE_REQUIRED = [
  "slide_no",
  "role",
  "governing_message",
  "supporting_points",
  "evidence",
  "visual_type",
  "render_mode",
  "speaker_note",
  "source",
];

function usage() {
  console.error(
    "Usage: node validate_deck_manifest.js <manifest.json> [--root <workspace>] [--strict]"
  );
}

function parseArgs(argv) {
  const args = { manifest: null, root: process.cwd(), strict: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      args.root = path.resolve(argv[++i] || "");
    } else if (arg === "--strict") {
      args.strict = true;
    } else if (!args.manifest) {
      args.manifest = path.resolve(arg);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`Could not read JSON manifest at ${file}: ${err.message}`);
  }
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function normalizeMessage(message) {
  return String(message || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function resolveImagePath(slide, manifest, root) {
  const project = manifest.project_name || "deck";
  const slideNo = Number(slide.slide_no || 0);
  const defaultName = `slide-${String(slideNo).padStart(2, "0")}.png`;
  const candidates = [];

  if (slide.image_path) {
    if (path.isAbsolute(slide.image_path)) candidates.push(slide.image_path);
    candidates.push(path.resolve(root, slide.image_path));
  }

  candidates.push(path.resolve(root, "assets", "images", project, defaultName));
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function validateManifest(manifest, options) {
  const errors = [];
  const warnings = [];

  TOP_REQUIRED.forEach((field) => {
    if (!(field in manifest)) errors.push(`Missing top-level field: ${field}`);
    else if (isEmpty(manifest[field])) errors.push(`Empty top-level field: ${field}`);
  });

  if (manifest.rendering_mode && !["hybrid", "editable", "editable-first", "image-first"].includes(manifest.rendering_mode)) {
    warnings.push(`Unusual rendering_mode: ${manifest.rendering_mode}`);
  }

  if (manifest.aspect_ratio && manifest.aspect_ratio !== "16:9") {
    warnings.push(`Expected aspect_ratio "16:9" for this skill, got "${manifest.aspect_ratio}"`);
  }

  if (!Array.isArray(manifest.slides)) {
    errors.push("slides must be an array");
    return { errors, warnings };
  }

  const slideNos = new Set();
  const messages = new Map();

  manifest.slides.forEach((slide, index) => {
    const label = `slide[${index}]`;

    SLIDE_REQUIRED.forEach((field) => {
      if (!(field in slide)) {
        errors.push(`${label} missing field: ${field}`);
      } else if (isEmpty(slide[field])) {
        errors.push(`${label} empty field: ${field}`);
      }
    });

    if (!Number.isInteger(slide.slide_no) || slide.slide_no < 1) {
      errors.push(`${label} slide_no must be a positive integer`);
    } else if (slideNos.has(slide.slide_no)) {
      errors.push(`${label} duplicate slide_no: ${slide.slide_no}`);
    } else {
      slideNos.add(slide.slide_no);
    }

    const normalized = normalizeMessage(slide.governing_message);
    if (normalized) {
      if (messages.has(normalized)) {
        errors.push(`${label} duplicates governing_message from slide ${messages.get(normalized)}`);
      } else {
        messages.set(normalized, slide.slide_no || index + 1);
      }
    }

    if (slide.render_mode && !["editable", "image"].includes(slide.render_mode)) {
      errors.push(`${label} render_mode must be "editable" or "image"`);
    }

    if (["chart", "table", "financial-impact"].includes(slide.visual_type) && slide.render_mode === "image") {
      warnings.push(`${label} uses ${slide.visual_type} in image mode; exact numbers should normally be editable`);
    }

    if (slide.render_mode === "image") {
      const imagePath = resolveImagePath(slide, manifest, options.root);
      if (!imagePath || !fs.existsSync(imagePath)) {
        warnings.push(`${label} image mode but image file was not found: ${imagePath}`);
      }
    }

    if (typeof slide.governing_message === "string" && slide.governing_message.length > 135) {
      warnings.push(`${label} governing_message is long; consider a sharper takeaway title`);
    }
  });

  return { errors, warnings };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (err) {
    usage();
    console.error(`[ERROR] ${err.message}`);
    process.exit(2);
  }

  if (!args.manifest) {
    usage();
    process.exit(2);
  }

  const manifest = readJson(args.manifest);
  const { errors, warnings } = validateManifest(manifest, args);

  warnings.forEach((warning) => console.warn(`[WARN] ${warning}`));
  errors.forEach((error) => console.error(`[ERROR] ${error}`));

  if (errors.length || (args.strict && warnings.length)) {
    console.error(
      `[FAIL] ${errors.length} error(s), ${warnings.length} warning(s) in ${args.manifest}`
    );
    process.exit(1);
  }

  console.log(`[OK] Manifest valid: ${args.manifest}`);
  if (warnings.length) console.log(`[OK] ${warnings.length} warning(s) reported`);
}

if (require.main === module) {
  main();
}

module.exports = { validateManifest };
