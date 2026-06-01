const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const ROOT = path.resolve(__dirname, "..");
const project = process.argv[2];
const slideNo = Number(process.argv[3]);

if (!project || !Number.isInteger(slideNo) || slideNo < 1 || slideNo > 99) {
  console.error("Usage: node scripts/save_recent_imagegen_slide.js <project> <slide_no>");
  process.exit(2);
}

const generatedRoot =
  process.env.IMAGEGEN_SESSION_DIR ||
  path.join(process.env.HOME, ".codex", "generated_images");
const outDir = path.join(ROOT, "assets", "images", project);
const originalsDir = path.join(outDir, "originals");
const finalDir = path.join(outDir, "final");
fs.mkdirSync(originalsDir, { recursive: true });
fs.mkdirSync(finalDir, { recursive: true });

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(file);
    return /\.(png|jpg|jpeg|webp)$/i.test(entry.name) ? [file] : [];
  });
}

const latest = walk(generatedRoot)
  .map((file) => ({ file, mtime: fs.statSync(file).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime)[0];

if (!latest) {
  console.error(`No generated image found under ${generatedRoot}`);
  process.exit(1);
}

const name = `slide-${String(slideNo).padStart(2, "0")}.png`;
const originalOut = path.join(originalsDir, name);
const finalOut = path.join(finalDir, name);

fs.copyFileSync(latest.file, originalOut);

sharp(originalOut)
  .resize(1920, 1080, { fit: "cover", position: "center" })
  .png()
  .toFile(finalOut)
  .then(() => {
    console.log(`[OK] source ${latest.file}`);
    console.log(`[OK] original ${originalOut}`);
    console.log(`[OK] final ${finalOut}`);
  })
  .catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
