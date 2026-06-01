const fs = require("fs");
const path = require("path");
const sharp = require("/Users/nuthdanai/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const ROOT = path.resolve(__dirname, "..");
const PROJECT = "all-weather-risk-parity-quantseras-imagegen";
const slideNo = Number(process.argv[2]);

if (!Number.isInteger(slideNo) || slideNo < 1 || slideNo > 99) {
  console.error("Usage: node scripts/save_latest_imagegen_slide.js <slide_no>");
  process.exit(2);
}

const generatedRoot = process.env.IMAGEGEN_SESSION_DIR ||
  path.join(
    process.env.HOME,
    ".codex",
    "generated_images",
    "019e5ac8-ec7f-75d2-83da-6fd9e73966c3"
  );
const outDir = path.join(ROOT, "assets", "images", PROJECT);
const originalsDir = path.join(outDir, "originals");
const finalDir = path.join(outDir, "final");
fs.mkdirSync(originalsDir, { recursive: true });
fs.mkdirSync(finalDir, { recursive: true });

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(p);
    if (/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) return [p];
    return [];
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
    console.log(`[OK] saved ${latest.file}`);
    console.log(`[OK] original ${originalOut}`);
    console.log(`[OK] final ${finalOut}`);
  })
  .catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
